import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { 
  transformDatabaseTaskToTask, 
  transformTaskToCreateData, 
  transformTaskToUpdateData 
} from "../utils/dataTransformers";
import { taskTimeService } from "./taskTimeService";

/**
 * Main task service for CRUD operations
 */
export const taskService = {
  /**
   * Get all tasks for the current user
   */
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

  /**
   * Get child tasks for a parent task
   */
  async getChildTasks(parentId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .rpc('get_child_tasks', { parent_task_id: parentId });

    if (error) throw error;

    return data?.map(transformDatabaseTaskToTask) || [];
  },

  /**
   * Search tasks by tags
   */
  async searchTasksByTags(tags: string[]): Promise<Task[]> {
    const { data, error } = await supabase
      .rpc('search_tasks_by_tags', { search_tags: tags });

    if (error) throw error;

    return data?.map(transformDatabaseTaskToTask) || [];
  },

  /**
   * Create a new task
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const taskData = transformTaskToCreateData(task, user.id);

    // Handle time adjustments for non-fixed time tasks
    if (taskData.start_time && taskData.estimated_time && !taskData.is_fixed_time) {
      await taskTimeService.adjustTaskTimesOnInsert(
        user.id,
        taskData.start_time,
        taskData.estimated_time
      );
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

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const updateData = transformTaskToUpdateData(updates);

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

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get task info before deletion for time adjustments
    const { data: taskToDelete, error: fetchError } = await supabase
      .from('tasks')
      .select('start_time, estimated_time, is_fixed_time')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Handle time adjustments for non-fixed time tasks
    if (taskToDelete.start_time && taskToDelete.estimated_time && !taskToDelete.is_fixed_time) {
      await taskTimeService.adjustTaskTimesOnDelete(
        user.id,
        taskToDelete.start_time,
        taskToDelete.estimated_time
      );
    }
  },
};
