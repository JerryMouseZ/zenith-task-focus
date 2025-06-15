
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function WorkPreferencesForm() {
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [focusDuration, setFocusDuration] = useState(45);
  const [breakDuration, setBreakDuration] = useState(15);
  const [buffer, setBuffer] = useState(10);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "work_start_time, work_end_time, focus_duration_minutes, break_duration_minutes, planning_buffer_minutes"
        )
        .eq("id", user.id)
        .single();
      if (data) {
        setWorkStart(data.work_start_time?.slice(0,5) ?? "09:00");
        setWorkEnd(data.work_end_time?.slice(0,5) ?? "18:00");
        setFocusDuration(data.focus_duration_minutes ?? 45);
        setBreakDuration(data.break_duration_minutes ?? 15);
        setBuffer(data.planning_buffer_minutes ?? 10);
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // 拼接为ISO时间字符串+08:00（假设仅用时分）
    const pad = (s: string) => (s.length === 5 ? s + ":00+08:00" : s);
    const updates = {
      id: user.id,
      work_start_time: pad(workStart),
      work_end_time: pad(workEnd),
      focus_duration_minutes: focusDuration,
      break_duration_minutes: breakDuration,
      planning_buffer_minutes: buffer,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    setLoading(false);
    if (!error) {
      toast({ title: "保存成功", description: "工作偏好已更新", duration: 3000 });
    } else {
      toast({ title: "保存失败", description: error.message, variant: "destructive" });
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      <div>
        <h4 className="text-sm font-medium">工作偏好设置</h4>
        <p className="text-sm text-muted-foreground">智能任务规划将基于你的规则制定日程</p>
      </div>
      <div className="flex gap-6">
        <div>
          <Label htmlFor="workStart">工作开始时间</Label>
          <Input
            id="workStart"
            type="time"
            value={workStart}
            onChange={e => setWorkStart(e.target.value)}
            className="w-28"
            required
          />
        </div>
        <div>
          <Label htmlFor="workEnd">工作结束时间</Label>
          <Input
            id="workEnd"
            type="time"
            value={workEnd}
            onChange={e => setWorkEnd(e.target.value)}
            className="w-28"
            required
          />
        </div>
      </div>
      <div className="flex gap-6">
        <div>
          <Label htmlFor="focusDuration">专注块时长(分钟)</Label>
          <Input
            id="focusDuration"
            type="number"
            min={15}
            max={180}
            step={5}
            value={focusDuration}
            onChange={e => setFocusDuration(Number(e.target.value))}
            className="w-28"
            required
          />
        </div>
        <div>
          <Label htmlFor="breakDuration">休息时长(分钟)</Label>
          <Input
            id="breakDuration"
            type="number"
            min={5}
            max={60}
            step={5}
            value={breakDuration}
            onChange={e => setBreakDuration(Number(e.target.value))}
            className="w-28"
            required
          />
        </div>
        <div>
          <Label htmlFor="bufferDuration">任务间缓冲(分钟)</Label>
          <Input
            id="bufferDuration"
            type="number"
            min={0}
            max={60}
            step={1}
            value={buffer}
            onChange={e => setBuffer(Number(e.target.value))}
            className="w-28"
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-32">
        {loading ? "保存中..." : "保存"}
      </Button>
    </form>
  );
}
