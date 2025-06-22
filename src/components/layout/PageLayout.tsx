import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TaskDetailModal } from "@/components/features/TaskDetailModal";
import { QuickAddCommand } from "@/components/features/QuickAddCommand";
import { Task } from "@/types/task";

interface PageLayoutProps {
  children: React.ReactNode;
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  onTaskModalClose: () => void;
  onNewTask: () => void;
  onQuickAdd?: () => void;
  isQuickAddOpen?: boolean;
  onQuickAddClose?: () => void;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  selectedTask,
  isTaskModalOpen,
  onTaskModalClose,
  onNewTask,
  onQuickAdd,
  isQuickAddOpen = false,
  onQuickAddClose,
}) => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar 内部已做响应式处理，这里无需再区分 */}
      <Sidebar onNewTask={onNewTask} onQuickAdd={onQuickAdd} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 transition-all duration-200">
          {children}
        </main>
      </div>
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={onTaskModalClose}
      />
      {onQuickAddClose && (
        <QuickAddCommand 
          isOpen={isQuickAddOpen}
          onClose={onQuickAddClose}
        />
      )}
    </div>
  );
};
