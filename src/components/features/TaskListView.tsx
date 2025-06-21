
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { TaskFilters } from "./task-list/TaskFilters";
import { TaskListItem } from "./task-list/TaskListItem";

interface TaskListViewProps {
  onTaskClick: (task: Task) => void;
}

export const TaskListView = ({ onTaskClick }: TaskListViewProps) => {
  const { tasks, isLoading, updateTask } = useTasks();

  const {
    searchTerm,
    statusFilter,
    priorityFilter,
    selectedTags,
    allTags,
    filteredTasks,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    handleTagToggle,
    clearTagFilters,
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
        selectedTags={selectedTags}
        allTags={allTags}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
        onTagToggle={handleTagToggle}
        onClearTagFilters={clearTagFilters}
      />

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
            onStatusToggle={handleTaskStatusToggle}
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
    </div>
  );
};
