
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SettingsView } from "@/components/features/SettingsView";

const Settings = () => {
  const handleNewTask = () => {
    // Handle new task creation
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar onNewTask={handleNewTask} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <SettingsView />
        </main>
      </div>
    </div>
  );
};

export default Settings;
