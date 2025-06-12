
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PriorityMatrix } from "@/components/features/PriorityMatrix";
import { TaskDetailModal } from "@/components/features/TaskDetailModal";
import { Task } from "@/types/task";

const Index = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Adjust sidebar state when isMobile changes
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
    if (isMobile) {
      setIsSidebarOpen(false); // Close sidebar on mobile when new task is initiated
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Determine main content classes based on sidebar state and screen size
  let mainContentClasses = "flex-1 flex flex-col transition-all duration-300 ease-in-out";
  if (isSidebarOpen && !isMobile) {
    mainContentClasses += " ml-64"; // Adjust margin for desktop sidebar
  }


  return (
    <div className="min-h-screen bg-background flex w-full relative">
      <Sidebar
        onNewTask={handleNewTask}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      <div className={mainContentClasses}>
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6">
          <PriorityMatrix onTaskClick={handleTaskClick} />
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

export default Index;
