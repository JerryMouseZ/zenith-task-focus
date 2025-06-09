
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Tag, CheckCircle, Circle, Trash } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal = ({ task, isOpen, onClose }: TaskDetailModalProps) => {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setIsEditing(false);
    } else {
      // New task
      setEditedTask({
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        tags: [],
        subtasks: []
      });
      setIsEditing(true);
    }
  }, [task]);

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving task:", editedTask);
    setIsEditing(false);
    onClose();
  };

  const handleCancel = () => {
    if (task) {
      setEditedTask(task);
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  const priorityColors = {
    [TaskPriority.LOW]: "bg-green-100 text-green-800",
    [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800", 
    [TaskPriority.HIGH]: "bg-red-100 text-red-800"
  };

  const statusOptions = [
    { value: TaskStatus.TODO, label: "To Do" },
    { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
    { value: TaskStatus.COMPLETED, label: "Completed" },
  ];

  const priorityOptions = [
    { value: TaskPriority.LOW, label: "Low" },
    { value: TaskPriority.MEDIUM, label: "Medium" },
    { value: TaskPriority.HIGH, label: "High" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? "Task Details" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Task Title
            </label>
            {isEditing ? (
              <Input
                value={editedTask.title || ""}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Enter task title..."
                className="text-lg"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">{editedTask.title}</h2>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Add a description..."
                rows={4}
              />
            ) : (
              <p className="text-gray-600">
                {editedTask.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              {isEditing ? (
                <Select
                  value={editedTask.status || TaskStatus.TODO}
                  onValueChange={(value) => setEditedTask({ ...editedTask, status: value as TaskStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="capitalize">
                  {editedTask.status?.replace('_', ' ')}
                </Badge>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Priority
              </label>
              {isEditing ? (
                <Select
                  value={editedTask.priority || TaskPriority.MEDIUM}
                  onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as TaskPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={priorityColors[editedTask.priority as TaskPriority] || ""}>
                  {editedTask.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Due Date and Estimated Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Due Date
              </label>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={editedTask.dueDate ? editedTask.dueDate.toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    dueDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {editedTask.dueDate ? editedTask.dueDate.toLocaleDateString() : "No due date"}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Estimated Time (minutes)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedTask.estimatedTime || ""}
                  onChange={(e) => setEditedTask({ 
                    ...editedTask, 
                    estimatedTime: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="60"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {editedTask.estimatedTime ? `${editedTask.estimatedTime} minutes` : "Not estimated"}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {editedTask.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newTags = editedTask.tags?.filter((_, i) => i !== index) || [];
                        setEditedTask({ ...editedTask, tags: newTags });
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
              {(editedTask.tags?.length || 0) === 0 && !isEditing && (
                <span className="text-gray-500">No tags</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                  {task ? "Save Changes" : "Create Task"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="destructive" className="gap-2">
                  <Trash className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
