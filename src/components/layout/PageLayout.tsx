import React, { useState, useEffect } from "react";
import { StatusBar } from "@capacitor/status-bar";
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
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  useEffect(() => {
    const getStatusBarHeight = async () => {
      try {
        const info = await StatusBar.getInfo();
        setStatusBarHeight(info.statusBarHeight);
      } catch (e) {
        console.error("Error getting status bar info", e);
      }
    };

    getStatusBarHeight();
  }, []);
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar 内部已做响应式处理，这里无需再区分 */}
      <Sidebar onNewTask={onNewTask} onQuickAdd={onQuickAdd} />
      <div className="flex-1 flex flex-col max-h-screen">
        <div className="sticky top-0 z-10 bg-background" style={{ paddingTop: statusBarHeight }}>
          <Header />
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
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
