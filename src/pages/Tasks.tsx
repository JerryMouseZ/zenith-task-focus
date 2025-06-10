
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TaskListView } from "@/components/features/TaskListView";
import { TaskDetailModal } from "@/components/features/TaskDetailModal";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Tasks = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar onNewTask={handleNewTask} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">所有任务</h1>
              <Button onClick={handleNewTask} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                新建任务
              </Button>
            </div>
            <TaskListView onTaskClick={handleTaskClick} />
          </div>
        </main>
      </div>
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
};

export default Tasks;
