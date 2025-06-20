
import { PageLayout } from "@/components/layout/PageLayout";
import { PriorityMatrix } from "@/components/features/PriorityMatrix";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { useTaskModal } from "@/hooks/useTaskModal";

const Index = () => {
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
      <PriorityMatrix onTaskClick={handleTaskClick} />
    </PageLayout>
  );
};

export default Index;
