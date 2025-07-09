import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { Play, Pause, Square, BookOpen, Clock } from 'lucide-react';

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
}

export const FocusMode = ({ task, isOpen, onClose }: FocusModeProps) => {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [scratchpadNotes, setScratchpadNotes] = useState('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(25); // 默认25分钟
  const { updateTask } = useTaskOperations();

  // 预设时间选项
  const durationOptions = [
    { label: '15分钟', value: 15 },
    { label: '25分钟', value: 25 },
    { label: '45分钟', value: 45 },
    { label: '60分钟', value: 60 },
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
  };

  const pauseFocus = () => {
    setIsTimerActive(false);
  };

  const resumeFocus = () => {
    setIsTimerActive(true);
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

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            专注模式
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                  </div>
                </div>
              )}
            </div>
          </Card>

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
      </DialogContent>
    </Dialog>
  );
};