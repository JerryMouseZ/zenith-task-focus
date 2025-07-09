import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Tags, Zap, MapPin } from "lucide-react";
import { TaskStatus, TaskPriority, EnergyLevel } from "@/types/task";

interface TaskFiltersProps {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  energyLevelFilter: string;
  selectedTags: string[];
  selectedContextTags: string[];
  allTags: string[];
  allContextTags: string[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
  onEnergyLevelFilterChange: (value: string) => void;
  onTagToggle: (tag: string) => void;
  onContextTagToggle: (tag: string) => void;
  onClearTagFilters: () => void;
  onClearContextTagFilters: () => void;
}

export const TaskFilters = ({
  searchTerm,
  statusFilter,
  priorityFilter,
  energyLevelFilter,
  selectedTags,
  selectedContextTags,
  allTags,
  allContextTags,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onEnergyLevelFilterChange,
  onTagToggle,
  onContextTagToggle,
  onClearTagFilters,
  onClearContextTagFilters,
}: TaskFiltersProps) => {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col gap-3">
        {/* Search input - Full width on first row */}
        <div className="relative w-full px-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索任务、标签或情境..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        {/* Filters - Second row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value={TaskStatus.TODO}>待办</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS}>进行中</SelectItem>
              <SelectItem value={TaskStatus.COMPLETED}>已完成</SelectItem>
              <SelectItem value={TaskStatus.OVERDUE}>已逾期</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有优先级</SelectItem>
              <SelectItem value={TaskPriority.HIGH}>高</SelectItem>
              <SelectItem value={TaskPriority.MEDIUM}>中</SelectItem>
              <SelectItem value={TaskPriority.LOW}>低</SelectItem>
            </SelectContent>
          </Select>

          <Select value={energyLevelFilter} onValueChange={onEnergyLevelFilterChange}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="精力" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有精力</SelectItem>
              <SelectItem value={EnergyLevel.HIGH}>高精力</SelectItem>
              <SelectItem value={EnergyLevel.MEDIUM}>中精力</SelectItem>
              <SelectItem value={EnergyLevel.LOW}>低精力</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tags className="w-4 h-4 mr-2" />
                标签
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>按标签筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => onTagToggle(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  暂无标签
                </div>
              )}
              {selectedTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onClearTagFilters}
                  >
                    清除所有标签
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                情境
                {selectedContextTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedContextTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>按情境筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allContextTags.length > 0 ? (
                allContextTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedContextTags.includes(tag)}
                    onCheckedChange={() => onContextTagToggle(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  暂无情境标签
                </div>
              )}
              {selectedContextTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onClearContextTagFilters}
                  >
                    清除所有情境标签
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {(selectedTags.length > 0 || selectedContextTags.length > 0) && (
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t">
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">已选择标签:</span>
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => onTagToggle(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
          {selectedContextTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">已选择情境:</span>
              {selectedContextTags.map((tag) => (
                <Badge key={tag} variant="outline" className="cursor-pointer bg-blue-50 text-blue-700 border-blue-200" onClick={() => onContextTagToggle(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
