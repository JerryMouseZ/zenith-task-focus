
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { UserMenu } from "./UserMenu";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">我的任务</h1>
          <p className="text-sm text-muted-foreground mt-1">
            按重要性和紧急性管理你的任务
          </p>
        </div>
        <UserMenu />
      </div>
    </header>
  );
};
