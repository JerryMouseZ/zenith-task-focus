
import { BaseEntity } from './common.types';

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  isFixedTime?: boolean;
  tags: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  currentTime?: number; // in minutes - 当前已进行的时间
  subtasks: Subtask[];
  projectId?: string;
  parentId?: string;
  completed: boolean;
  recurrence: RecurrenceType;
  recurrence_end_date?: Date;
  userId: string;
  attachments?: TaskAttachment[];
  reminders?: TaskReminder[];
  progress?: number; // 0-100
  difficulty?: TaskDifficulty;
  energyLevel: EnergyLevel;
  contextTags: string[];
  blockingInfo?: BlockingInfo; // 添加阻塞信息
  customFilterTags?: string[]; // 添加自定义筛选标签
  assignedPersonId?: string; // 分配的人员ID
}

export interface Person extends BaseEntity {
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
  department?: string;
  // 继承自smart card的属性
  defaultEnergyLevel?: EnergyLevel;
  defaultContextTags?: string[];
  defaultPriority?: TaskPriority;
  defaultEstimatedTime?: number;
  skills?: string[];
  availability?: 'available' | 'busy' | 'unavailable';
}

export interface Subtask extends BaseEntity {
  title: string;
  completed: boolean;
  taskId: string;
  order?: number;
  estimatedTime?: number;
  actualTime?: number;
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  OVERDUE = "overdue",
  DELETED = "deleted",
  BLOCKED = "blocked",
  CANCELLED = "cancelled"
}

export interface BlockingInfo {
  type: 'waiting' | 'dependency' | 'external' | 'resource';
  description: string;
  blockedBy?: string; // Optional reference to what's blocking
  expectedResolution?: Date;
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}

export enum TaskDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  VERY_HARD = "very_hard"
}

export enum EnergyLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface TaskQuadrant {
  title: string;
  description: string;
  tasks: Task[];
  color: string;
}

export interface TaskAttachment extends BaseEntity {
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

export interface TaskReminder extends BaseEntity {
  taskId: string;
  reminderTime: Date;
  type: 'notification' | 'email' | 'sms';
  message?: string;
  sent: boolean;
}

// Task creation and update types
export type TaskCreateData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'attachments' | 'reminders'>;
export type TaskUpdateData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;

// Task filter types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  tags?: string[];
  dueDate?: {
    start?: Date;
    end?: Date;
  };
  assignee?: string[];
  project?: string[];
  search?: string;
  energyLevel?: EnergyLevel[];
  contextTags?: string[];
}

// Task analytics types
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  productivityScore: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  completionTrend: { date: string; completed: number }[];
}
