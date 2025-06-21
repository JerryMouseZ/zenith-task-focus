/**
 * Application-wide constants
 */

// Time constants (in minutes)
export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  MINUTES_PER_DAY: 1440,
  MINUTES_PER_WEEK: 10080,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  MAX_TASK_DURATION_MINUTES: 43200, // 30 days
  MAX_SINGLE_SESSION_MINUTES: 1440, // 24 hours
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  TASK_TITLE_MAX_LENGTH: 200,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  SUBTASK_TITLE_MAX_LENGTH: 100,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS_PER_TASK: 10,
  MAX_FUTURE_YEARS: 5,
} as const;

// UI constants
export const UI_CONSTANTS = {
  MAX_VISIBLE_TAGS: 3,
  LOADING_SPINNER_SIZE: 8,
  MODAL_MAX_WIDTH: '2xl',
  MODAL_MAX_HEIGHT: '90vh',
  CARD_HOVER_SHADOW: 'md',
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  TASKS: 'tasks',
  CHILD_TASKS: 'child-tasks',
  TASKS_BY_TAGS: 'tasks-by-tags',
  PROFILE: 'profile',
  ANALYTICS: 'analytics',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER_PREFERENCES: 'user-preferences',
  TASK_FILTERS: 'task-filters',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  TASK_TITLE_REQUIRED: '请输入任务标题',
  TASK_TITLE_TOO_LONG: '任务标题不能超过200个字符',
  TASK_DESCRIPTION_TOO_LONG: '任务描述不能超过1000个字符',
  INVALID_DATE_RANGE: '截止日期不能早于开始时间',
  INVALID_TIME_RANGE: '结束时间必须晚于开始时间',
  NEGATIVE_TIME: '时间不能为负数',
  TIME_TOO_LONG: '时间设置过长',
  TOO_MANY_TAGS: '标签数量不能超过10个',
  TAG_TOO_LONG: '单个标签长度不能超过50个字符',
  EMPTY_TAG: '标签不能为空',
  SUBTASK_TITLE_REQUIRED: '子任务标题不能为空',
  SUBTASK_TITLE_TOO_LONG: '子任务标题不能超过100个字符',
  NETWORK_ERROR: '网络连接错误，请稍后重试',
  UNAUTHORIZED: '用户未认证',
  FORBIDDEN: '没有权限执行此操作',
  NOT_FOUND: '资源不存在',
  SERVER_ERROR: '服务器错误，请稍后重试',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: '任务创建成功',
  TASK_UPDATED: '任务更新成功',
  TASK_DELETED: '任务删除成功',
  SUBTASK_CREATED: '子任务创建成功',
  SUBTASK_UPDATED: '子任务更新成功',
  SUBTASK_DELETED: '子任务删除成功',
  PROFILE_UPDATED: '个人资料更新成功',
  SETTINGS_SAVED: '设置保存成功',
} as const;

// Filter options
export const FILTER_OPTIONS = {
  STATUS: {
    ALL: 'all',
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    OVERDUE: 'overdue',
  },
  PRIORITY: {
    ALL: 'all',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },
} as const;

// Recurrence options
export const RECURRENCE_OPTIONS = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

// Priority matrix quadrants
export const PRIORITY_QUADRANTS = {
  URGENT_IMPORTANT: {
    title: 'Important & Urgent',
    description: 'Do First',
    color: 'border-red-200 bg-red-50',
  },
  IMPORTANT_NOT_URGENT: {
    title: 'Important Not Urgent',
    description: 'Schedule',
    color: 'border-yellow-200 bg-yellow-50',
  },
  URGENT_NOT_IMPORTANT: {
    title: 'Urgent Not Important',
    description: 'Delegate',
    color: 'border-blue-200 bg-blue-50',
  },
  NOT_URGENT_NOT_IMPORTANT: {
    title: 'Not Important Not Urgent',
    description: 'Eliminate',
    color: 'border-gray-200 bg-gray-50',
  },
} as const;

// API endpoints (if needed for external APIs)
export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  SUBTASKS: '/api/subtasks',
  PROFILE: '/api/profile',
  ANALYTICS: '/api/analytics',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'YYYY-MM-DD',
  INPUT: 'YYYY-MM-DD',
  DATETIME_INPUT: 'YYYY-MM-DDTHH:mm',
  TIME_INPUT: 'HH:mm',
  FULL_DATETIME: 'YYYY-MM-DD HH:mm:ss',
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
