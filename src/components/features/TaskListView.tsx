
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { TaskFilters } from "./task-list/TaskFilters";
import { TaskCard } from "./TaskCard";
import { FocusMode } from "./FocusMode";
import { AiTaskSuggestions } from "./AiTaskSuggestions";

interface TaskListViewProps {
  onTaskClick: (task: Task) => void;
}

export const TaskListView = ({ onTaskClick }: TaskListViewProps) => {
  const { tasks, isLoading, updateTask, refetch } = useTasks();
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  const handleTaskCreated = () => {
    refetch();
  };

  const {
    searchTerm,
    statusFilter,
    priorityFilter,
    energyLevelFilter,
    selectedTags,
    selectedContextTags,
    allTags,
    allContextTags,
    filteredTasks,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setEnergyLevelFilter,
    handleTagToggle,
    handleContextTagToggle,
    clearTagFilters,
    clearContextTagFilters,
  } = useTaskFilters({ tasks, showCompleted: false });

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

  return (
    <div className="space-y-6">
      <TaskFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        energyLevelFilter={energyLevelFilter}
        selectedTags={selectedTags}
        selectedContextTags={selectedContextTags}
        allTags={allTags}
        allContextTags={allContextTags}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
        onEnergyLevelFilterChange={setEnergyLevelFilter}
        onTagToggle={handleTagToggle}
        onContextTagToggle={handleContextTagToggle}
        onClearTagFilters={clearTagFilters}
        onClearContextTagFilters={clearContextTagFilters}
      />

      {/* AI Task Suggestions */}
      <AiTaskSuggestions
        currentTask={focusTask}
        recentTasks={filteredTasks.slice(0, 10)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
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
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {tasks.length === 0 ? "暂无任务，点击新建任务开始。" : "没有找到匹配条件的任务。"}
          </p>
        </Card>
      )}

      {/* Focus Mode Modal */}
      <FocusMode
        task={focusTask}
        isOpen={isFocusModeOpen}
        onClose={handleFocusModeClose}
      />
    </div>
  );
};
