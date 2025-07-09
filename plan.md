# Zenith Task Focus 功能实施计划

基于 todo.md 的需求分析，本文档详细规划了从传统四象限任务管理向精力/情境驱动方法的转型实施方案。

## 项目概述

**核心理念转变**: 从"我下一步该做什么最重要的事？"转向"我现在有多少精力？处于什么环境？适合做什么？"

**技术栈**: React + TypeScript + Supabase + Tailwind CSS + shadcn/ui

## 阶段 1: 核心系统升级 (高优先级)

### 1.1 精力/情境驱动系统
**目标**: 替代四象限，实现基于精力和情境的任务分类

**功能需求**:
- 按精力分类: 高精力、中精力、低精力
- 按情境分类: @电脑前、@通勤路上、@碎片时间等标签

**技术实施**:
```typescript
// 1. 扩展 Task 类型 (src/types/task.ts)
interface Task {
  // ... 现有字段
  energyLevel: 'low' | 'medium' | 'high';
  contextTags: string[];
  actualTime?: number; // 实际工作时间记录
}

// 2. 新增枚举类型
enum EnergyLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high'
}
```

**数据库变更**:
- 创建迁移文件添加 `energy_level` 和 `context_tags` 字段
- 更新 Supabase 类型定义

**组件修改**:
- 更新 `TaskForm` 组件，添加精力选择器和标签输入
- 修改 `TaskCard` 组件，显示精力等级和情境标签
- 更新 `taskService.ts` 和验证逻辑

**预计工时**: 3-4 天

### 1.2 智能视图系统
**目标**: 创建预设的过滤器组合，提供情境化的任务视图

**预设视图**:
- "深度工作"视图: 高精力 + @电脑前 的任务
- "轻松一下"视图: 低精力任务
- "今日速赢"视图: 截止日期为今天 + 低精力
- "碎片时间"视图: @碎片时间 + 耗时 ≤ 15分钟

**技术实施**:
```typescript
// 1. 扩展 useTaskFilters Hook
interface SmartViewFilter {
  id: string;
  name: string;
  description: string;
  filters: {
    energyLevel?: EnergyLevel[];
    contextTags?: string[];
    dueDate?: 'today' | 'thisWeek';
    estimatedTime?: { max: number };
  };
}

// 2. 创建 SmartViews 组件
const PRESET_VIEWS: SmartViewFilter[] = [
  {
    id: 'deep-work',
    name: '深度工作',
    description: '需要高度专注的创造性任务',
    filters: {
      energyLevel: ['high'],
      contextTags: ['@电脑前']
    }
  },
  // ... 其他预设视图
];
```

**组件创建**:
- 新建 `SmartViews.tsx` 组件
- 在 `TaskListView.tsx` 中集成智能视图选择器
- 更新 `useTaskFilters` Hook 支持组合过滤

**预计工时**: 2-3 天

## 阶段 2: 用户体验优化 (中优先级)

### 2.1 日历视图改进
**目标**: 聚焦截止日期，优化时间区块显示

**改进内容**:
- 默认显示截止日期视图
- 固定时间任务 (`isFixedTime: true`) 显示为时间区块
- 可切换的开始时间视图作为次要选项

**技术实施**:
```typescript
// 1. 修改 CalendarView.tsx
interface CalendarViewMode {
  mode: 'due-date' | 'start-time';
  showTimeBlocks: boolean;
}

// 2. 时间区块渲染逻辑
const renderTimeBlock = (task: Task) => {
  if (!task.isFixedTime || !task.startTime || !task.endTime) return null;
  
  return (
    <div className="time-block" style={{
      position: 'absolute',
      top: calculateTimePosition(task.startTime),
      height: calculateDuration(task.startTime, task.endTime)
    }}>
      {task.title}
    </div>
  );
};
```

**组件修改**:
- 重构 `CalendarView.tsx` 的渲染逻辑
- 添加视图模式切换器
- 优化时间区块的视觉设计和交互

**预计工时**: 3-4 天

### 2.2 专注模式
**目标**: 创建沉浸式工作环境，提升专注度

**功能特性**:
- 极简的专注界面
- 番茄钟计时器
- 任务子项清单
- 灵感暂存区 (Scratchpad)
- 自动记录专注时长

**技术实施**:
```typescript
// 1. 创建 FocusMode 组件
interface FocusSession {
  taskId: string;
  startTime: Date;
  duration: number; // 分钟
  scratchpadNotes: string;
  isActive: boolean;
}

// 2. 专注模式状态管理
const useFocusMode = () => {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const startFocus = (taskId: string, duration: number) => {
    // 启动专注会话逻辑
  };
  
  const endFocus = () => {
    // 结束会话，记录时间到 actualTime
  };
};
```

**组件创建**:
- 新建 `FocusMode.tsx` 主组件
- 创建 `PomodoroTimer.tsx` 计时器组件
- 新建 `Scratchpad.tsx` 暂存区组件
- 在 `TaskCard.tsx` 添加"开始专注"按钮

**数据存储**:
- 专注会话数据存储到 Supabase
- 更新任务的 `actualTime` 字段

**预计工时**: 4-5 天

## 阶段 3: AI 智能化功能 (低优先级，长期目标)

### 3.1 智能切换建议
**目标**: 检测用户行为模式，提供智能建议

**功能逻辑**:
- 监测用户多次启动并中止同一高难度任务
- 主动建议任务分解或切换思路
- 疲惫时推荐低精力消耗任务

**技术实施**:
```typescript
// 1. 用户行为追踪
interface UserBehaviorPattern {
  taskId: string;
  startAttempts: number;
  abortCount: number;
  totalFocusTime: number;
  lastAttempt: Date;
}

// 2. 智能建议引擎
const useSmartSuggestions = () => {
  const detectStrugglingTask = (pattern: UserBehaviorPattern) => {
    return pattern.abortCount >= 3 && pattern.totalFocusTime < 30;
  };
  
  const suggestAlternatives = (currentTask: Task) => {
    // 基于精力等级和时间建议替代任务
  };
};
```

### 3.2 AI 每日规划机器人
**目标**: 智能晨会对话，优化每日任务规划

**功能特性**:
- 每日首次打开应用时触发
- 全屏对话界面
- 多轮对话式规划
- 任务状态总结和建议

**技术架构**:
```typescript
// 1. Supabase Edge Function
// supabase/functions/daily-planner/index.ts
export const handler = async (req: Request) => {
  const { userId, conversationHistory } = await req.json();
  
  // 获取用户任务数据
  const tasks = await getUserTasks(userId);
  const overdueTasks = tasks.filter(t => isOverdue(t));
  const todayTasks = tasks.filter(t => isDueToday(t));
  
  // AI 对话逻辑
  const aiResponse = await generatePlanningResponse({
    overdueTasks,
    todayTasks,
    conversationHistory
  });
  
  return new Response(JSON.stringify({ response: aiResponse }));
};

// 2. 前端对话组件
interface DailyPlannerProps {
  isFirstVisitToday: boolean;
  onComplete: () => void;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ isFirstVisitToday, onComplete }) => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 对话逻辑实现
};
```

**对话流程设计**:
1. 问候 + 任务状态总结
2. 高优任务提醒和建议
3. 新任务规划确认
4. 精力评估和任务匹配
5. 最终日程确认
