import { Task, TaskStatus, TaskPriority, Subtask } from "@/types/task";
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
    startTime: dbTask.start_time ? new Date(dbTask.start_time) : undefined,
    endTime: dbTask.end_time ? new Date(dbTask.end_time) : undefined,
    isFixedTime: dbTask.is_fixed_time,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    tags: dbTask.tags || [],
    estimatedTime: dbTask.estimated_time,
    actualTime: dbTask.actual_time,
    projectId: dbTask.project_id,
    parentId: dbTask.parent_id,
    completed: dbTask.completed ?? false,
    subtasks: dbTask.subtasks?.map(transformDatabaseSubtaskToSubtask) || [],
    recurrence: dbTask.recurrence || 'none',
    recurrence_end_date: dbTask.recurrence_end_date ? new Date(dbTask.recurrence_end_date) : undefined,
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
    createdAt: new Date(dbSubtask.created_at),
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
    start_time: task.startTime?.toISOString() || null,
    end_time: task.endTime?.toISOString() || null,
    is_fixed_time: task.isFixedTime || false,
    estimated_time: task.estimatedTime || null,
    actual_time: task.actualTime || null,
    tags: task.tags || [],
    project_id: task.projectId || null,
    parent_id: task.parentId || null,
    completed: task.completed === undefined ? false : task.completed,
    recurrence: task.recurrence || 'none',
    recurrence_end_date: task.recurrence_end_date?.toISOString() || null,
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
  if (updates.startTime !== undefined) updateData.start_time = updates.startTime?.toISOString() || null;
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime?.toISOString() || null;
  if (updates.isFixedTime !== undefined) updateData.is_fixed_time = updates.isFixedTime;
  if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;
  if (updates.actualTime !== undefined) updateData.actual_time = updates.actualTime;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
  if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
  if (updates.completed !== undefined) updateData.completed = updates.completed;
  if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence;
  if (updates.recurrence_end_date !== undefined) {
    updateData.recurrence_end_date = updates.recurrence_end_date?.toISOString() || null;
  }

  return updateData;
}
