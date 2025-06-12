
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AnalyticsView } from "@/components/features/AnalyticsView";
import { QuickAddCommand } from "@/components/features/QuickAddCommand";
import { useQuickAdd } from "@/hooks/useQuickAdd";

const Analytics = () => {
  const { isOpen, closeQuickAdd, openQuickAdd } = useQuickAdd();

  const handleNewTask = () => {
    // Handle new task creation
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar onNewTask={handleNewTask} onQuickAdd={openQuickAdd} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <AnalyticsView />
        </main>
      </div>
      <QuickAddCommand 
        isOpen={isOpen}
        onClose={closeQuickAdd}
      />
    </div>
  );
};

export default Analytics;
