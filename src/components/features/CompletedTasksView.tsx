
import { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Trash2 } from "lucide-react";

interface CompletedTasksViewProps {
  onTaskClick: (task: Task) => void;
}

export const CompletedTasksView = ({ onTaskClick }: CompletedTasksViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock completed tasks data
  const completedTasks: Task[] = [
    {
      id: "1",
      title: "Complete project documentation",
      description: "Write comprehensive documentation for the new feature",
      status: TaskStatus.COMPLETED,
      priority: "high" as any,
      dueDate: new Date("2024-01-15"),
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-15"),
      tags: ["documentation", "project"],
      estimatedTime: 180,
      actualTime: 165,
      subtasks: []
    },
    {
      id: "2", 
      title: "Review pull requests",
      description: "Review and approve pending pull requests",
      status: TaskStatus.COMPLETED,
      priority: "medium" as any,
      dueDate: new Date("2024-01-14"),
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-14"),
      tags: ["code-review"],
      estimatedTime: 60,
      actualTime: 45,
      subtasks: []
    },
    {
      id: "3",
      title: "Team meeting preparation",
      description: "Prepare agenda and materials for weekly team meeting",
      status: TaskStatus.COMPLETED,
      priority: "low" as any,
      dueDate: new Date("2024-01-13"),
      createdAt: new Date("2024-01-11"),
      updatedAt: new Date("2024-01-13"),
      tags: ["meeting", "team"],
      estimatedTime: 30,
      actualTime: 25,
      subtasks: []
    }
  ];

  const filteredTasks = completedTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRestoreTask = (taskId: string) => {
    console.log("Restoring task:", taskId);
    // In a real app, this would update the task status back to TODO
  };

  const handleDeleteTask = (taskId: string) => {
    console.log("Permanently deleting task:", taskId);
    // In a real app, this would permanently delete the task
  };

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
