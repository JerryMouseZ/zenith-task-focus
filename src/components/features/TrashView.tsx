import { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TrashViewProps {
  onTaskClick: (task: Task) => void;
}

export const TrashView = ({ onTaskClick }: TrashViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 目前没有真正的垃圾桶功能，这里显示一个占位符
  // 在真实应用中，你需要添加一个 'deleted' 状态或单独的垃圾桶表
  const deletedTasks: Task[] = [];

  const filteredTasks = deletedTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRestoreTask = (taskId: string) => {
    console.log("Restoring task:", taskId);
    // 在真实应用中，这里会将任务从垃圾桶恢复
  };

  const handlePermanentDelete = (taskId: string) => {
    if (window.confirm('确定要永久删除这个任务吗？此操作无法撤销。')) {
      console.log("Permanently deleting task:", taskId);
      // 在真实应用中，这里会永久删除任务
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('确定要清空垃圾桶吗？所有已删除的任务将被永久删除，此操作无法撤销。')) {
      console.log("Emptying trash");
      // 在真实应用中，这里会清空整个垃圾桶
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Trash</h1>
          {deletedTasks.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleEmptyTrash}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Empty Trash
            </Button>
          )}
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search deleted tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {deletedTasks.length > 0 && (
        <Card className="p-4 mb-6 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800">Items in Trash</h3>
              <p className="text-sm text-orange-700 mt-1">
                Tasks in the trash will be automatically deleted after 30 days. 
                You can restore them or delete them permanently at any time.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        {filteredTasks.length} deleted task{filteredTasks.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="relative group">
            <div className="opacity-60">
              <TaskCard
                task={task}
                onClick={() => onTaskClick(task)}
              />
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestoreTask(task.id);
                }}
                className="h-8 w-8 p-0"
                title="恢复任务"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePermanentDelete(task.id);
                }}
                className="h-8 w-8 p-0"
                title="永久删除"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {deletedTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <Trash2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Trash is empty</h3>
            <p className="text-sm text-muted-foreground">
              Deleted tasks will appear here. You can restore them or delete them permanently.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};