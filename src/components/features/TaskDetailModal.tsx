import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { useTaskDetailModal } from "@/hooks/useTaskDetailModal";
import { TaskForm } from "./task-detail/TaskForm";
import { TagManager } from "./task-detail/TagManager";
import { SubtaskManager } from "./task-detail/SubtaskManager";
import { TaskActions } from "./task-detail/TaskActions";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Partial<Task>;
}

export const TaskDetailModal = ({ task, isOpen, onClose, parentId, initialTask }: TaskDetailModalProps & { parentId?: string }) => {
  const { useChildTasks } = useTasks();
  
  // 获取子任务
  const { data: childTasks = [], refetch: refetchChildTasks } = useChildTasks(task?.id || "");

  const {
    editedTask,
    isEditing,
    estimatedDays,
    estimatedHours,
    isCreating,
    isUpdating,
    isDeleting,
    handleTaskChange,
    handleEstimatedDaysChange,
    handleEstimatedHoursChange,
    handleCompletedToggle,
    handleSave,
    handleDelete,
    handleCancel,
    handleEdit,
  } = useTaskDetailModal({
    task,
    isOpen,
    onClose,
    parentId,
    initialTask,
  });

  const handleTagsChange = (tags: string[]) => {
    handleTaskChange({ tags });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? "任务详情" : "新建任务"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <TaskForm
            editedTask={editedTask}
            isEditing={isEditing}
            estimatedDays={estimatedDays}
            estimatedHours={estimatedHours}
            onTaskChange={handleTaskChange}
            onEstimatedDaysChange={handleEstimatedDaysChange}
            onEstimatedHoursChange={handleEstimatedHoursChange}
            onCompletedToggle={handleCompletedToggle}
          />

          <TagManager
            tags={editedTask.tags || []}
            isEditing={isEditing}
            onTagsChange={handleTagsChange}
          />

          <SubtaskManager
            task={task}
            childTasks={childTasks}
            onRefetchChildTasks={refetchChildTasks}
          />

          <TaskActions
            task={task}
            isEditing={isEditing}
            isCreating={isCreating}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
