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
  current_time_minutes: number | null;
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
  blocking_info?: any; // JSONB field for blocking information
  custom_filter_tags?: string[] | null;
  assigned_person_id?: string | null;
}

export interface DatabaseSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface DatabasePerson {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  role: string | null;
  department: string | null;
  skills: string[] | null;
  availability: string;
  default_energy_level: string;
  default_context_tags: string[] | null;
  default_priority: string;
  default_estimated_time: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCustomFilterTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
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
  current_time_minutes: number | null;
  tags: string[];
  project_id: string | null;
  parent_id: string | null;
  completed: boolean;
  recurrence: string;
  recurrence_end_date: string | null;
  energy_level: string;
  context_tags: string[];
  blocking_info?: any;
  custom_filter_tags?: string[];
  assigned_person_id?: string | null;
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
  current_time_minutes?: number | null;
  tags?: string[];
  project_id?: string | null;
  parent_id?: string | null;
  completed?: boolean;
  recurrence?: string;
  recurrence_end_date?: string | null;
  energy_level?: string;
  context_tags?: string[];
  updated_at: string;
  blocking_info?: any;
  custom_filter_tags?: string[];
  assigned_person_id?: string | null;
}

export interface PersonCreateData {
  user_id: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role?: string | null;
  department?: string | null;
  skills?: string[];
  availability?: string;
  default_energy_level?: string;
  default_context_tags?: string[];
  default_priority?: string;
  default_estimated_time?: number;
}

export interface PersonUpdateData {
  name?: string;
  email?: string | null;
  avatar?: string | null;
  role?: string | null;
  department?: string | null;
  skills?: string[];
  availability?: string;
  default_energy_level?: string;
  default_context_tags?: string[];
  default_priority?: string;
  default_estimated_time?: number;
  updated_at: string;
}

export interface CustomFilterTagCreateData {
  user_id: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface CustomFilterTagUpdateData {
  name?: string;
  color?: string;
  description?: string | null;
  updated_at: string;
}
