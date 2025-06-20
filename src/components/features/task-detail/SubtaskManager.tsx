import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Circle, Plus } from "lucide-react";
import { Task, TaskStatus } from "@/types/task";
import { TaskDetailModal } from "../TaskDetailModal";

interface SubtaskManagerProps {
  task: Task | null;
  childTasks: Task[];
  onRefetchChildTasks: () => void;
}

export const SubtaskManager: React.FC<SubtaskManagerProps> = ({
  task,
  childTasks,
  onRefetchChildTasks,
}) => {
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "待办";
      case TaskStatus.IN_PROGRESS:
        return "进行中";
      case TaskStatus.COMPLETED:
        return "已完成";
      case TaskStatus.OVERDUE:
        return "已逾期";
      default:
        return status;
    }
  };

  if (!task) return null;

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        子任务
      </label>
      <div className="space-y-2 mb-2">
        {childTasks.map((childTask) => (
          <div key={childTask.id} className="flex items-center gap-2 p-2 border rounded">
            <Circle className="w-4 h-4" />
            <span className="flex-1">{childTask.title}</span>
            <Badge variant="outline" className="text-xs">
              {getStatusLabel(childTask.status)}
            </Badge>
          </div>
        ))}
        {childTasks.length === 0 && (
          <div className="text-sm text-gray-500 p-2">暂无子任务</div>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setShowSubtaskModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> 添加子任务
        </Button>
      </div>
      {/* 子任务弹窗 */}
      {showSubtaskModal && (
        <TaskDetailModal
          task={null}
          isOpen={showSubtaskModal}
          onClose={() => {
            setShowSubtaskModal(false);
            onRefetchChildTasks();
          }}
          parentId={task.id}
        />
      )}
    </div>
  );
};
