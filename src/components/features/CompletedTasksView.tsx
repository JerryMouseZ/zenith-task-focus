import { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

interface CompletedTasksViewProps {
  onTaskClick: (task: Task) => void;
}

export const CompletedTasksView = ({ onTaskClick }: CompletedTasksViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { tasks, isLoading, updateTask, deleteTask } = useTasks();

  // 只显示已完成的任务
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);

  const filteredTasks = completedTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRestoreTask = (taskId: string) => {
    updateTask({ id: taskId, updates: { status: TaskStatus.TODO } });
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('确定要永久删除这个任务吗？此操作无法撤销。')) {
      deleteTask(taskId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Completed Tasks</h1>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search completed tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {filteredTasks.length} completed task{filteredTasks.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="relative group">
            <TaskCard
              task={task}
              onClick={() => onTaskClick(task)}
            />
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
                  handleDeleteTask(task.id);
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

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchTerm ? "No completed tasks match your search." : "No completed tasks yet."}
          </div>
          {!searchTerm && (
            <p className="text-sm text-muted-foreground">
              Completed tasks will appear here when you finish them.
            </p>
          )}
        </div>
      )}
    </div>
  );
};