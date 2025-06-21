import { Task, TaskStatus, TaskPriority } from "@/types/task";

/**
 * Validation utilities for task-related data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate task data before creation or update
 */
export const validateTask = (task: Partial<Task>): ValidationResult => {
  const errors: string[] = [];

  // Title validation
  if (!task.title || task.title.trim().length === 0) {
    errors.push("任务标题不能为空");
  } else if (task.title.trim().length > 200) {
    errors.push("任务标题不能超过200个字符");
  }

  // Description validation
  if (task.description && task.description.length > 1000) {
    errors.push("任务描述不能超过1000个字符");
  }

  // Status validation
  if (task.status && !Object.values(TaskStatus).includes(task.status)) {
    errors.push("无效的任务状态");
  }

  // Priority validation
  if (task.priority && !Object.values(TaskPriority).includes(task.priority)) {
    errors.push("无效的任务优先级");
  }

  // Date validation
  if (task.dueDate && task.startTime && task.dueDate < task.startTime) {
    errors.push("截止日期不能早于开始时间");
  }

  if (task.startTime && task.endTime && task.startTime >= task.endTime) {
    errors.push("结束时间必须晚于开始时间");
  }

  // Estimated time validation
  if (task.estimatedTime !== undefined && task.estimatedTime < 0) {
    errors.push("预估时间不能为负数");
  }

  if (task.estimatedTime !== undefined && task.estimatedTime > 43200) { // 30 days in minutes
    errors.push("预估时间不能超过30天");
  }

  // Tags validation
  if (task.tags) {
    if (task.tags.length > 10) {
      errors.push("标签数量不能超过10个");
    }
    
    for (const tag of task.tags) {
      if (tag.length > 50) {
        errors.push("单个标签长度不能超过50个字符");
      }
      if (tag.trim().length === 0) {
        errors.push("标签不能为空");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate subtask data
 */
export const validateSubtask = (title: string): ValidationResult => {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push("子任务标题不能为空");
  } else if (title.trim().length > 100) {
    errors.push("子任务标题不能超过100个字符");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate time slot for scheduling
 */
export const validateTimeSlot = (startTime: Date, endTime: Date): ValidationResult => {
  const errors: string[] = [];

  if (startTime >= endTime) {
    errors.push("结束时间必须晚于开始时间");
  }

  const now = new Date();
  if (startTime < now) {
    errors.push("开始时间不能早于当前时间");
  }

  const duration = endTime.getTime() - startTime.getTime();
  const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  if (duration > maxDuration) {
    errors.push("单个任务时间不能超过24小时");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a date is in the past
 */
export const isDateInPast = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Check if a date is within a reasonable future range (e.g., 5 years)
 */
export const isDateInReasonableFuture = (date: Date): boolean => {
  const fiveYearsFromNow = new Date();
  fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
  return date <= fiveYearsFromNow;
};
