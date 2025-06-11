import { Clock, Calendar } from "lucide-react";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { differenceInCalendarDays } from "date-fns";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
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
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 group"
    >
      <h4 className="font-medium text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        
        <div className="flex gap-1">
          {task.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
