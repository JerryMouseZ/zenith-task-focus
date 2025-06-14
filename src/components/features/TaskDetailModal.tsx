import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Tag, CheckCircle, Circle, Trash, Lock, Plus, X } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Partial<Task>;
}

export const TaskDetailModal = ({ task, isOpen, onClose, parentId, initialTask }: TaskDetailModalProps & { parentId?: string }) => {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  // 新增本地 state 管理天和小时
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const { createTask, updateTask, deleteTask, isCreating, isUpdating, isDeleting, useChildTasks } = useTasks();

  // 获取子任务
  const { data: childTasks = [], refetch: refetchChildTasks } = useChildTasks(task?.id || "");

  // 关键修复：监听子任务弹窗关闭后刷新子任务列表
  useEffect(() => {
    if (!showSubtaskModal && isOpen && task) {
      refetchChildTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSubtaskModal, isOpen, task]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setEditedTask(task);
        setIsEditing(false);
        // 初始化天和小时
        setEstimatedDays(task.estimatedTime ? Math.floor(task.estimatedTime / 1440) : 0);
        setEstimatedHours(task.estimatedTime ? Math.floor((task.estimatedTime % 1440) / 60) : 0);
      } else if (initialTask) {
        setEditedTask({
          ...{
            title: "",
            description: "",
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.TODO,
            tags: [],
            subtasks: [],
            isFixedTime: false,
            parentId: parentId || undefined,
            recurrence: 'none',
            recurrence_end_date: undefined,
          },
          ...initialTask
        });
        setEstimatedDays(initialTask.estimatedTime ? Math.floor(initialTask.estimatedTime / 1440) : 0);
        setEstimatedHours(initialTask.estimatedTime ? Math.floor((initialTask.estimatedTime % 1440) / 60) : 0);
        setIsEditing(true);
      } else {
        // New task
        setEditedTask({
          title: "",
          description: "",
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TODO,
          tags: [],
          subtasks: [],
          isFixedTime: false,
          parentId: parentId || undefined,
          recurrence: 'none',
          recurrence_end_date: undefined,
        });
        setEstimatedDays(0);
        setEstimatedHours(0);
        setIsEditing(true);
      }
    } else {
      setIsEditing(false);
    }
  }, [task, isOpen, parentId, initialTask]);

  const handleSave = async () => {
    if (!editedTask.title?.trim()) {
      toast.error('请输入任务标题');
      return;
    }

    // 存储前将 estimatedDays/estimatedHours 合成为 estimatedTime
    const estimatedTime = estimatedDays * 1440 + estimatedHours * 60;
    const taskToSave = { ...editedTask, estimatedTime };

    try {
      if (task) {
        // Update existing task
        updateTask({ id: task.id, updates: taskToSave });
      } else {
        // Create new task
        createTask(taskToSave as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };


  const handleDelete = async () => {
    if (task && window.confirm('确定要删除这个任务吗？')) {
      try {
        deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCancel = () => {
    if (task) {
      setEditedTask(task);
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTask.tags?.includes(newTag.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...(editedTask.tags || []), newTag.trim()]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  // 子任务添加弹窗已替代原有逻辑，无需此函数

  const priorityColors = {
    [TaskPriority.LOW]: "bg-green-100 text-green-800",
    [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800", 
    [TaskPriority.HIGH]: "bg-red-100 text-red-800"
  };

  const statusOptions = [
    { value: TaskStatus.TODO, label: "待办" },
    { value: TaskStatus.IN_PROGRESS, label: "进行中" },
    { value: TaskStatus.COMPLETED, label: "已完成" },
  ];

  const priorityOptions = [
    { value: TaskPriority.LOW, label: "低" },
    { value: TaskPriority.MEDIUM, label: "中" },
    { value: TaskPriority.HIGH, label: "高" }
  ];

  // 新增：详情页直接勾选“标记为已完成”
  const handleToggleCompleted = (checked: boolean) => {
    if (task) {
      updateTask({ id: task.id, updates: { completed: checked } });
      setEditedTask(prev => ({ ...prev, completed: checked }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? "任务详情" : "新建任务"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              任务标题 *
            </label>
            {isEditing ? (
              <Input
                value={editedTask.title || ""}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="输入任务标题..."
                className="text-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{editedTask.title}</h2>
                {editedTask.isFixedTime && (
                  <div className="flex items-center" title="固定时间任务">
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Completed Checkbox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Checkbox
                checked={!!editedTask.completed}
                // 编辑时保持旧逻辑，否则立即更新
                onCheckedChange={checked =>
                  isEditing
                    ? setEditedTask({ ...editedTask, completed: !!checked })
                    : handleToggleCompleted(!!checked)
                }
                disabled={isCreating || isUpdating || isDeleting}
              />
              标记为已完成
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              描述
            </label>
            {isEditing ? (
              <Textarea
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="添加描述..."
                rows={4}
              />
            ) : (
              <p className="text-gray-600">
                {editedTask.description || "暂无描述"}
              </p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                状态
              </label>
              {isEditing ? (
                <Select
                  value={editedTask.status || TaskStatus.TODO}
                  onValueChange={(value) => setEditedTask({ ...editedTask, status: value as TaskStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="capitalize">
                  {statusOptions.find(s => s.value === editedTask.status)?.label}
                </Badge>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                优先级
              </label>
              {isEditing ? (
                <Select
                  value={editedTask.priority || TaskPriority.MEDIUM}
                  onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as TaskPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={priorityColors[editedTask.priority as TaskPriority] || ""}>
                  {priorityOptions.find(p => p.value === editedTask.priority)?.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Fixed Time Checkbox */}
          {isEditing && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixedTime"
                checked={editedTask.isFixedTime || false}
                onCheckedChange={(checked) => 
                  setEditedTask({ ...editedTask, isFixedTime: checked as boolean })
                }
              />
              <label htmlFor="fixedTime" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                固定时间任务（不能被自动调整时间）
              </label>
            </div>
          )}

          {/* Due Date and Start Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                截止时间
              </label>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={editedTask.dueDate ? editedTask.dueDate.toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    dueDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {editedTask.dueDate ? editedTask.dueDate.toLocaleString() : "无截止时间"}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                开始时间
              </label>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={editedTask.startTime ? editedTask.startTime.toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    startTime: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {editedTask.startTime ? editedTask.startTime.toLocaleString() : "无开始时间"}
                </div>
              )}
            </div>
          </div>

          {/* Estimated Time */}
<div>
  <label className="text-sm font-medium text-gray-700 mb-2 block">
    预估时间
  </label>
  {isEditing ? (
    <div className="flex gap-2 items-center">
      <Input
        type="number"
        min={0}
        value={estimatedDays}
        onChange={e => {
          const days = parseInt(e.target.value) || 0;
          setEstimatedDays(days);
          setEditedTask({
            ...editedTask,
            estimatedTime: days * 1440 + estimatedHours * 60
          });
        }}
        placeholder="天"
        className="w-20"
      />
      <span>天</span>
      <Input
        type="number"
        min={0}
        max={23}
        value={estimatedHours}
        onChange={e => {
          let hours = parseInt(e.target.value) || 0;
          if (hours > 23) hours = 23;
          setEstimatedHours(hours);
          setEditedTask({
            ...editedTask,
            estimatedTime: estimatedDays * 1440 + hours * 60
          });
        }}
        placeholder="小时"
        className="w-20"
      />
      <span>小时</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-gray-600">
      <Clock className="w-4 h-4" />
      {editedTask.estimatedTime && editedTask.estimatedTime > 0
        ? `${Math.floor(editedTask.estimatedTime / 1440)} 天 ${Math.floor((editedTask.estimatedTime % 1440) / 60)} 小时`
        : "未预估"}
    </div>
  )}
</div>


          {/* Recurrence Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="recurrence" className="text-sm font-medium text-gray-700 mb-2 block">
                循环设置
              </label>
              <Select
                value={editedTask.recurrence || 'none'}
                onValueChange={(value) => setEditedTask({ ...editedTask, recurrence: value })}
                disabled={!isEditing}
              >
                <SelectTrigger id="recurrence">
                  <SelectValue placeholder="选择循环频率" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不循环</SelectItem>
                  <SelectItem value="daily">每天</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editedTask.recurrence && editedTask.recurrence !== 'none' && (
              <div>
                <label htmlFor="recurrence_end_date" className="text-sm font-medium text-gray-700 mb-2 block">
                  循环结束日期
                </label>
                <Input
                  id="recurrence_end_date"
                  type="date"
                  value={editedTask.recurrence_end_date ? new Date(editedTask.recurrence_end_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedTask({ ...editedTask, recurrence_end_date: e.target.value ? new Date(e.target.value) : undefined })}
                  disabled={!isEditing}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(editedTask.tags || []).map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  {isEditing && (
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  )}
                </Badge>
              ))}
              {(!editedTask.tags || editedTask.tags.length === 0) && !isEditing && (
                <span className="text-sm text-gray-500">暂无标签</span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加标签..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
                  添加
                </Button>
              </div>
            )}
          </div>

          {/* Child Tasks */}
          {task && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                子任务
              </label>
              <div className="space-y-2 mb-2">
                {childTasks.map((childTask) => (
                  <div key={childTask.id} className="flex items-center gap-2 p-2 border rounded">
                    <Circle className="w-4 h-4" />
                    <span className="flex-1">{childTask.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {childTask.status === TaskStatus.TODO && "待办"}
                      {childTask.status === TaskStatus.IN_PROGRESS && "进行中"}
                      {childTask.status === TaskStatus.COMPLETED && "已完成"}
                      {childTask.status === TaskStatus.OVERDUE && "已逾期"}
                    </Badge>
                  </div>
                ))}
                {childTasks.length === 0 && (
                  <div className="text-sm text-gray-500 p-2">暂无子任务</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowSubtaskModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" /> 添加子任务
                </Button>
              </div>
              {/* 子任务弹窗 */}
              {showSubtaskModal && (
                <TaskDetailModal
                  task={null}
                  isOpen={showSubtaskModal}
                  onClose={() => {
                    setShowSubtaskModal(false);
                    refetchChildTasks();
                  }}
                  parentId={task.id}
                />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isCreating || isUpdating}>
                  取消
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? "保存中..." : (task ? "保存更改" : "创建任务")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  编辑
                </Button>
                <Button 
                  variant="destructive" 
                  className="gap-2" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="w-4 h-4" />
                  {isDeleting ? "删除中..." : "删除"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
