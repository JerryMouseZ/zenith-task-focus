import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Task, TaskStatus } from "@/types/task";
import { SmartView } from "@/types/smartViews";
import { useTasks } from "@/hooks/useTasks";
import { useSmartViews } from "@/hooks/useSmartViews";
import { FocusMode } from "./FocusMode";

interface SmartViewsProps {
  onTaskClick: (task: Task) => void;
}

export const SmartViews = ({ onTaskClick }: SmartViewsProps) => {
  const { tasks, isLoading, updateTask } = useTasks();
  const { smartViews } = useSmartViews(tasks);
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  const handleTaskStatusToggle = (task: Task) => {
    const isCompleting = !(task.completed || task.status === TaskStatus.COMPLETED);
    updateTask({
      id: task.id,
      updates: {
        status: isCompleting ? TaskStatus.COMPLETED : TaskStatus.TODO,
        completed: isCompleting,
      }
    });
  };

  const handleFocusStart = (task: Task) => {
    setFocusTask(task);
    setIsFocusModeOpen(true);
  };

  const handleTaskSwitch = (task: Task) => {
    setFocusTask(task);
    // 专注模式已经打开，只需要切换任务
  };

  const handleFocusModeClose = () => {
    setIsFocusModeOpen(false);
    setFocusTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If a specific view is selected, show only that view
  if (selectedViewId) {
    const selectedView = smartViews.find(view => view.id === selectedViewId);
    if (selectedView) {
      return (
        <div className="space-y-6">
          {/* Back button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedViewId(null)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回视图
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedView.icon}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedView.name}</h2>
                <p className="text-sm text-gray-600">{selectedView.description}</p>
              </div>
            </div>
          </div>

          {/* Tasks in selected view */}
          <div className="space-y-3">
            {selectedView.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                showCheckbox
                checked={task.status === TaskStatus.COMPLETED}
                onStatusToggle={handleTaskStatusToggle}
                onFocusStart={handleFocusStart}
              />
            ))}
            {selectedView.tasks.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">此视图暂无任务</p>
                <p className="text-sm">创建任务时设置相应的精力等级和情境标签</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Show all smart views in grid format
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">智能视图</h2>
        <p className="text-gray-600">基于精力和情境的任务分类</p>
      </div>

      {/* Smart Views Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartViews.map((view) => (
          <SmartViewCard
            key={view.id}
            view={view}
            onViewClick={() => setSelectedViewId(view.id)}
            onTaskClick={onTaskClick}
            onFocusStart={handleFocusStart}
          />
        ))}
      </div>

      {/* Empty state */}
      {smartViews.every(view => view.count === 0) && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg">还没有任务</p>
          <p className="text-sm">创建你的第一个任务，开始使用智能视图</p>
        </div>
      )}

      {/* Focus Mode Modal */}
      <FocusMode
        task={focusTask}
        isOpen={isFocusModeOpen}
        onClose={handleFocusModeClose}
        onTaskSwitch={handleTaskSwitch}
      />
    </div>
  );
};

interface SmartViewCardProps {
  view: SmartView;
  onViewClick: () => void;
  onTaskClick: (task: Task) => void;
  onFocusStart: (task: Task) => void;
}

const SmartViewCard = ({ view, onViewClick, onTaskClick, onFocusStart }: SmartViewCardProps) => {
  const maxPreviewTasks = 3;
  const previewTasks = view.tasks.slice(0, maxPreviewTasks);
  const remainingCount = view.count - maxPreviewTasks;

  return (
    <div
      className={`rounded-lg border-2 p-4 ${view.color} transition-all duration-200 hover:shadow-md cursor-pointer`}
      onClick={onViewClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{view.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{view.name}</h3>
            <p className="text-sm text-gray-600">{view.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-700">{view.count}</span>
          <span className="text-sm text-gray-500">任务</span>
        </div>
      </div>

      {/* Task Preview */}
      <div className="space-y-2">
        {previewTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white bg-opacity-60 rounded-md p-2 text-sm hover:bg-opacity-80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span 
                className="font-medium text-gray-800 truncate flex-1 cursor-pointer hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick(task);
                }}
              >
                {task.title}
              </span>
              <div className="flex items-center gap-2 ml-2">
                {task.estimatedTime && (
                  <span className="text-xs text-gray-500">
                    {task.estimatedTime}分
                  </span>
                )}
                {task.status !== TaskStatus.COMPLETED && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusStart(task);
                    }}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    专注
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              {task.dueDate && (
                <div className="text-xs text-gray-500">
                  {task.dueDate.toLocaleDateString()}
                </div>
              )}
              {task.currentTime && (
                <div className="text-xs text-blue-600">
                  已专注 {task.currentTime}分钟
                </div>
              )}
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="text-center py-2 text-sm text-gray-500">
            还有 {remainingCount} 个任务...
          </div>
        )}

        {view.count === 0 && (
          <div className="text-center py-4 text-gray-400">
            <div className="text-2xl mb-1">📝</div>
            <p className="text-xs">暂无任务</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {view.count > 0 && (
        <div className="mt-4 pt-2 border-t border-gray-200 border-opacity-50">
          <button className="w-full text-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            查看全部 {view.count} 个任务 →
          </button>
        </div>
      )}
    </div>
  );
};