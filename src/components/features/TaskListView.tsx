
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Plus, Calendar, Clock, Tag, Tags } from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "@/types/task";

interface TaskListViewProps {
  onTaskClick: (task: Task) => void;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Write and review the Q2 project proposal",
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-06-12"),
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["work", "important"],
    estimatedTime: 180,
    subtasks: [],
  },
  {
    id: "2",
    title: "Team standup meeting",
    description: "Daily standup with the development team",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-06-09"),
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["work", "meeting"],
    estimatedTime: 30,
    subtasks: [],
  },
  {
    id: "3",
    title: "Review code PRs",
    description: "Review pending pull requests",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["work", "development"],
    estimatedTime: 90,
    subtasks: [],
  },
];

export const TaskListView = ({ onTaskClick }: TaskListViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(mockTasks.flatMap(task => task.tags)));

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTags;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 border-red-200";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case TaskStatus.IN_PROGRESS:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case TaskStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-200";
      case TaskStatus.OVERDUE:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Tasks</h1>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={TaskStatus.OVERDUE}>Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
              <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tags className="w-4 h-4 mr-2" />
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={clearTagFilters}
                  >
                    Clear all tags
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Active tag filters display */}
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Filtered by tags:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagToggle(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onTaskClick(task)}>
            <div className="flex items-start gap-4">
              <Checkbox 
                checked={task.status === TaskStatus.COMPLETED}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className={`font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {task.dueDate.toLocaleDateString()}
                    </div>
                  )}
                  
                  {task.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.estimatedTime}min
                    </div>
                  )}
                  
                  {task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <div className="flex gap-1">
                        {task.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No tasks found matching your criteria.</p>
        </Card>
      )}
    </div>
  );
};
