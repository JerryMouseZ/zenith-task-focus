import { useState, useEffect, useMemo } from "react";
import { Task } from "@/types/task";
import { useTaskForm } from "./useTaskForm";
import { useTaskOperations } from "./useTaskOperations";
import { ERROR_MESSAGES } from "@/constants/app.constants";

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
  const [isEditing, setIsEditing] = useState(false);

  const { createTask, updateTask, deleteTask, isCreating, isUpdating, isDeleting } = useTaskOperations();

  // Memoize defaultValues to prevent infinite re-renders
  const defaultValues = useMemo(() => ({
    parentId: parentId || undefined,
    ...initialTask,
  }), [parentId, initialTask]);

  const {
    formData: editedTask,
    estimatedDays,
    estimatedHours,
    updateField: handleTaskChange,
    updateEstimatedDays: handleEstimatedDaysChange,
    updateEstimatedHours: handleEstimatedHoursChange,
    resetForm,
    getFormDataWithEstimatedTime,
    isValid,
  } = useTaskForm({
    initialTask: task,
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } else {
      setIsEditing(false);
    }
  }, [task, isOpen]);

  const handleCompletedToggle = (checked: boolean) => {
    if (task && !isEditing) {
      updateTask(task.id, { completed: checked });
      handleTaskChange('completed', checked);
    } else {
      handleTaskChange('completed', checked);
    }
  };

  const handleSave = async () => {
    if (!isValid()) {
      return;
    }

    const taskToSave = getFormDataWithEstimatedTime();

    try {
      if (task) {
        // Update existing task
        await updateTask(task.id, taskToSave);
      } else {
        // Create new task
        await createTask(taskToSave as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
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
        await deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCancel = () => {
    if (task) {
      resetForm();
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
