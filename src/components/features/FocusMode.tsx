import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus, BlockingInfo } from '@/types/task';
import { FRAGMENT_TIME_TASKS } from '@/types/smartViews';
import { useTasks } from '@/hooks/useTasks';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useSmartViews } from '@/hooks/useSmartViews';
import { Play, Pause, Square, BookOpen, Clock, AlertCircle, Search, Plus } from 'lucide-react';

interface FocusSession {
  taskId: string;
  startTime: Date;
  duration: number; // 分钟
  scratchpadNotes: string;
  isActive: boolean;
  timeRemaining: number;
}

interface FocusModeProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskSwitch?: (task: Task) => void; // 添加任务切换回调
}

export const FocusMode = ({ task, isOpen, onClose, onTaskSwitch }: FocusModeProps) => {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [scratchpadNotes, setScratchpadNotes] = useState('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(25); // 默认25分钟
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockingInfo, setBlockingInfo] = useState<BlockingInfo | null>(null);
  const [blockingSearch, setBlockingSearch] = useState('');
  const [showBlockingArea, setShowBlockingArea] = useState(false);
  const [showFragmentTasks, setShowFragmentTasks] = useState(false);

  const { updateTask } = useTaskOperations();
  const { tasks } = useTasks();
  const { getBlockedTasks, searchBlockedTasks } = useSmartViews(tasks);

  // 预设时间选项
  const durationOptions = [
    { label: '15分钟', value: 15 },
    { label: '25分钟', value: 25 },
    { label: '45分钟', value: 45 },
    { label: '60分钟', value: 60 },
  ];

  // 阻塞类型选项
  const blockingTypes = [
    { label: '等待编译', value: 'waiting', description: '代码编译' },
    { label: '等待反馈', value: 'waiting', description: '邮件反馈' },
    { label: '等待上传', value: 'waiting', description: '文件上传' },
    { label: '等待审核', value: 'waiting', description: '审核通过' },
    { label: '等待资源', value: 'resource', description: '资源分配' },
    { label: '外部依赖', value: 'external', description: '外部服务' },
  ];

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handleFocusComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const startFocus = () => {
    if (!task) return;
    
    const newSession: FocusSession = {
      taskId: task.id,
      startTime: new Date(),
      duration: selectedDuration,
      scratchpadNotes: '',
      isActive: true,
      timeRemaining: selectedDuration * 60, // 转换为秒
    };
    
    setSession(newSession);
    setTimeRemaining(selectedDuration * 60);
    setIsTimerActive(true);
    setScratchpadNotes('');
    setIsBlocked(false);
    setShowFragmentTasks(false);
  };

  const pauseFocus = () => {
    setIsTimerActive(false);
  };

  const resumeFocus = () => {
    setIsTimerActive(true);
  };

  const markAsBlocked = () => {
    setIsBlocked(true);
    setIsTimerActive(false);
    setShowFragmentTasks(true);
    setShowBlockingArea(true);
    
    // 更新任务状态为阻塞
    if (task && blockingInfo) {
      updateTask(task.id, {
        status: TaskStatus.BLOCKED,
        blockingInfo: blockingInfo
      });
    }
  };

  const endFocus = () => {
    if (session && task) {
      const actualTime = Math.round((selectedDuration * 60 - timeRemaining) / 60);
      updateTaskCurrentTime(actualTime);
    }
    resetSession();
  };

  const handleFocusComplete = () => {
    if (session && task) {
      updateTaskCurrentTime(selectedDuration);
      // 可以在这里添加完成通知
    }
    resetSession();
  };

  const updateTaskCurrentTime = (additionalTime: number) => {
    if (!task) return;
    
    const newCurrentTime = (task.currentTime || 0) + additionalTime;
    updateTask(task.id, { currentTime: newCurrentTime });
  };

  const resetSession = () => {
    setSession(null);
    setIsTimerActive(false);
    setTimeRemaining(0);
    setScratchpadNotes('');
    setIsBlocked(false);
    setBlockingInfo(null);
    setShowFragmentTasks(false);
    setShowBlockingArea(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!session) return 0;
    const totalTime = selectedDuration * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const handleBlockingTypeSelect = (type: string, description: string) => {
    setBlockingInfo({
      type: type as BlockingInfo['type'],
      description: description
    });
  };

  const handleBlockedTaskClick = async (blockedTask: Task) => {
    console.log('恢复阻塞任务:', blockedTask.title, '当前状态:', blockedTask.status);
    
    try {
      // 恢复任务状态，明确取消阻塞
      await updateTask(blockedTask.id, {
        status: TaskStatus.TODO,
        blockingInfo: null, // 使用 null 而不是 undefined 确保字段被清除
      });
      
      console.log('任务状态已恢复为 TODO，阻塞信息已清除');
      
      // 如果当前有进行中的session，先结束它
      if (session && task) {
        const actualTime = Math.round((selectedDuration * 60 - timeRemaining) / 60);
        updateTaskCurrentTime(actualTime);
      }
      
      // 重置当前session状态
      resetSession();
      
      // 关闭阻塞相关的UI
      setShowBlockingArea(false);
      setShowFragmentTasks(false);
      setIsBlocked(false);
      
      console.log('切换到专注模式');
      
      // 切换到该任务的专注模式
      if (onTaskSwitch) {
        onTaskSwitch(blockedTask);
      }
    } catch (error) {
      console.error('恢复任务失败:', error);
    }
  };

  const handleFragmentTaskSelect = (fragmentTask: any) => {
    // 可以在这里处理碎片时间任务的选择
    console.log('Selected fragment task:', fragmentTask);
  };

  const blockedTasks = getBlockedTasks();
  const searchResults = blockingSearch ? searchBlockedTasks(blockingSearch) : blockedTasks;

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            专注模式
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 任务信息 */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
              {task.description && (
                <p className="text-muted-foreground mb-2">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>预计时间: {task.estimatedTime ? `${task.estimatedTime}分钟` : '未设置'}</span>
                <span>已专注时间: {task.currentTime ? `${task.currentTime}分钟` : '0分钟'}</span>
                <span>实际完成时间: {task.actualTime ? `${task.actualTime}分钟` : '0分钟'}</span>
              </div>
              {task.blockingInfo && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">任务已阻塞</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">{task.blockingInfo.description}</p>
                </div>
              )}
            </Card>

            {/* 计时器区域 */}
            <Card className="p-6">
              <div className="text-center space-y-4">
                {!session ? (
                  // 开始专注设置
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">选择专注时长</h3>
                    <div className="flex gap-2 justify-center">
                      {durationOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedDuration === option.value ? 'default' : 'outline'}
                          onClick={() => setSelectedDuration(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      onClick={startFocus}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      开始专注
                    </Button>
                  </div>
                ) : (
                  // 专注进行中
                  <div className="space-y-4">
                    <div className="text-6xl font-mono font-bold text-green-600">
                      {formatTime(timeRemaining)}
                    </div>
                    
                    {/* 进度条 */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                      {isTimerActive ? (
                        <Button onClick={pauseFocus} variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          暂停
                        </Button>
                      ) : (
                        <Button onClick={resumeFocus} className="bg-green-500 hover:bg-green-600">
                          <Play className="w-4 h-4 mr-2" />
                          继续
                        </Button>
                      )}
                      <Button onClick={endFocus} variant="destructive">
                        <Square className="w-4 h-4 mr-2" />
                        结束
                      </Button>
                      <Button onClick={() => setShowBlockingArea(true)} variant="outline">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        标记阻塞
                      </Button>
                    </div>

                    {/* 阻塞选择区域 */}
                    {showBlockingArea && (
                      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
                        <h4 className="font-semibold mb-2">标记任务为阻塞状态</h4>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {blockingTypes.map((type) => (
                            <Button
                              key={type.description}
                              variant={blockingInfo?.description === type.description ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleBlockingTypeSelect(type.value, type.description)}
                            >
                              @等待:{type.description}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={markAsBlocked}
                            disabled={!blockingInfo}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            确认阻塞
                          </Button>
                          <Button
                            onClick={() => setShowBlockingArea(false)}
                            variant="outline"
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* 碎片时间任务推荐 */}
            {showFragmentTasks && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  碎片时间任务推荐
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {FRAGMENT_TIME_TASKS.map((fragmentTask, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFragmentTaskSelect(fragmentTask)}
                      className="justify-start h-auto py-2"
                    >
                      <div className="text-left">
                        <div className="font-medium">{fragmentTask.title}</div>
                        <div className="text-xs text-muted-foreground">
                          约{fragmentTask.estimatedTime}分钟
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* 子任务清单 */}
            {task.subtasks && task.subtasks.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  子任务清单
                </h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => {
                          // 这里可以添加更新子任务状态的逻辑
                        }}
                        className="rounded"
                      />
                      <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 灵感暂存区 */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">灵感暂存区</h3>
              <Textarea
                placeholder="记录工作过程中的想法、灵感或需要稍后处理的事项..."
                value={scratchpadNotes}
                onChange={(e) => setScratchpadNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2">
                在专注过程中，将分散注意力的想法记录在这里，专注结束后再处理
              </p>
            </Card>
          </div>

          {/* 右侧阻塞区域 */}
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                阻塞任务区域
              </h3>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 点击任何阻塞任务可立即恢复该任务状态并开始专注
                </p>
              </div>
              
              {/* 搜索框 */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索阻塞任务..."
                  value={blockingSearch}
                  onChange={(e) => setBlockingSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 阻塞任务列表 */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((blockedTask) => (
                  <div
                    key={blockedTask.id}
                    className="p-3 bg-gray-50 rounded border hover:bg-green-50 hover:border-green-200 cursor-pointer transition-colors group"
                    onClick={() => handleBlockedTaskClick(blockedTask)}
                  >
                    <div className="font-medium text-sm flex items-center justify-between">
                      <span>{blockedTask.title}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      阻塞原因: {blockedTask.blockingInfo?.description}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {blockedTask.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      ✨ 点击恢复并开始专注
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {blockingSearch ? '没有找到匹配的阻塞任务' : '没有阻塞任务'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};