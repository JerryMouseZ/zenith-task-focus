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

  // 判断是否为移动端
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const menuItems = [
    { icon: Inbox, label: "优先矩阵", path: "/", active: false },
    { icon: List, label: "所有任务", path: "/tasks", active: false },
    { icon: Calendar, label: "Calendar", path: "/calendar", active: false },
    // 仅桌面端显示以下菜单项
    ...(!isMobile ? [
      { icon: BarChart3, label: "数据分析", path: "/analytics", active: false },
      { icon: CheckCircle, label: "已完成", path: "/completed", active: false },
      { icon: Trash, label: "Trash", path: "/trash", active: false },
    ] : [])
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
      {/* 移动端汉堡按钮，仅在小屏显示，且固定在左上角 */}
      {/* 移动端底部悬浮汉堡菜单按钮 */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 24,
          transform: 'translateX(-50%)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              style={{
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                width: 56,
                height: 56,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
              }}
            >
              <Menu className="w-7 h-7 text-green-600" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
      {/* 桌面端侧边栏，仅在 md 及以上显示 */}
      <div className="hidden md:flex h-screen sticky top-0 left-0 z-20">
        {sidebarContent}
      </div>
    </>
  );
};
