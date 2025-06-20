
import { PageLayout } from "@/components/layout/PageLayout";
import { TaskListView } from "@/components/features/TaskListView";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { useTaskModal } from "@/hooks/useTaskModal";

const Tasks = () => {
  const { isOpen, closeQuickAdd, openQuickAdd } = useQuickAdd();
  const { selectedTask, isTaskModalOpen, handleTaskClick, handleNewTask, handleTaskModalClose } = useTaskModal();

  return (
    <PageLayout
      selectedTask={selectedTask}
      isTaskModalOpen={isTaskModalOpen}
      onTaskModalClose={handleTaskModalClose}
      onNewTask={handleNewTask}
      onQuickAdd={openQuickAdd}
      isQuickAddOpen={isOpen}
      onQuickAddClose={closeQuickAdd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">所有任务</h1>
          <Button onClick={handleNewTask} className="bg-green-500 hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            新建任务
          </Button>
        </div>
        <TaskListView onTaskClick={handleTaskClick} />
      </div>
    </PageLayout>
  );
};

export default Tasks;
