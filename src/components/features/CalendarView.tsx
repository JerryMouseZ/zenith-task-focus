import { useState } from "react";
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
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, isLoading } = useTasks();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 只显示有开始时间的任务
  const scheduledTasks = tasks.filter(task => task.startTime && task.status !== TaskStatus.COMPLETED);

  const renderDayView = () => (
    <div className="grid grid-cols-[80px_1fr] gap-0 border rounded-lg overflow-hidden">
      <div className="bg-muted/30">
        <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
          Time
        </div>
        {hours.map((hour) => (
          <div key={hour} className="h-16 border-b border-border flex items-center justify-center text-sm">
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      <div>
        <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        {hours.map((hour) => (
          <div key={hour} className="h-16 border-b border-border relative hover:bg-muted/20 cursor-pointer">
            {scheduledTasks
              .filter(task => task.startTime && 
                task.startTime.toDateString() === currentDate.toDateString() &&
                task.startTime.getHours() === hour)
              .map(task => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="absolute left-2 right-2 top-1 bg-green-100 border-l-4 border-green-500 p-1 rounded text-xs cursor-pointer hover:bg-green-200"
                >
                  <div className="font-medium">{task.title}</div>
                  <div className="text-muted-foreground">{task.estimatedTime}min</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - date.getDay() + i);
      return date;
    });

    return (
      <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-0 border rounded-lg overflow-hidden">
        <div className="bg-muted/30">
          <div className="h-12 border-b border-border"></div>
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b border-border flex items-center justify-center text-sm">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex}>
            <div className="h-12 border-b border-border flex items-center justify-center text-sm font-medium">
              <div className="text-center">
                <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-lg">{day.getDate()}</div>
              </div>
            </div>
            {hours.map((hour) => (
              <div key={hour} className="h-12 border-b border-border border-l border-border relative hover:bg-muted/20 cursor-pointer">
                {scheduledTasks
                  .filter(task => task.startTime && 
                    task.startTime.toDateString() === day.toDateString() && 
                    task.startTime.getHours() === hour)
                  .map(task => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="absolute inset-1 bg-green-100 border-l-2 border-green-500 p-1 rounded text-xs cursor-pointer hover:bg-green-200"
                    >
                      {task.title}
                    </div>
                  ))}
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
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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
              {scheduledTasks
                .filter(task => task.startTime && task.startTime.toDateString() === day.toDateString())
                .slice(0, 3)
                .map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded cursor-pointer hover:bg-green-200"
                  >
                    {task.title}
                  </div>
                ))}
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
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode("day")} 
                    className={viewMode === "day" ? "bg-green-50 text-green-700" : ""}>
              Day
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("week")}
                    className={viewMode === "week" ? "bg-green-50 text-green-700" : ""}>
              Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("month")}
                    className={viewMode === "month" ? "bg-green-50 text-green-700" : ""}>
              Month
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium min-w-[140px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button size="sm" className="ml-4 bg-green-500 hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {viewMode === "day" && renderDayView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "month" && renderMonthView()}
      </Card>
    </div>
  );
};