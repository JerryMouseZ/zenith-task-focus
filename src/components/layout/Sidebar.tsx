
import { Calendar, Inbox, List, Clock, CheckCircle, Trash, Search, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react"; // For a potential close button
import { useIsMobile } from "@/hooks/useIsMobile";

interface SidebarProps {
  onNewTask: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ onNewTask, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: Inbox, label: "优先矩阵", path: "/", active: false },
    { icon: List, label: "所有任务", path: "/tasks", active: false },
    { icon: Calendar, label: "Calendar", path: "/calendar", active: false },
    { icon: BarChart3, label: "数据分析", path: "/analytics", active: false },
    { icon: CheckCircle, label: "已完成", path: "/completed", active: false },
    { icon: Trash, label: "Trash", path: "/trash", active: false },
  ];

  if (isMobile && !isOpen) {
    return null;
  }

  // Base classes
  let sidebarClasses = "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 ease-in-out";

  if (isMobile) {
    sidebarClasses += ` fixed top-0 left-0 z-50 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
  } else {
    sidebarClasses += " w-64 relative"; // Keep original width for desktop
  }

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div className={sidebarClasses}>
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">ZenithTask</h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="p-4">
          <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="搜索任务" 
            className="pl-10 bg-muted/50"
          />
        </div>
        
        <Button 
          onClick={onNewTask}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
        >
          新建任务
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                onClick={isMobile ? onClose : undefined} // Close sidebar on link click on mobile
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
          onClick={isMobile ? onClose : undefined} // Close sidebar on link click on mobile
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </div>
    </>
  );
};
