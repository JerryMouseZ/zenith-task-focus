import { Calendar, Inbox, List, Clock, CheckCircle, Trash, Search, BarChart3, Settings, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  onNewTask: () => void;
  onQuickAdd?: () => void;
}

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Sidebar = ({ onNewTask, onQuickAdd }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Inbox, label: "优先矩阵", path: "/", active: false },
    { icon: List, label: "所有任务", path: "/tasks", active: false },
    { icon: Calendar, label: "Calendar", path: "/calendar", active: false },
    { icon: BarChart3, label: "数据分析", path: "/analytics", active: false },
    { icon: CheckCircle, label: "已完成", path: "/completed", active: false },
    { icon: Trash, label: "Trash", path: "/trash", active: false },
  ];

  // 移动端抽屉开关
  const [open, setOpen] = useState(false);

  // 移动端侧边栏内容
  const sidebarContent = (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">ZenithTask</h1>
      </div>
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="搜索任务" className="pl-10 bg-muted/50" />
        </div>
        <div className="space-y-2">
          <Button onClick={onNewTask} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium">新建任务</Button>
          <Button onClick={onQuickAdd} variant="outline" className="w-full border-blue-200 hover:bg-blue-50 text-blue-700 font-medium">
            <Wand2 className="w-4 h-4 mr-2" />智能添加
          </Button>
        </div>
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
                onClick={() => setOpen(false)}
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
          onClick={() => setOpen(false)}
        >
          <Settings className="w-4 h-4" />Settings
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* 移动端汉堡按钮，仅在小屏显示 */}
      <div className="md:hidden p-2 bg-card border-b border-border flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Menu className="w-6 h-6" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {sidebarContent}
          </SheetContent>
        </Sheet>
        <h1 className="ml-2 text-lg font-bold text-foreground">ZenithTask</h1>
      </div>
      {/* 桌面端侧边栏，仅在 md 及以上显示 */}
      <div className="hidden md:flex h-screen sticky top-0 left-0 z-20">
        {sidebarContent}
      </div>
    </>
  );
};
