
import { useState, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { Task, TaskQuadrant, TaskStatus, TaskPriority } from "@/types/task";

interface PriorityMatrixProps {
  onTaskClick: (task: Task) => void;
}

export const PriorityMatrix = ({ onTaskClick }: PriorityMatrixProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Prepare presentation for client meeting",
        description: "Create slides and prepare talking points",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["presentation", "client"],
        estimatedTime: 120,
        subtasks: []
      },
      {
        id: "2",
        title: "Finalize project proposal",
        description: "Review and submit the final proposal",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["proposal"],
        estimatedTime: 90,
        subtasks: []
      },
      {
        id: "3",
        title: "Schedule team lunch",
        description: "Organize team building lunch event",
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["team", "social"],
        estimatedTime: 30,
        subtasks: []
      },
      {
        id: "4",
        title: "Respond to all emails",
        description: "Clear email inbox",
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["email"],
        estimatedTime: 45,
        subtasks: []
      },
      {
        id: "5",
        title: "Plan next quarter's goals",
        description: "Strategic planning for Q2",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["planning", "strategy"],
        estimatedTime: 180,
        subtasks: []
      },
      {
        id: "6",
        title: "Research new market trends",
        description: "Analyze market data and trends",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["research", "market"],
        estimatedTime: 120,
        subtasks: []
      },
      {
        id: "7",
        title: "Organize files",
        description: "Clean up desktop and organize documents",
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["organization"],
        estimatedTime: 60,
        subtasks: []
      },
      {
        id: "8",
        title: "Update software",
        description: "Update all development tools",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["maintenance"],
        estimatedTime: 30,
        subtasks: []
      }
    ];
    setTasks(mockTasks);
  }, []);

  const isUrgent = (task: Task): boolean => {
    if (!task.dueDate) return false;
    const daysDiff = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3;
  };

  const isImportant = (task: Task): boolean => {
    return task.priority === TaskPriority.HIGH;
  };

  const quadrants: TaskQuadrant[] = [
    {
      title: "Important & Urgent",
      description: "Do First",
      tasks: tasks.filter(task => isImportant(task) && isUrgent(task)),
      color: "border-red-200 bg-red-50"
    },
    {
      title: "Important Not Urgent", 
      description: "Schedule",
      tasks: tasks.filter(task => isImportant(task) && !isUrgent(task)),
      color: "border-yellow-200 bg-yellow-50"
    },
    {
      title: "Urgent Not Important",
      description: "Delegate",
      tasks: tasks.filter(task => !isImportant(task) && isUrgent(task)),
      color: "border-blue-200 bg-blue-50"
    },
    {
      title: "Not Important Not Urgent",
      description: "Eliminate",
      tasks: tasks.filter(task => !isImportant(task) && !isUrgent(task)),
      color: "border-gray-200 bg-gray-50"
    }
  ];

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
