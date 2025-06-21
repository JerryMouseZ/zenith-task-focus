import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types/task';
import { taskService } from '@/services/taskService';
import { toast } from 'sonner';
import { QUERY_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/app.constants';
import { validateTask } from '@/utils/validationUtils';

export const useTaskOperations = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const validation = validateTask(task);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return taskService.createTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      toast.success(SUCCESS_MESSAGES.TASK_CREATED);
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error(error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const validation = validateTask(updates);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return taskService.updateTask(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      toast.success(SUCCESS_MESSAGES.TASK_UPDATED);
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error(error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      toast.success(SUCCESS_MESSAGES.TASK_DELETED);
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
    },
  });

  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    return createTaskMutation.mutateAsync(task);
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    return updateTaskMutation.mutateAsync({ id, updates });
  };

  const deleteTask = async (id: string): Promise<void> => {
    return deleteTaskMutation.mutateAsync(id);
  };

  const toggleTaskCompletion = async (task: Task): Promise<Task> => {
    const isCompleting = !task.completed;
    return updateTask(task.id, {
      completed: isCompleting,
      status: isCompleting ? 'completed' as any : 'todo' as any,
    });
  };

  return {
    // Mutation functions
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    
    // Mutation states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    
    // Raw mutations (for advanced usage)
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  };
};
