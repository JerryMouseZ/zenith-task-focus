import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Task, TaskStatus } from "@/types/task"; // TaskPriority removed as it's not used directly here
import { useTasks } from "@/hooks/useTasks";

interface CalendarViewProps {
  onTaskClick: (task: Task) => void;
}

type ViewMode = "day" | "week" | "month";

export const CalendarView = ({ onTaskClick }: CalendarViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("month"); // Default to month view
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, isLoading } = useTasks();

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM (21:00)

  const scheduledTasks = tasks.filter(task => task.dueDate && !task.completed);

  const handlePrevDate = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else { // month
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  };

  const handleNextDate = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else { // month
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDateDisplay = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    if (viewMode === 'day') {
      options.day = 'numeric';
      options.weekday = 'long';
    }
    return currentDate.toLocaleDateString('zh-CN', options);
  };

  const getTaskCalendarStyle = (task: Task): string => {
    const now = new Date();
    now.setHours(0,0,0,0); // Compare dates only
    const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
    if (taskDueDate) taskDueDate.setHours(0,0,0,0);

    if (taskDueDate && taskDueDate < now && task.status !== TaskStatus.COMPLETED) {
      return "bg-red-100 text-red-700 border-l-4 border-red-500 hover:bg-red-200"; // Overdue
    }
    // Default/Due soon (can be expanded if more states are needed)
    return "bg-orange-100 text-orange-700 border-l-4 border-orange-500 hover:bg-orange-200";
  };

  function renderDayView() {
    return (
      <div className="grid grid-cols-[auto_1fr] gap-0 border rounded-lg overflow-hidden"> {/* Time col auto width */}
        <div className="bg-muted/30">
          <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium px-2">
            时间
          </div>
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-b border-border flex items-center justify-center text-xs px-2">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div>
          <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
             {currentDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'long' })}
          </div>
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-b border-border relative hover:bg-muted/20 cursor-pointer group">
              {scheduledTasks
                .filter(task => task.dueDate &&
                  task.dueDate.toDateString() === currentDate.toDateString() &&
                  task.dueDate.getHours() === hour)
                .map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`absolute left-1 right-1 top-0.5 p-1 rounded text-xs cursor-pointer ${getTaskCalendarStyle(task)}`}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="opacity-80 text-[10px]">{task.dueDate?.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderWeekView() {
    const weekStart = new Date(currentDate);
    // Adjust to start of the week (e.g., Monday or Sunday depending on locale, for zh-CN Monday is common)
    const dayOfWeek = weekStart.getDay(); // Sunday = 0, Monday = 1, etc.
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek -1)); // Assuming Monday is first day

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="overflow-x-auto border rounded-lg">
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-0 min-w-[920px]"> {/* Time col auto, min-width for scroll */}
          <div className="bg-muted/30"> {/* Time Column Header */}
            <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium px-2">时间</div>
            {hours.map((hour) => (
              <div key={hour} className="h-12 border-b border-border flex items-center justify-center text-xs px-2">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="border-l border-border"> {/* Day Column */}
              <div className="h-12 border-b border-border flex flex-col items-center justify-center text-sm font-medium">
                <span>{day.toLocaleDateString('zh-CN', { weekday: 'short' })}</span>
                <span className="text-base">{day.getDate()}</span>
              </div>
              {hours.map((hour) => (
                <div key={hour} className="h-12 border-b border-border relative hover:bg-muted/20 cursor-pointer group">
                  {scheduledTasks
                    .filter(task => task.dueDate &&
                      task.dueDate.toDateString() === day.toDateString() &&
                      task.dueDate.getHours() === hour)
                    .map(task => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`absolute inset-0.5 p-0.5 rounded text-[10px] cursor-pointer ${getTaskCalendarStyle(task)}`}
                      >
                        <div className="font-semibold truncate text-[11px]">{task.title}</div>
                        <div className="opacity-80">{task.dueDate?.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: 'numeric' })}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderMonthView() {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // Ensure monthStart is the first day of the week for calendar display
    const dayOffset = monthStart.getDay(); // Sunday = 0, Monday = 1 ...
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - dayOffset); // Adjust to Sunday

    const days = [];
    let currentDayIter = new Date(startDate);
    for (let i = 0; i < 42; i++) { // 6 weeks for typical month display
      days.push(new Date(currentDayIter));
      currentDayIter.setDate(currentDayIter.getDate() + 1);
    }

    const dayHeaders = ['日', '一', '二', '三', '四', '五', '六']; // Sunday first

    return (
      <div className="grid grid-cols-7 gap-px border rounded-lg overflow-hidden bg-border"> {/* Use gap-px with bg-border for grid lines */}
        {dayHeaders.map(day => (
          <div key={day} className="h-10 sm:h-12 border-b bg-muted/40 flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className={`h-20 sm:h-24 p-1 bg-background hover:bg-muted/20 cursor-pointer flex flex-col ${day.getMonth() !== currentDate.getMonth() ? 'opacity-60' : ''}`}>
            <div className={`text-xs sm:text-sm self-start ${day.toDateString() === new Date().toDateString() ? 'text-green-600 font-bold' : ''}`}>
              {day.getDate()}
            </div>
            <div className="flex-grow space-y-0.5 overflow-y-auto text-[10px] sm:text-xs">
              {scheduledTasks
                .filter(task => task.dueDate && task.dueDate.toDateString() === day.toDateString())
                .slice(0, 2) // Show max 2 tasks initially
                .map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); onTaskClick(task);}}
                    title={task.title}
                    className={`px-1 py-0.5 rounded cursor-pointer truncate ${getTaskCalendarStyle(task)}`}
                  >
                    {task.title}
                  </div>
                ))}
              {scheduledTasks.filter(task => task.dueDate && task.dueDate.toDateString() === day.toDateString()).length > 2 && (
                <div className="text-muted-foreground text-[10px] text-center">
                  + {scheduledTasks.filter(task => task.dueDate && task.dueDate.toDateString() === day.toDateString()).length - 2} more
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold">日历</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode("day")} 
                    className={`text-xs sm:text-sm ${viewMode === "day" ? "bg-primary/10 text-primary" : ""}`}>
              日
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("week")}
                    className={`text-xs sm:text-sm ${viewMode === "week" ? "bg-primary/10 text-primary" : ""}`}>
              周
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("month")}
                    className={`text-xs sm:text-sm ${viewMode === "month" ? "bg-primary/10 text-primary" : ""}`}>
              月
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevDate} aria-label="Previous period">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <span className="font-medium text-sm sm:text-base min-w-[150px] sm:min-w-[200px] text-center">
            {formatDateDisplay()}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextDate} aria-label="Next period">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 text-blue-800">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-sm"></div>
          <span className="font-medium">即将到期</span>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-sm ml-2 sm:ml-4"></div>
          <span className="font-medium">已逾期</span>
        </div>
        <p className="text-blue-700 mt-1">日历根据任务截止日期显示，颜色区分状态。</p>
      </div>

      <Card className="p-2 sm:p-4">
        {viewMode === "day" && renderDayView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "month" && renderMonthView()}
      </Card>
    </div>
  );
};