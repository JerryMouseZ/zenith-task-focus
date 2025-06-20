import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Task } from "@/types/task";

interface TaskActionsProps {
  task: Task | null;
  isEditing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  isEditing,
  isCreating,
  isUpdating,
  isDeleting,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      {isEditing ? (
        <>
          <Button variant="outline" onClick={onCancel} disabled={isCreating || isUpdating}>
            取消
          </Button>
          <Button 
            onClick={onSave} 
            className="bg-green-500 hover:bg-green-600"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? "保存中..." : (task ? "保存更改" : "创建任务")}
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" onClick={onEdit}>
            编辑
          </Button>
          <Button 
            variant="destructive" 
            className="gap-2" 
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash className="w-4 h-4" />
            {isDeleting ? "删除中..." : "删除"}
          </Button>
        </>
      )}
    </div>
  );
};
