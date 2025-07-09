import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";

interface CalendarViewProps {
  onTaskClick: (task: Task) => void;
}

type ViewMode = "day" | "week" | "month";

export const CalendarView = ({ onTaskClick }: CalendarViewProps) => {
  const isMobile = useIsMobile();

  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, isLoading } = useTasks();

  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  // 过滤任务，只显示有截止日期的任务
  const filteredTasks = tasks.filter(task => {
    return task.dueDate && !task.completed;
  });

  const renderDayView = () => (
    <div className="overflow-x-auto border rounded-lg">
      <div className="min-w-[320px] grid grid-cols-[80px_1fr] gap-0">
        <div className="bg-muted/30">
          <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
            Time
          </div>
          {hours.map((hour) => (
            <div key={hour} className={`${isMobile ? "h-12" : "h-16"} border-b border-border flex items-center justify-center text-sm`}>
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div>
          <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
            {`${currentDate.getMonth() + 1}月${currentDate.getDate()}日（${'日一二三四五六'[currentDate.getDay()]}）`}
          </div>
          {hours.map((hour) => (
            <div key={hour} className={`${isMobile ? "h-12" : "h-16"} border-b border-border relative hover:bg-muted/20 cursor-pointer`}>
              {filteredTasks
                .filter(task => {
                  return task.dueDate &&
                    task.dueDate.toDateString() === currentDate.toDateString() &&
                    task.dueDate.getHours() === hour;
                })
                .map(task => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`absolute left-2 right-2 top-1 p-1 rounded text-xs cursor-pointer hover:bg-opacity-80 break-words whitespace-normal ${
                        task.isFixedTime 
                          ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-800' 
                          : 'bg-red-100 border-l-4 border-red-500 text-red-800'
                      }`}
                    >
                      <div className="font-medium break-words whitespace-normal">{task.title}</div>
                      <div className="text-muted-foreground">
                        截止: {task.dueDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-0 border rounded-lg overflow-hidden">
        <div className="bg-muted/30">
          <div className="h-12 border-b border-border"></div>
            {hours.map((hour) => (
              <div key={hour} className={`${isMobile ? "h-8" : "h-12"} border-b border-border flex items-center justify-center text-sm`}>
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
        </div>
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex}>
            <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
              <div className="text-center">
                <div>{"日一二三四五六"[day.getDay()]}</div>
                <div className="text-lg">{day.getDate()}</div>
              </div>
            </div>
            {hours.map((hour) => (
              <div key={hour} className="h-12 border-b border-border border-l border-border relative hover:bg-muted/20 cursor-pointer">
                {filteredTasks
                  .filter(task => {
                    return task.dueDate &&
                      task.dueDate.toDateString() === day.toDateString() &&
                      task.dueDate.getHours() === hour;
                  })
                .map(task => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`absolute inset-1 p-1 rounded text-xs cursor-pointer hover:bg-opacity-80 break-words whitespace-normal ${
                        task.isFixedTime 
                          ? 'bg-blue-100 border-l-2 border-blue-500 text-blue-800' 
                          : 'bg-red-100 border-l-2 border-red-500 text-red-800'
                      }`}
                    >
                      <div className="font-medium break-words whitespace-normal">{task.title}</div>
                      <div className="text-muted-foreground text-xs">
                        截止: {task.dueDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-0 border rounded-lg overflow-hidden">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="h-12 border-b border-border bg-muted/30 flex items-center justify-center text-sm font-medium">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="h-24 border-b border-r border-border p-1 hover:bg-muted/20 cursor-pointer">
            <div className={`text-sm ${day.getMonth() !== currentDate.getMonth() ? 'text-muted-foreground' : ''}`}>
              {day.getDate()}
            </div>
            <div className="space-y-1">
              {filteredTasks
                .filter(task => {
                  return task.dueDate && task.dueDate.toDateString() === day.toDateString();
                })
                .slice(0, 3)
                .map(task => {
                  const isOver = task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.COMPLETED;
                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`text-xs px-1 py-0.5 rounded cursor-pointer hover:opacity-80 ${
                        task.isFixedTime
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : (isOver
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-orange-100 text-orange-800 border border-orange-300')
                      }`}
                    >
                      <div className="truncate font-medium">{task.title}</div>
                      <div className="text-xs opacity-75">
                        截止: {task.dueDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              {filteredTasks.filter(task => {
                return task.dueDate && task.dueDate.toDateString() === day.toDateString();
              }).length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{filteredTasks.filter(task => {
                    return task.dueDate && task.dueDate.toDateString() === day.toDateString();
                  }).length - 3} 更多
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">日历</h1>
          <div className="flex items-center gap-2">
            {/* For mobile, hide week/month view buttons */}
            {!isMobile && (
              <>
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className={viewMode === "day" ? "bg-green-50 text-green-700" : ""}
                >
                  日视图
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className={viewMode === "week" ? "bg-green-50 text-green-700" : ""}
                >
                  周视图
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className={viewMode === "month" ? "bg-green-50 text-green-700" : ""}
                >
                  月视图
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 视图说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-blue-800">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm font-medium">固定时间任务</span>
          <div className="w-3 h-3 bg-orange-500 rounded ml-4"></div>
          <span className="text-sm font-medium">到期任务</span>
          <div className="w-3 h-3 bg-red-500 rounded ml-4"></div>
          <span className="text-sm font-medium">逾期任务</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          日历根据任务截止日期显示任务。
          蓝色表示固定时间任务，橙色表示即将到期，红色表示已逾期任务。
        </p>
      </div>
      <Card className="p-4">
          {viewMode === "day" && renderDayView()}
          {!isMobile && viewMode === "week" && renderWeekView()}
          {!isMobile && viewMode === "month" && renderMonthView()}
      </Card>
    </div>
  );
};