
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Tag, Wand2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TaskDetailModal } from "./TaskDetailModal";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface QuickAddCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddCommand = ({ isOpen, onClose }: QuickAddCommandProps) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTask, setParsedTask] = useState<Partial<Task> | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { profile } = useProfile();

  const handleParseTask = async () => {
    if (!prompt.trim()) {
      toast.error('请输入任务描述');
      return;
    }

    if (!profile?.ai_api_key || !profile?.ai_base_url || !profile?.ai_model) {
      toast.error('请先在设置页面配置AI参数');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-task-with-ai', {
        body: {
          prompt,
          aiConfig: {
            apiKey: profile.ai_api_key,
            baseUrl: profile.ai_base_url,
            model: profile.ai_model
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        const task = {
          ...data.task,
          status: TaskStatus.TODO,
          priority: data.task.priority as TaskPriority,
        };
        setParsedTask(task);
        setShowTaskModal(true);
        onClose();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error parsing task:', error);
      toast.error('解析任务失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParseTask();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              智能任务创建
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                用自然语言描述你的任务
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如：明天下午三点提醒我和张三开会讨论项目规划"
                className="text-base"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                AI将自动解析任务标题、时间、优先级和标签等信息
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                取消
              </Button>
              <Button onClick={handleParseTask} disabled={isLoading || !prompt.trim()}>
                {isLoading ? "解析中..." : "创建任务"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {parsedTask && (
        <TaskDetailModal
          task={parsedTask as Task}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setParsedTask(null);
            setPrompt("");
          }}
        />
      )}
    </>
  );
};
