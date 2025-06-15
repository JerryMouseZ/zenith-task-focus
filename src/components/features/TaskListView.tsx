import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Calendar, Clock, Tag, Tags, Lock, Brain, Loader2 } from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { SmartScheduleButton } from "./SmartScheduleButton";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

interface TaskListViewProps {
  onTaskClick: (task: Task) => void;
}

export const TaskListView = ({ onTaskClick }: TaskListViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const { tasks, isLoading, updateTask } = useTasks();
  const { profile } = useProfile();
  const user_id = profile?.id;

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)));

  // 只显示未完成的任务
  const filteredTasks = tasks.filter(task => !task.completed).filter(task => {
    // Enhanced search to include tag searching
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTags;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const handleTaskStatusToggle = (task: Task) => {
    const isCompleting = !(task.completed || task.status === TaskStatus.COMPLETED);
    updateTask({
      id: task.id,
      updates: {
        status: isCompleting ? TaskStatus.COMPLETED : TaskStatus.TODO,
        completed: isCompleting,
      }
    });
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 border-red-200";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case TaskStatus.IN_PROGRESS:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case TaskStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-200";
      case TaskStatus.OVERDUE:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "待办";
      case TaskStatus.IN_PROGRESS:
        return "进行中";
      case TaskStatus.COMPLETED:
        return "已完成";
      case TaskStatus.OVERDUE:
        return "已逾期";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "低";
      case TaskPriority.MEDIUM:
        return "中";
      case TaskPriority.HIGH:
        return "高";
      default:
        return priority;
    }
  };

  // 批量调度所有任务的函数
  const handleBatchSmartSchedule = async () => {
    if (!user_id) {
      toast.error("请先登录后再批量调度任务！");
      return;
    }
    setBatchLoading(true);

    let successCount = 0;
    let failCount = 0;

    for (const task of filteredTasks) {
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
          failCount++;
          toast.error(
            <div>
              任务「{task.title}」调度失败：{data.error}
              {data.debug && (
                <details className="text-xs text-red-600 mt-2">
                  <summary>查看调试信息</summary>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(data.debug, null, 2)}</pre>
                </details>
              )}
            </div>
          );
        } else {
          successCount++;
          toast.success(
            <div>
              <div>已成功为「{task.title}」生成 <b>{data.created_blocks?.filter((b:any) => b.type==="focus").length || 0}</b> 个专注块！</div>
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
        failCount++;
        toast.error("网络错误或服务异常，无法调度任务「" + task.title + "」");
      }
    }

    toast.info(`全部调度完成（成功 ${successCount} 个，失败 ${failCount} 个）`);
    setBatchLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters 与批量智能调度按钮 */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜索任务或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* 新增：全部智能调度按钮 */}
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleBatchSmartSchedule}
            disabled={batchLoading || filteredTasks.length === 0}
            title="为当前列表的所有任务执行智能调度"
          >
            {batchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            全部智能调度
          </Button>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value={TaskStatus.TODO}>待办</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS}>进行中</SelectItem>
              <SelectItem value={TaskStatus.COMPLETED}>已完成</SelectItem>
              <SelectItem value={TaskStatus.OVERDUE}>已逾期</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有优先级</SelectItem>
              <SelectItem value={TaskPriority.HIGH}>高</SelectItem>
              <SelectItem value={TaskPriority.MEDIUM}>中</SelectItem>
              <SelectItem value={TaskPriority.LOW}>低</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tags className="w-4 h-4 mr-2" />
                标签
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>按标签筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  暂无标签
                </div>
              )}
              {selectedTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={clearTagFilters}
                  >
                    清除所有标签
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active tag filters display */}
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">已选择标签:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagToggle(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onTaskClick(task)}>
            <div className="flex items-start gap-4">
              <Checkbox 
                checked={task.status === TaskStatus.COMPLETED}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskStatusToggle(task);
                }}
                className="mt-1"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    {task.isFixedTime && (
                      <div className="flex items-center" title="固定时间任务">
                        <Lock className="w-4 h-4 text-amber-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    {/* 智能调度按钮 */}
                    <SmartScheduleButton task={task} />
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {task.dueDate.toLocaleDateString()}
                    </div>
                  )}
                  
                  {task.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.estimatedTime}分钟
                    </div>
                  )}
                  
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <div className="flex gap-1">
                        {task.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {tasks.length === 0 ? "暂无任务，点击新建任务开始。" : "没有找到匹配条件的任务。"}
          </p>
        </Card>
      )}
    </div>
  );
};
