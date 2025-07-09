import { Task, EnergyLevel, TaskStatus, TaskPriority } from './task';

export interface SmartViewFilter {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  filters: {
    energyLevel?: EnergyLevel[];
    contextTags?: string[];
    dueDate?: 'today' | 'thisWeek' | 'overdue';
    estimatedTime?: { max: number }; // in minutes
    priority?: TaskPriority[];
    status?: TaskStatus[];
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
}

export const PRESET_SMART_VIEWS: SmartViewFilter[] = [
  {
    id: 'deep-work',
    name: '深度工作',
    description: '需要高度专注的创造性任务',
    icon: '🧠',
    color: 'border-purple-200 bg-purple-50',
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
    filters: {
      energyLevel: [EnergyLevel.LOW]
    }
  },
  {
    id: 'quick-wins',
    name: '今日速赢',
    description: '今天截止的低精力任务',
    icon: '⚡',
    color: 'border-yellow-200 bg-yellow-50',
    filters: {
      dueDate: 'today',
      energyLevel: [EnergyLevel.LOW]
    }
  },
  {
    id: 'fragment-time',
    name: '碎片时间',
    description: '短时间内可完成的任务',
    icon: '⏰',
    color: 'border-blue-200 bg-blue-50',
    filters: {
      contextTags: ['@碎片时间'],
      estimatedTime: { max: 15 }
    }
  },
  {
    id: 'urgent-today',
    name: '今日紧急',
    description: '今天必须完成的重要任务',
    icon: '🔥',
    color: 'border-red-200 bg-red-50',
    filters: {
      dueDate: 'today',
      priority: [TaskPriority.HIGH]
    }
  },
  {
    id: 'mobile-friendly',
    name: '移动办公',
    description: '通勤或外出时可以处理的任务',
    icon: '📱',
    color: 'border-indigo-200 bg-indigo-50',
    filters: {
      contextTags: ['@通勤路上', '@外出办事'],
      estimatedTime: { max: 30 }
    }
  }
];