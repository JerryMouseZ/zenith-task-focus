import { supabase } from "@/integrations/supabase/client";

/**
 * Service for handling task time adjustments and scheduling
 */
export const taskTimeService = {
  /**
   * Adjust task times when inserting a new task
   */
  async adjustTaskTimesOnInsert(
    userId: string,
    insertTime: string,
    durationMinutes: number
  ): Promise<void> {
    const { error } = await supabase.rpc('adjust_task_times_on_insert', {
      p_user_id: userId,
      p_insert_time: insertTime,
      p_duration_minutes: durationMinutes
    });

    if (error) throw error;
  },

  /**
   * Adjust task times when deleting a task
   */
  async adjustTaskTimesOnDelete(
    userId: string,
    deleteStartTime: string,
    durationMinutes: number
  ): Promise<void> {
    const { error } = await supabase.rpc('adjust_task_times_on_delete', {
      p_user_id: userId,
      p_delete_start_time: deleteStartTime,
      p_duration_minutes: durationMinutes
    });

    if (error) throw error;
  },

  /**
   * Get available time slots for scheduling
   */
  async getAvailableTimeSlots(
    userId: string,
    startDate: Date,
    endDate: Date,
    durationMinutes: number
  ): Promise<{ start: Date; end: Date }[]> {
    // This would be implemented based on your scheduling requirements
    // For now, returning empty array as placeholder
    return [];
  },

  /**
   * Check if a time slot is available
   */
  async isTimeSlotAvailable(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeTaskId?: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('is_fixed_time', true)
      .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`)
      .neq('id', excludeTaskId || '');

    if (error) throw error;

    return !data || data.length === 0;
  },
};
