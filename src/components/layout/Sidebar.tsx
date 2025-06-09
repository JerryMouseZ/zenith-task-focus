
import { Calendar, Inbox, List, Clock, CheckCircle, Trash, Search, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  onNewTask: () => void;
}

export const Sidebar = ({ onNewTask }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Inbox, label: "Priority Matrix", path: "/", active: false },
    { icon: List, label: "All Tasks", path: "/tasks", active: false },
    { icon: Calendar, label: "Calendar", path: "/calendar", active: false },
    { icon: BarChart3, label: "Analytics", path: "/analytics", active: false },
    { icon: CheckCircle, label: "Completed", path: "/completed", active: false },
    { icon: Trash, label: "Trash", path: "/trash", active: false },
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
              <Link
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  location.pathname === item.path
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          to="/settings"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            location.pathname === "/settings"
              ? "bg-green-50 text-green-700 font-medium"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </div>
  );
};
