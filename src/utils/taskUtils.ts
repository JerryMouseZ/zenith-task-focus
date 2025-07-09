import { TaskStatus, TaskPriority, EnergyLevel } from "@/types/task";

// Status utility functions
export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return "待办";
    case TaskStatus.IN_PROGRESS:
      return "进行中";
    case TaskStatus.COMPLETED:
      return "已完成";
    case TaskStatus.OVERDUE:
      return "已逾期";
    default:
      return status;
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case TaskStatus.IN_PROGRESS:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case TaskStatus.COMPLETED:
      return "bg-green-100 text-green-800 border-green-200";
    case TaskStatus.OVERDUE:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Priority utility functions
export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.LOW:
      return "低";
    case TaskPriority.MEDIUM:
      return "中";
    case TaskPriority.HIGH:
      return "高";
    default:
      return priority;
  }
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.HIGH:
      return "bg-red-100 text-red-800 border-red-200";
    case TaskPriority.MEDIUM:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case TaskPriority.LOW:
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Status and Priority options for dropdowns
export const statusOptions = [
  { value: TaskStatus.TODO, label: "待办" },
  { value: TaskStatus.IN_PROGRESS, label: "进行中" },
  { value: TaskStatus.COMPLETED, label: "已完成" },
  { value: TaskStatus.OVERDUE, label: "已逾期" },
];

export const priorityOptions = [
  { value: TaskPriority.LOW, label: "低" },
  { value: TaskPriority.MEDIUM, label: "中" },
  { value: TaskPriority.HIGH, label: "高" }
];

// Energy level utility functions
export const getEnergyLevelLabel = (energyLevel: EnergyLevel): string => {
  switch (energyLevel) {
    case EnergyLevel.LOW:
      return "低精力";
    case EnergyLevel.MEDIUM:
      return "中精力";
    case EnergyLevel.HIGH:
      return "高精力";
    default:
      return energyLevel;
  }
};

export const getEnergyLevelColor = (energyLevel: EnergyLevel): string => {
  switch (energyLevel) {
    case EnergyLevel.LOW:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case EnergyLevel.MEDIUM:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case EnergyLevel.HIGH:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const energyLevelOptions = [
  { value: EnergyLevel.LOW, label: "低精力" },
  { value: EnergyLevel.MEDIUM, label: "中精力" },
  { value: EnergyLevel.HIGH, label: "高精力" }
];

// Common context tags
export const COMMON_CONTEXT_TAGS = [
  "@电脑前",
  "@通勤路上", 
  "@碎片时间",
  "@会议室",
  "@家中",
  "@外出办事",
  "@休息时间"
];

// Time formatting utilities
export const formatEstimatedTime = (estimatedTime: number | undefined): string => {
  if (!estimatedTime || estimatedTime <= 0) {
    return "未预估";
  }
  
  const days = Math.floor(estimatedTime / 1440);
  const hours = Math.floor((estimatedTime % 1440) / 60);
  
  if (days > 0 && hours > 0) {
    return `${days} 天 ${hours} 小时`;
  } else if (days > 0) {
    return `${days} 天`;
  } else if (hours > 0) {
    return `${hours} 小时`;
  } else {
    return `${estimatedTime} 分钟`;
  }
};

export const formatEstimatedTimeShort = (estimatedTime: number | undefined): string => {
  if (!estimatedTime || estimatedTime <= 0) {
    return "";
  }
  
  return `${estimatedTime}分钟`;
};

// Task classification utilities
export const isTaskUrgent = (task: { dueDate?: Date; estimatedTime?: number }): boolean => {
  if (!task.dueDate) return false;
  
  // estimatedTime单位为分钟，转换为天
  const estimatedDays = task.estimatedTime ? task.estimatedTime / 1440 : 0;
  const daysThreshold = estimatedDays + 2;
  const daysDiff = (task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  
  return daysDiff <= daysThreshold;
};

export const isTaskImportant = (task: { priority: TaskPriority }): boolean => {
  return task.priority === TaskPriority.HIGH;
};
