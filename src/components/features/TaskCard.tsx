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
    // Show specific day count for overdue items as well
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays < 7) return `In ${diffDays}d`; // More specific for closer dates

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // Compact date format
  };

  const getDueDateColor = (date: Date) => {
    const now = new Date();
    const diffDays = differenceInCalendarDays(date, now);

    if (diffDays < 0) return "text-red-500"; // Adjusted for better visibility
    if (diffDays === 0) return "text-orange-500"; // Adjusted
    if (diffDays <= 3) return "text-yellow-500"; // Adjusted
    return "text-gray-500"; // Adjusted default
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 group"
    >
      <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-1 sm:mb-2 group-hover:text-green-700 transition-colors truncate">
        {task.title} {/* Added truncate for very long titles */}
      </h4>
      
      {task.description && (
        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
          {task.description}
        </p>
      )}
      
      {/* Responsive container for metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        {/* Date and Time (allow stacking on mobile) */}
        <div className="flex items-center gap-2 flex-wrap">
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${getDueDateColor(task.dueDate)}`}>
              <Calendar className="w-3.5 h-3.5" /> {/* Slightly larger icon */}
              {formatDueDate(task.dueDate)}
            </div>
          )}
          
          {task.estimatedTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" /> {/* Slightly larger icon */}
              {task.estimatedTime}m
            </div>
          )}
        </div>
        
        {/* Tags (ensure they don't push content too much on mobile) */}
        <div className="flex gap-1 flex-wrap justify-start sm:justify-end">
          {task.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
