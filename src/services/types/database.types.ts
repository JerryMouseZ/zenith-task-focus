/**
 * Database type definitions for task-related entities
 */

export interface DatabaseTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  is_fixed_time: boolean;
  estimated_time: number | null;
  actual_time: number | null;
  current_time: number | null;
  tags: string[] | null;
  project_id: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  completed?: boolean;
  recurrence?: string;
  recurrence_end_date?: string | null;
  energy_level?: string;
  context_tags?: string[] | null;
  subtasks?: DatabaseSubtask[];
}

export interface DatabaseSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface TaskCreateData {
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  is_fixed_time: boolean;
  estimated_time: number | null;
  actual_time: number | null;
  current_time: number | null;
  tags: string[];
  project_id: string | null;
  parent_id: string | null;
  completed: boolean;
  recurrence: string;
  recurrence_end_date: string | null;
  energy_level: string;
  context_tags: string[];
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string | null;
  is_fixed_time?: boolean;
  estimated_time?: number | null;
  actual_time?: number | null;
  current_time?: number | null;
  tags?: string[];
  project_id?: string | null;
  parent_id?: string | null;
  completed?: boolean;
  recurrence?: string;
  recurrence_end_date?: string | null;
  energy_level?: string;
  context_tags?: string[];
  updated_at: string;
}
