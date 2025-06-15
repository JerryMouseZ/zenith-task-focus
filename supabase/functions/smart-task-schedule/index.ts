
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// 工具函数，将 "HH:mm" 加入日期，返回 ISO 字符串
function buildDateTime(date: Date, time: string) {
  const [h, m, s] = time.split(":");
  const dt = new Date(date);
  dt.setHours(Number(h), Number(m), s ? Number(s) : 0, 0);
  return dt.toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 初始化 supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` } } }
    );

    const body = await req.json();
    const { user_id, task_id, title, description, due_date, estimated_time, isFixedTime } = body;
    if (!user_id || !task_id || !estimated_time) {
      return new Response(JSON.stringify({ error: "缺少 user_id、task_id 或 estimated_time" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

    // 获取用户工作偏好参数
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("work_start_time, work_end_time, focus_duration_minutes, break_duration_minutes, planning_buffer_minutes, timezone")
      .eq("id", user_id)
      .single();
    if (profileErr) {
      return new Response(JSON.stringify({ error: "获取用户工作偏好失败: " + profileErr.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }

    // 解析用户偏好
    const workStartStr = profile.work_start_time ? profile.work_start_time : "09:00:00";
    const workEndStr = profile.work_end_time ? profile.work_end_time : "18:00:00";
    const focusBlockMinutes = profile.focus_duration_minutes || 45;
    const breakBlockMinutes = profile.break_duration_minutes || 15;
    const bufferMinutes = profile.planning_buffer_minutes || 10;

    // 本次只调度到 due_date 的当天
    const due = due_date ? new Date(due_date) : new Date();
    const targetDate = due; // 简单起见仅支持当天
    // 工作区间区间
    const workStartTimeIso = buildDateTime(targetDate, workStartStr.slice(0, 5));
    const workEndTimeIso = buildDateTime(targetDate, workEndStr.slice(0, 5));
    const workStart = new Date(workStartTimeIso);
    const workEnd = new Date(workEndTimeIso);

    // 查询当天已存在的 scheduled_blocks（避免冲突）
    const { data: blockList, error: blockErr } = await supabase
      .from("scheduled_blocks")
      .select("*")
      .eq("user_id", user_id)
      .gte("start_time", workStart.toISOString())
      .lte("end_time", workEnd.toISOString())
      .order("start_time", { ascending: true });
    if (blockErr) {
      return new Response(JSON.stringify({ error: "获取已存在专注块失败: " + blockErr.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }

    // 计算所有可用时间段
    // 假设工作区间全空闲，依次排除 block 被占用的区间，得到 slots
    let slots: { start: Date, end: Date }[] = [];
    if (!blockList || blockList.length === 0) {
      slots = [{ start: workStart, end: workEnd }];
    } else {
      let last = workStart;
      for (const b of blockList) {
        const bStart = new Date(b.start_time);
        if (bStart > last) {
          slots.push({ start: last, end: bStart });
        }
        last = new Date(b.end_time);
      }
      if (last < workEnd) {
        slots.push({ start: last, end: workEnd });
      }
    }

    // 分割任务为多个专注块+中间插休息块
    let remainMinutes = estimated_time;
    let createdBlocks: any[] = [];
    let debug = { slots, step: "block-split", tried: [] as any[] };
    let slotIndex = 0;

    while (remainMinutes > 0 && slotIndex < slots.length) {
      let { start, end } = slots[slotIndex];
      let slotMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

      let focusThisSlot = Math.min(focusBlockMinutes, slotMinutes, remainMinutes);
      if (focusThisSlot < 15) { // 避免过碎
        slotIndex++;
        continue;
      }

      // 安排一个专注块
      const focusStart = new Date(start);
      const focusEnd = new Date(focusStart.getTime() + focusThisSlot * 60000);

      createdBlocks.push({
        user_id, task_id, type: "focus", status: "scheduled",
        start_time: focusStart.toISOString(), end_time: focusEnd.toISOString()
      });

      debug.tried.push({ focusStart: focusStart.toISOString(), focusEnd: focusEnd.toISOString() });

      remainMinutes -= focusThisSlot;

      // 插入休息块（最后一块不插，slot不够跳出）
      if (remainMinutes > 0) {
        let breakStart = new Date(focusEnd);
        let breakEnd = new Date(breakStart.getTime() + breakBlockMinutes * 60000);
        // 若 break 会溢出本slot，则省略该 slot 剩余时间，跳到下一个 slot
        if (breakEnd > end) {
          slotIndex++;
          continue;
        }
        createdBlocks.push({
          user_id, task_id, type: "break", status: "scheduled",
          start_time: breakStart.toISOString(), end_time: breakEnd.toISOString()
        });
        // 同步推进slot指针
        slots[slotIndex].start = breakEnd;
      } else {
        // 任务已分配完!
        break;
      }
    }

    // 持久化写入所有 createdBlocks
    if (createdBlocks.length > 0) {
      // bulk insert
      const { error: insertErr } = await supabase
        .from("scheduled_blocks")
        .insert(createdBlocks);
      if (insertErr) {
        return new Response(JSON.stringify({ error: "批量插入 scheduled_blocks 失败: " + insertErr.message, debug }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
      }
    } else {
      return new Response(JSON.stringify({ error: "无可用时段插入专注块，建议调整工作区间或已有任务！", debug }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

    // 返回结果
    return new Response(JSON.stringify({
      created_blocks: createdBlocks,
      remain_minutes: remainMinutes,
      debug
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
