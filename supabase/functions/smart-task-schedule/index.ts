import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// 各优先级对应的缓冲时间（毫秒）
const PRIORITY_BUFFER = {
  high: 2 * 60 * 60 * 1000,    // high 优先级提前2小时
  medium: 1 * 60 * 60 * 1000,  // medium 优先级提前1小时
  low: 0                      // low 可临近截止
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // 初始化 supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
    );

    const body = await req.json();
    const { title, description, due_date, estimated_time, isFixedTime, ...rest } = body;
    let { priority } = body;

    // 1. 关键词优先级判定
    // 若AI未判定优先级，这里兜底
    const highKeywords = ["紧急", "重要", "立刻", "ASAP", "必须完成", "优先"];
    const lowKeywords = ["有空时", "考虑", "以后"];
    const text = `${title || ''} ${description || ''}`;
    if (highKeywords.some(k => text.includes(k))) {
      priority = 'high';
    } else if (lowKeywords.some(k => text.includes(k))) {
      priority = 'low';
    } else if (!priority) {
      priority = 'medium';
    }

    // 2. 时间敏感度提升优先级
    let debug = { priorityBefore: priority };
    if (due_date) {
      const now = Date.now();
      const due = new Date(due_date).getTime();
      const diff = due - now;
      if (diff <= 24 * 60 * 60 * 1000) {
        priority = 'high';
      } else if (diff <= 3 * 24 * 60 * 60 * 1000 && priority !== 'high') {
        priority = 'medium';
      }
      debug.priorityAfterDue = priority;
    }

    // 3. 自动计算 start_time，确保类型安全，异常兜底
    let start_time: string | null = null;
    let start_time_reason = '';
    if (typeof estimated_time === 'number' && due_date) {
      const buffer = PRIORITY_BUFFER[priority] ?? 0;
      const due = new Date(due_date).getTime();
      const duration = estimated_time * 60 * 1000;
      let candidate = due - duration - buffer;
      // 不能早于当前时间
      const now = Date.now();
      if (candidate < now) {
        candidate = now;
        start_time_reason = 'buffer过大，已提前到当前时间';
      }
      // 不能晚于 due_date - duration
      if (candidate > due - duration) {
        candidate = due - duration;
        start_time_reason = 'buffer为0，start_time紧贴due_date';
      }
      start_time = new Date(candidate).toISOString();
    } else {
      start_time_reason = '缺少 estimated_time 或 due_date，无法自动调度';
    }

    // 4. 调用数据库函数避免冲突（假设已存在RPC）
    let adjusted = { start_time };
    let rpc_debug = null;
    if (start_time && !isFixedTime) {
      const { data, error } = await supabase.rpc('adjust_task_times_on_insert', {
        start_time_arg: start_time,
        estimated_time_arg: estimated_time,
        priority_arg: priority
      });
      if (!error && data && data.start_time) {
        adjusted.start_time = data.start_time;
        rpc_debug = data;
      }
    }

    // 5. 返回处理结果，包含 debug 信息
    return new Response(JSON.stringify({
      ...body,
      priority,
      start_time: adjusted.start_time,
      debug: {
        ...debug,
        start_time_reason,
        rpc_debug
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
