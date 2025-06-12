
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PriorityMatrix } from "@/components/features/PriorityMatrix";
import { TaskDetailModal } from "@/components/features/TaskDetailModal";
import { QuickAddCommand } from "@/components/features/QuickAddCommand";
import { Task } from "@/types/task";
import { useQuickAdd } from "@/hooks/useQuickAdd";

const Index = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { isOpen, closeQuickAdd, openQuickAdd } = useQuickAdd();

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
      <Sidebar onNewTask={handleNewTask} onQuickAdd={openQuickAdd} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <PriorityMatrix onTaskClick={handleTaskClick} />
        </main>
      </div>
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
      <QuickAddCommand 
        isOpen={isOpen}
        onClose={closeQuickAdd}
      />
    </div>
  );
};

export default Index;
