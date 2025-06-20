
import { PageLayout } from "@/components/layout/PageLayout";
import { CalendarView } from "@/components/features/CalendarView";
import { useTaskModal } from "@/hooks/useTaskModal";

const Calendar = () => {
  const { selectedTask, isTaskModalOpen, handleTaskClick, handleNewTask, handleTaskModalClose } = useTaskModal();

  return (
    <PageLayout
      selectedTask={selectedTask}
      isTaskModalOpen={isTaskModalOpen}
      onTaskModalClose={handleTaskModalClose}
      onNewTask={handleNewTask}
    >
      <CalendarView onTaskClick={handleTaskClick} />
    </PageLayout>
  );
};

export default Calendar;
