import { useState } from "react";
import { Task } from "@/types/task";

export const useTaskModal = () => {
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

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
  };

  return {
    selectedTask,
    isTaskModalOpen,
    handleTaskClick,
    handleNewTask,
    handleTaskModalClose,
  };
};
