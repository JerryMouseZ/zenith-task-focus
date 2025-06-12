
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useIsMobile } from "@/hooks/useIsMobile";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className="border-b border-border bg-card px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="text-muted-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">我的任务</h1>
            {!isMobile && (
              <p className="text-sm text-muted-foreground mt-1">
                按重要性和紧急性管理你的任务
              </p>
            )}
          </div>
        </div>
        <UserMenu />
      </div>
    </header>
  );
};
