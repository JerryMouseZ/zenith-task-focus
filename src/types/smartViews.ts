import { Task, EnergyLevel, TaskStatus, TaskPriority } from './task';

export interface SmartViewFilter {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  priority: number; // 添加优先级字段，数值越小越优先
  filters: {
    energyLevel?: EnergyLevel[];
    contextTags?: string[];
    dueDate?: 'today' | 'tomorrow' | 'thisWeek' | 'overdue';
    estimatedTime?: { max: number }; // in minutes
    priority?: TaskPriority[];
    status?: TaskStatus[];
    customFilterTags?: string[]; // 添加自定义筛选标签
  };
}

export interface SmartView {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tasks: Task[];
  count: number;
  priority: number; // 添加优先级字段
}

export const PRESET_SMART_VIEWS: SmartViewFilter[] = [
  {
    id: 'urgent-recent',
    name: '最近紧急',
    description: '今明两天必须完成的重要任务',
    icon: '🔥',
    color: 'border-red-200 bg-red-50',
    priority: 1, // 最高优先级
    filters: {
      dueDate: 'today',
      priority: [TaskPriority.HIGH, TaskPriority.URGENT]
    }
  },
  {
    id: 'quick-wins-recent',
    name: '最近速赢',
    description: '今明两天截止的低精力任务',
    icon: '⚡',
    color: 'border-yellow-200 bg-yellow-50',
    priority: 2,
    filters: {
      dueDate: 'today',
      energyLevel: [EnergyLevel.LOW]
    }
  },
  {
    id: 'deep-work',
    name: '深度工作',
    description: '需要高度专注的创造性任务',
    icon: '🧠',
    color: 'border-purple-200 bg-purple-50',
    priority: 3,
    filters: {
      energyLevel: [EnergyLevel.HIGH],
      contextTags: ['@电脑前']
    }
  },
  {
    id: 'light-tasks',
    name: '轻松一下',
    description: '低精力时也能完成的任务',
    icon: '😌',
    color: 'border-green-200 bg-green-50',
    priority: 4,
    filters: {
      energyLevel: [EnergyLevel.LOW]
    }
  },
  {
    id: 'fragment-time',
    name: '碎片时间',
    description: '短时间内可完成的任务',
    icon: '⏰',
    color: 'border-blue-200 bg-blue-50',
    priority: 5,
    filters: {
      contextTags: ['@碎片时间'],
      estimatedTime: { max: 15 }
    }
  },
  {
    id: 'mobile-friendly',
    name: '移动办公',
    description: '通勤或外出时可以处理的任务',
    icon: '📱',
    color: 'border-indigo-200 bg-indigo-50',
    priority: 6,
    filters: {
      contextTags: ['@通勤路上', '@外出办事'],
      estimatedTime: { max: 30 }
    }
  },
  {
    id: 'blocked-tasks',
    name: '阻塞任务',
    description: '正在等待条件满足的任务',
    icon: '🚫',
    color: 'border-gray-200 bg-gray-50',
    priority: 7,
    filters: {
      status: [TaskStatus.BLOCKED]
    }
  }
];

// 碎片时间任务推荐
export const FRAGMENT_TIME_TASKS = [
  { title: '整理桌面', estimatedTime: 5, contextTags: ['@碎片时间'] },
  { title: '打扫卫生', estimatedTime: 10, contextTags: ['@碎片时间'] },
  { title: '整理邮箱', estimatedTime: 15, contextTags: ['@碎片时间'] },
  { title: '回复消息', estimatedTime: 10, contextTags: ['@碎片时间'] },
  { title: '阅读新闻', estimatedTime: 15, contextTags: ['@碎片时间'] },
  { title: '整理文档', estimatedTime: 20, contextTags: ['@碎片时间'] },
];

// 自定义筛选标签类型
export interface CustomFilterTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  userId: string;
}