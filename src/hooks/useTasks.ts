
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types/task';
import { taskService } from '@/services/taskService';
import { toast } from 'sonner';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务创建成功');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('创建任务失败');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      taskService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务更新成功');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('更新任务失败');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务删除成功');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('删除任务失败');
    },
  });

  // 获取子任务
  const useChildTasks = (parentId: string) => {
    return useQuery({
      queryKey: ['child-tasks', parentId],
      queryFn: () => taskService.getChildTasks(parentId),
      enabled: !!parentId,
    });
  };

  // 按标签搜索任务
  const useTasksByTags = (tags: string[]) => {
    return useQuery({
      queryKey: ['tasks-by-tags', tags],
      queryFn: () => taskService.searchTasksByTags(tags),
      enabled: tags.length > 0,
    });
  };

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    useChildTasks,
    useTasksByTags,
  };
};
