import { useState, useMemo } from "react";
import { Task } from "@/types/task";

interface UseTaskFiltersProps {
  tasks: Task[];
  showCompleted?: boolean;
}

export const useTaskFilters = ({ tasks, showCompleted = false }: UseTaskFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from tasks
  const allTags = useMemo(() => {
    return Array.from(new Set(tasks.flatMap(task => task.tags)));
  }, [tasks]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => showCompleted || !task.completed)
      .filter(task => {
        // Enhanced search to include tag searching
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === "all" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
        
        return matchesSearch && matchesStatus && matchesPriority && matchesTags;
      });
  }, [tasks, showCompleted, searchTerm, statusFilter, priorityFilter, selectedTags]);

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

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSelectedTags([]);
  };

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== "" || 
           statusFilter !== "all" || 
           priorityFilter !== "all" || 
           selectedTags.length > 0;
  }, [searchTerm, statusFilter, priorityFilter, selectedTags]);

  return {
    // Filter state
    searchTerm,
    statusFilter,
    priorityFilter,
    selectedTags,
    allTags,
    
    // Filtered data
    filteredTasks,
    hasActiveFilters,
    
    // Filter actions
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    handleTagToggle,
    clearTagFilters,
    clearAllFilters,
  };
};
