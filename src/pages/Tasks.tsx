
import { PageLayout } from "@/components/layout/PageLayout";
import { TaskListView } from "@/components/features/TaskListView";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { useTaskModal } from "@/hooks/useTaskModal";

const Tasks = () => {
  const { isOpen, closeQuickAdd, openQuickAdd } = useQuickAdd();
  const { selectedTask, isTaskModalOpen, handleTaskClick, handleNewTask, handleTaskModalClose } = useTaskModal();

  const bottomActionBar = (
    <div className="flex justify-center w-full max-w-screen-xl mx-auto px-4">
      <Button onClick={handleNewTask} className="bg-green-500 hover:bg-green-600 w-full max-w-md">
        <Plus className="w-4 h-4 mr-2" />
        新建任务
      </Button>
    </div>
  );

  return (
    <PageLayout
      selectedTask={selectedTask}
      isTaskModalOpen={isTaskModalOpen}
      onTaskModalClose={handleTaskModalClose}
      onNewTask={handleNewTask}
      onQuickAdd={openQuickAdd}
      isQuickAddOpen={isOpen}
      onQuickAddClose={closeQuickAdd}
      bottomActionBar={bottomActionBar}
    >
      <div className="space-y-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">所有任务</h1>
        </div>
        <TaskListView onTaskClick={handleTaskClick} />
      </div>
    </PageLayout>
  );
};

export default Tasks;
