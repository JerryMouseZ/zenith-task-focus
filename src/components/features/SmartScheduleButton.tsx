
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Brain } from "lucide-react";
import { Task } from "@/types/task";
import { useProfile } from "@/hooks/useProfile";

interface SmartScheduleButtonProps {
  task: Task;
  className?: string;
}

export const SmartScheduleButton = ({ task, className }: SmartScheduleButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const user_id = profile?.id;

  const handleSchedule = async () => {
    if (!user_id) {
      toast.error("请先登录后再调度任务！");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://tvbeublfxllikjdcmhuy.supabase.co/functions/v1/smart-task-schedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user_id,
            task_id: task.id,
            title: task.title,
            description: task.description,
            due_date: task.dueDate?.toISOString(),
            estimated_time: task.estimatedTime,
            isFixedTime: task.isFixedTime,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          <div>
            智能调度失败：{data.error}
            {data.debug && (
              <details className="text-xs text-red-600 mt-2">
                <summary>查看调试信息</summary>
                <pre className="whitespace-pre-wrap">{JSON.stringify(data.debug, null, 2)}</pre>
              </details>
            )}
          </div>
        );
      } else {
        toast.success(
          <div>
            <div>已成功为「{task.title}」智能规划专注块共 <b>{data.created_blocks?.filter((b:any) => b.type==="focus").length || 0}</b> 个！</div>
            {data.created_blocks?.length > 0 && (
              <details className="text-xs mt-1">
                <summary>查看分配详情</summary>
                <pre className="whitespace-pre-wrap">{JSON.stringify(data.created_blocks, null, 2)}</pre>
              </details>
            )}
          </div>
        );
      }
    } catch (err: any) {
      toast.error("网络错误或服务异常，无法调度任务");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className={"flex items-center gap-1 " + (className || "")}
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        handleSchedule();
      }}
      title="为该任务生成智能专注块"
    >
      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Brain className="w-4 h-4" />}
      智能调度
    </Button>
  );
};
