import { supabase } from "@/integrations/supabase/client";
import { Subtask } from "@/types/task";
import { transformDatabaseSubtaskToSubtask } from "../utils/dataTransformers";

/**
 * Service for subtask operations
 */
export const subtaskService = {
  /**
   * Create a new subtask
   */
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

  /**
   * Update a subtask
   */
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

  /**
   * Delete a subtask
   */
  async deleteSubtask(id: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get all subtasks for a task
   */
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data?.map(transformDatabaseSubtaskToSubtask) || [];
  },

  /**
   * Toggle subtask completion status
   */
  async toggleSubtaskCompletion(id: string): Promise<Subtask> {
    // First get the current status
    const { data: currentSubtask, error: fetchError } = await supabase
      .from('subtasks')
      .select('completed')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the completion status
    const { data, error } = await supabase
      .from('subtasks')
      .update({ completed: !currentSubtask.completed })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return transformDatabaseSubtaskToSubtask(data);
  },
};
