import { Task, TaskStatus, TaskPriority, EnergyLevel, Subtask } from "@/types/task";
import { DatabaseTask, DatabaseSubtask, TaskCreateData, TaskUpdateData } from "../types/database.types";

/**
 * Transform database task to frontend task type
 */
export function transformDatabaseTaskToTask(dbTask: DatabaseTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status as TaskStatus,
    priority: dbTask.priority as TaskPriority,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
    isFixedTime: dbTask.is_fixed_time,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    tags: dbTask.tags || [],
    estimatedTime: dbTask.estimated_time,
    actualTime: dbTask.actual_time,
    currentTime: dbTask.current_time_minutes || 0,
    projectId: dbTask.project_id,
    parentId: dbTask.parent_id,
    completed: dbTask.completed ?? false,
    subtasks: dbTask.subtasks?.map(transformDatabaseSubtaskToSubtask) || [],
    recurrence: dbTask.recurrence || 'none',
    recurrence_end_date: dbTask.recurrence_end_date ? new Date(dbTask.recurrence_end_date) : undefined,
    userId: dbTask.user_id,
    energyLevel: (dbTask.energy_level as EnergyLevel) || EnergyLevel.MEDIUM,
    contextTags: dbTask.context_tags || ['@电脑前'],
    blockingInfo: dbTask.blocking_info,
    customFilterTags: dbTask.custom_filter_tags || [],
    assignedPersonId: dbTask.assigned_person_id,
  };
}

/**
 * Transform database subtask to frontend subtask type
 */
export function transformDatabaseSubtaskToSubtask(dbSubtask: DatabaseSubtask): Subtask {
  return {
    id: dbSubtask.id,
    title: dbSubtask.title,
    completed: dbSubtask.completed,
    taskId: dbSubtask.task_id,
    createdAt: new Date(dbSubtask.created_at),
    updatedAt: new Date(dbSubtask.created_at), // Using created_at as updatedAt since it's not in the database
  };
}

/**
 * Transform frontend task to database create data
 */
export function transformTaskToCreateData(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): TaskCreateData {
  return {
    user_id: userId,
    title: task.title,
    description: task.description || null,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate?.toISOString() || null,
    is_fixed_time: task.isFixedTime || false,
    estimated_time: task.estimatedTime || null,
    actual_time: task.actualTime || null,
    current_time_minutes: task.currentTime || 0,
    tags: task.tags || [],
    project_id: task.projectId || null,
    parent_id: task.parentId || null,
    completed: task.completed === undefined ? false : task.completed,
    recurrence: task.recurrence || 'none',
    recurrence_end_date: task.recurrence_end_date?.toISOString() || null,
    energy_level: task.energyLevel || EnergyLevel.MEDIUM,
    context_tags: task.contextTags || ['@电脑前'],
    blocking_info: task.blockingInfo,
    custom_filter_tags: task.customFilterTags || [],
    assigned_person_id: task.assignedPersonId || null,
  };
}

/**
 * Transform frontend task updates to database update data
 */
export function transformTaskToUpdateData(updates: Partial<Task>): TaskUpdateData {
  const updateData: TaskUpdateData = {
    updated_at: new Date().toISOString(),
  };
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString() || null;
  if (updates.isFixedTime !== undefined) updateData.is_fixed_time = updates.isFixedTime;
  if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;
  if (updates.actualTime !== undefined) updateData.actual_time = updates.actualTime;
  if (updates.currentTime !== undefined) updateData.current_time_minutes = updates.currentTime;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
  if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
  if (updates.completed !== undefined) updateData.completed = updates.completed;
  if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence;
  if (updates.recurrence_end_date !== undefined) {
    updateData.recurrence_end_date = updates.recurrence_end_date?.toISOString() || null;
  }
  if (updates.energyLevel !== undefined) updateData.energy_level = updates.energyLevel;
  if (updates.contextTags !== undefined) updateData.context_tags = updates.contextTags;
  if (updates.blockingInfo !== undefined) updateData.blocking_info = updates.blockingInfo;
  if (updates.customFilterTags !== undefined) updateData.custom_filter_tags = updates.customFilterTags;
  if (updates.assignedPersonId !== undefined) updateData.assigned_person_id = updates.assignedPersonId;

  return updateData;
}
