import { Clock, Calendar, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { differenceInCalendarDays } from "date-fns";
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor } from "@/utils/taskUtils";
import { TaskStatus } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  showCheckbox?: boolean;
  checked?: boolean;
  onStatusToggle?: (task: Task) => void;
  className?: string;
}

export const TaskCard = ({ task, onClick, showCheckbox = false, checked, onStatusToggle, className }: TaskCardProps) => {
  const formatDueDate = (date: Date) => {
    const now = new Date();
    // Use calendar day difference to avoid timezone-related rounding issues
    const diffDays = differenceInCalendarDays(date, now);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;

    return date.toLocaleDateString();
  };

  const getDueDateColor = (date: Date) => {
    const now = new Date();
    const diffDays = differenceInCalendarDays(date, now);

    if (diffDays < 0) return "text-red-600";
    if (diffDays === 0) return "text-orange-600";
    if (diffDays <= 3) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 group flex items-start gap-4"
    >
      {showCheckbox && (
        <Checkbox
          checked={checked ?? task.status === TaskStatus.COMPLETED}
          onClick={e => {
            e.stopPropagation();
            onStatusToggle && onStatusToggle(task);
          }}
          className="mt-1 mr-2"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <h4
              className={`font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-muted-foreground' : 'text-gray-900'} mb-2 group-hover:text-green-700 transition-colors line-clamp-2 break-words`}
            >
              {task.title}
            </h4>
            {task.isFixedTime && (
              <div className="flex-shrink-0 mt-1" title="固定时间任务">
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
            )}
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            <Badge className={getPriorityColor(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
        </div>
        {/* 移动端隐藏描述，桌面端显示 */}
        {task.description && (
          <p className="hidden sm:block text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${getDueDateColor(task.dueDate)}`}>
                <Calendar className="w-3 h-3" />
                {formatDueDate(task.dueDate)}
              </div>
            )}
            {task.estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {task.estimatedTime}m
              </div>
            )}
          </div>
          <div className="flex gap-1 flex-wrap max-w-[50%]">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs break-words">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs break-words">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
