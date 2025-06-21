import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Tag, Lock } from "lucide-react";
import { Task, TaskStatus } from "@/types/task";
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, formatEstimatedTimeShort } from "@/utils/taskUtils";

interface TaskListItemProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onStatusToggle: (task: Task) => void;
}

export const TaskListItem = ({ task, onTaskClick, onStatusToggle }: TaskListItemProps) => {
  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusToggle(task);
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-start gap-4">
        <Checkbox 
          checked={task.status === TaskStatus.COMPLETED}
          onClick={handleStatusToggle}
          className="mt-1"
        />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              {task.isFixedTime && (
                <div className="flex items-center" title="固定时间任务">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {task.dueDate.toLocaleDateString()}
              </div>
            )}
            
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatEstimatedTimeShort(task.estimatedTime)}
              </div>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <div className="flex gap-1">
                  {task.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
