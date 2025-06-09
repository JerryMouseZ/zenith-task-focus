
import { Calendar, Inbox, List, Clock, CheckCircle, Trash, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SidebarProps {
  onNewTask: () => void;
}

export const Sidebar = ({ onNewTask }: SidebarProps) => {
  const menuItems = [
    { icon: Inbox, label: "Inbox", active: false },
    { icon: List, label: "My Tasks", active: true },
    { icon: Calendar, label: "Upcoming", active: false },
    { icon: CheckCircle, label: "Completed", active: false },
    { icon: Trash, label: "Trash", active: false },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">ZenithTask</h1>
      </div>
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search tasks" 
            className="pl-10 bg-muted/50"
          />
        </div>
        
        <Button 
          onClick={onNewTask}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
        >
          New Task
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
