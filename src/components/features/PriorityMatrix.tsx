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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {quadrants.map((quadrant, index) => (
        <div
          key={quadrant.title}
          className={`rounded-lg border-2 p-4 ${quadrant.color} transition-all duration-200 hover:shadow-md`}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{quadrant.title}</h3>
            <p className="text-sm text-gray-600">{quadrant.description}</p>
            <div className="text-xs text-gray-500 mt-1">
              {quadrant.tasks.length} task{quadrant.tasks.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {quadrant.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {quadrant.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No tasks in this quadrant
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};