import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Task, TaskQuadrant, TaskStatus, TaskPriority } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";

interface PriorityMatrixProps {
  onTaskClick: (task: Task) => void;
}

export const PriorityMatrix = ({ onTaskClick }: PriorityMatrixProps) => {
  const { tasks, isLoading } = useTasks();

  const isUrgent = (task: Task): boolean => {
  if (!task.dueDate) return false;
  // estimatedTime单位为分钟，转换为天
  const estimatedDays = task.estimatedTime ? task.estimatedTime / 1440 : 0;
  const daysThreshold = estimatedDays + 2;
  const daysDiff = (task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysDiff <= daysThreshold;
};

  const isImportant = (task: Task): boolean => {
    return task.priority === TaskPriority.HIGH;
  };

  // 只显示未完成的任务（兼容 completed 字段）
  const activeTasks = tasks.filter(task => !task.completed);

  const quadrants: TaskQuadrant[] = [
    {
      title: "Important & Urgent",
      description: "Do First",
      tasks: activeTasks.filter(task => isImportant(task) && isUrgent(task)),
      color: "border-red-200 bg-red-50"
    },
    {
      title: "Important Not Urgent", 
      description: "Schedule",
      tasks: activeTasks.filter(task => isImportant(task) && !isUrgent(task)),
      color: "border-yellow-200 bg-yellow-50"
    },
    {
      title: "Urgent Not Important",
      description: "Delegate",
      tasks: activeTasks.filter(task => !isImportant(task) && isUrgent(task)),
      color: "border-blue-200 bg-blue-50"
    },
    {
      title: "Not Important Not Urgent",
      description: "Eliminate",
      tasks: activeTasks.filter(task => !isImportant(task) && !isUrgent(task)),
      color: "border-gray-200 bg-gray-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full"> {/* Adjusted gap for sm screens */}
      {quadrants.map((quadrant, index) => (
        <div
          key={quadrant.title}
          className={`rounded-lg border-2 p-3 sm:p-4 ${quadrant.color} transition-all duration-200 hover:shadow-md flex flex-col`} // Added flex flex-col
        >
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">{quadrant.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{quadrant.description}</p>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
              {quadrant.tasks.length} task{quadrant.tasks.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Made task list container flexible and set max height */}
          <div className="flex-grow space-y-2 sm:space-y-3 max-h-72 md:max-h-80 lg:max-h-96 overflow-y-auto pr-1"> {/* Adjusted max-h and added pr-1 for scrollbar */}
            {quadrant.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {quadrant.tasks.length === 0 && (
              <div className="flex-grow flex items-center justify-center text-center py-8 text-gray-400 text-sm">
                No tasks in this quadrant
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};