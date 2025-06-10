import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TrashView } from "@/components/features/TrashView";
import { TaskDetailModal } from "@/components/features/TaskDetailModal";
import { Task } from "@/types/task";

const Trash = () => {
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
          <TrashView onTaskClick={handleTaskClick} />
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

export default Trash;