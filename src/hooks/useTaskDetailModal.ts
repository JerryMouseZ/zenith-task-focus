import { useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useTasks } from "./useTasks";
import { toast } from "sonner";

interface UseTaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  initialTask?: Partial<Task>;
}

export const useTaskDetailModal = ({
  task,
  isOpen,
  onClose,
  parentId,
  initialTask,
}: UseTaskDetailModalProps) => {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  
  const { createTask, updateTask, deleteTask, isCreating, isUpdating, isDeleting } = useTasks();

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

  const handleTaskChange = (updates: Partial<Task>) => {
    setEditedTask(prev => ({ ...prev, ...updates }));
  };

  const handleEstimatedDaysChange = (days: number) => {
    setEstimatedDays(days);
    setEditedTask(prev => ({
      ...prev,
      estimatedTime: days * 1440 + estimatedHours * 60
    }));
  };

  const handleEstimatedHoursChange = (hours: number) => {
    setEstimatedHours(hours);
    setEditedTask(prev => ({
      ...prev,
      estimatedTime: estimatedDays * 1440 + hours * 60
    }));
  };

  const handleCompletedToggle = (checked: boolean) => {
    if (task && !isEditing) {
      updateTask({ id: task.id, updates: { completed: checked } });
      setEditedTask(prev => ({ ...prev, completed: checked }));
    } else {
      setEditedTask(prev => ({ ...prev, completed: checked }));
    }
  };

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  return {
    editedTask,
    isEditing,
    estimatedDays,
    estimatedHours,
    isCreating,
    isUpdating,
    isDeleting,
    handleTaskChange,
    handleEstimatedDaysChange,
    handleEstimatedHoursChange,
    handleCompletedToggle,
    handleSave,
    handleDelete,
    handleCancel,
    handleEdit,
  };
};
