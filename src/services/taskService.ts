
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority, Subtask } from "@/types/task";

export interface DatabaseTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  is_fixed_time: boolean;
  estimated_time: number | null;
  actual_time: number | null;
  tags: string[] | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export const taskService = {
  // 获取所有任务
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(transformDatabaseTaskToTask) || [];
  },

  // 创建任务
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const taskData = {
      user_id: user.id,
      title: task.title,
      description: task.description || null,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate?.toISOString() || null,
      start_time: task.startTime?.toISOString() || null,
      end_time: task.endTime?.toISOString() || null,
      is_fixed_time: task.isFixedTime || false,
      estimated_time: task.estimatedTime || null,
      actual_time: task.actualTime || null,
      tags: task.tags || [],
      project_id: task.projectId || null,
    };

    // 如果有开始时间且不是固定时间，调整其他任务时间
    if (taskData.start_time && taskData.estimated_time && !taskData.is_fixed_time) {
      await supabase.rpc('adjust_task_times_on_insert', {
        p_user_id: user.id,
        p_insert_time: taskData.start_time,
        p_duration_minutes: taskData.estimated_time
      });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        subtasks (*)
      `)
      .single();

    if (error) throw error;

    return transformDatabaseTaskToTask(data);
  },

  // 更新任务
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString() || null;
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime?.toISOString() || null;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime?.toISOString() || null;
    if (updates.isFixedTime !== undefined) updateData.is_fixed_time = updates.isFixedTime;
    if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;
    if (updates.actualTime !== undefined) updateData.actual_time = updates.actualTime;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.projectId !== undefined) updateData.project_id = updates.projectId;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        subtasks (*)
      `)
      .single();

    if (error) throw error;

    return transformDatabaseTaskToTask(data);
  },

  // 删除任务
  async deleteTask(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取要删除的任务信息
    const { data: taskToDelete, error: fetchError } = await supabase
      .from('tasks')
      .select('start_time, estimated_time, is_fixed_time')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 删除任务
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // 如果任务有开始时间且不是固定时间，调整其他任务时间
    if (taskToDelete.start_time && taskToDelete.estimated_time && !taskToDelete.is_fixed_time) {
      await supabase.rpc('adjust_task_times_on_delete', {
        p_user_id: user.id,
        p_delete_start_time: taskToDelete.start_time,
        p_duration_minutes: taskToDelete.estimated_time
      });
    }
  },

  // 创建子任务
  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        title,
      })
      .select()
      .single();

    if (error) throw error;

    return transformDatabaseSubtaskToSubtask(data);
  },

  // 更新子任务
  async updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .update({
        title: updates.title,
        completed: updates.completed,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return transformDatabaseSubtaskToSubtask(data);
  },

  // 删除子任务
  async deleteSubtask(id: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// 转换数据库任务到前端任务类型
function transformDatabaseTaskToTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status as TaskStatus,
    priority: dbTask.priority as TaskPriority,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
    startTime: dbTask.start_time ? new Date(dbTask.start_time) : undefined,
    endTime: dbTask.end_time ? new Date(dbTask.end_time) : undefined,
    isFixedTime: dbTask.is_fixed_time,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    tags: dbTask.tags || [],
    estimatedTime: dbTask.estimated_time,
    actualTime: dbTask.actual_time,
    projectId: dbTask.project_id,
    subtasks: dbTask.subtasks?.map(transformDatabaseSubtaskToSubtask) || [],
  };
}

// 转换数据库子任务到前端子任务类型
function transformDatabaseSubtaskToSubtask(dbSubtask: DatabaseSubtask): Subtask {
  return {
    id: dbSubtask.id,
    title: dbSubtask.title,
    completed: dbSubtask.completed,
    createdAt: new Date(dbSubtask.created_at),
  };
}
