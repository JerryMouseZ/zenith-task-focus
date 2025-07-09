
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Tag, Wand2, X, CheckCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TaskDetailModal } from "./TaskDetailModal";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useProfile } from "@/hooks/useProfile";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { toast } from "sonner";

interface QuickAddCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddCommand = ({ isOpen, onClose }: QuickAddCommandProps) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<Partial<Task>[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isMultiple, setIsMultiple] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const { profile } = useProfile();
  const { createTask } = useTaskOperations();

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
          },
          timezone: profile?.timezone
        }
      });

      if (error) throw error;

      if (data.success) {
        const fixDate = (v: any) => (typeof v === 'string' ? new Date(v) : v);
        
        const formatTask = (taskData: any) => ({
          ...taskData,
          status: TaskStatus.TODO,
          priority: taskData.priority as TaskPriority,
          startTime: taskData.startTime ? fixDate(taskData.startTime) : undefined,
          dueDate: taskData.dueDate ? fixDate(taskData.dueDate) : undefined,
          endTime: taskData.endTime ? fixDate(taskData.endTime) : undefined,
          recurrence_end_date: taskData.recurrence_end_date ? fixDate(taskData.recurrence_end_date) : undefined,
          contextTags: taskData.contextTags || [],
          energyLevel: taskData.energyLevel || 'medium',
          tags: taskData.tags || [],
        });

        if (data.isMultiple && data.tasks) {
          // 处理多任务
          const tasks = data.tasks.map(formatTask);
          setParsedTasks(tasks);
          setSelectedTasks(new Set(tasks.map((_, index) => index))); // 默认选中所有任务
          setIsMultiple(true);
        } else {
          // 处理单任务
          const task = formatTask(data.task);
          setParsedTasks([task]);
          setSelectedTasks(new Set([0]));
          setIsMultiple(false);
        }
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

  const handleTaskSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleCreateSelectedTasks = async () => {
    const tasksToCreate = Array.from(selectedTasks).map(index => parsedTasks[index]);
    
    if (tasksToCreate.length === 0) {
      toast.error('请至少选择一个任务');
      return;
    }

    try {
      for (const task of tasksToCreate) {
        await createTask(task as Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
      }
      
      toast.success(`成功创建 ${tasksToCreate.length} 个任务`);
      handleClose();
    } catch (error) {
      console.error('Error creating tasks:', error);
      toast.error('创建任务失败，请重试');
    }
  };

  const handleEditTask = (index: number) => {
    setCurrentTaskIndex(index);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setCurrentTaskIndex(null);
  };

  const handleClose = () => {
    setParsedTasks([]);
    setSelectedTasks(new Set());
    setIsMultiple(false);
    setPrompt("");
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              智能任务创建
            </DialogTitle>
          </DialogHeader>
          
          {parsedTasks.length === 0 ? (
            // 输入界面
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  用自然语言描述你的任务
                </label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="例如：星期五之前完成1. OS作业cp1的更多测试 2. OS作业cp2死锁的debug.消耗精力高，重要程度高"
                  className="text-base"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  AI将自动解析任务标题、时间、优先级和标签等信息。支持多任务解析（如"1. 任务一 2. 任务二"）
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                  取消
                </Button>
                <Button onClick={handleParseTask} disabled={isLoading || !prompt.trim()}>
                  {isLoading ? "解析中..." : "解析任务"}
                </Button>
              </div>
            </div>
          ) : (
            // 任务预览界面
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {isMultiple ? `解析到 ${parsedTasks.length} 个任务` : '解析到 1 个任务'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    请检查并选择要创建的任务，或点击编辑修改任务详情
                  </p>
                </div>
                <Button variant="outline" onClick={() => setParsedTasks([])}>
                  重新输入
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedTasks.map((task, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTasks.has(index)}
                        onCheckedChange={(checked) => handleTaskSelect(index, checked as boolean)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-base">{task.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(index)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            编辑
                          </Button>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(task.priority || 'medium')}>
                            {task.priority === 'urgent' ? '紧急' : 
                             task.priority === 'high' ? '高' :
                             task.priority === 'medium' ? '中' : '低'}优先级
                          </Badge>
                          
                          <Badge className={getEnergyColor(task.energyLevel || 'medium')}>
                            {task.energyLevel === 'high' ? '高' :
                             task.energyLevel === 'medium' ? '中' : '低'}能量
                          </Badge>

                          {task.estimatedTime && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimatedTime}分钟
                            </Badge>
                          )}

                          {task.dueDate && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate.toLocaleDateString()}
                            </Badge>
                          )}
                        </div>

                        {(task.tags && task.tags.length > 0) || (task.contextTags && task.contextTags.length > 0) ? (
                          <div className="flex flex-wrap gap-1">
                            {task.tags?.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {task.contextTags?.map(contextTag => (
                              <Badge key={contextTag} variant="outline" className="text-xs">
                                {contextTag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  已选择 {selectedTasks.size} / {parsedTasks.length} 个任务
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    取消
                  </Button>
                  <Button 
                    onClick={handleCreateSelectedTasks}
                    disabled={selectedTasks.size === 0}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    创建 {selectedTasks.size} 个任务
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showTaskForm && currentTaskIndex !== null && (
        <TaskDetailModal
          task={null}
          initialTask={parsedTasks[currentTaskIndex]}
          isOpen={showTaskForm}
          onClose={handleCloseTaskForm}
        />
      )}
    </>
  );
};
