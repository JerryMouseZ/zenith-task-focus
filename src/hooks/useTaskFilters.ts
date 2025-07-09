import { useState, useMemo } from "react";
import { Task, EnergyLevel } from "@/types/task";

interface UseTaskFiltersProps {
  tasks: Task[];
  showCompleted?: boolean;
}

export const useTaskFilters = ({ tasks, showCompleted = false }: UseTaskFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [energyLevelFilter, setEnergyLevelFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([]);

  // Get all unique tags from tasks
  const allTags = useMemo(() => {
    return Array.from(new Set(tasks.flatMap(task => task.tags)));
  }, [tasks]);

  // Get all unique context tags from tasks
  const allContextTags = useMemo(() => {
    return Array.from(new Set(tasks.flatMap(task => task.contextTags || [])));
  }, [tasks]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => showCompleted || !task.completed)
      .filter(task => {
        // Enhanced search to include tag and context tag searching
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             task.contextTags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === "all" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
        const matchesEnergyLevel = energyLevelFilter === "all" || task.energyLevel === energyLevelFilter;
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
        const matchesContextTags = selectedContextTags.length === 0 || 
                                 selectedContextTags.some(tag => task.contextTags?.includes(tag));
        
        return matchesSearch && matchesStatus && matchesPriority && matchesEnergyLevel && 
               matchesTags && matchesContextTags;
      });
  }, [tasks, showCompleted, searchTerm, statusFilter, priorityFilter, energyLevelFilter, selectedTags, selectedContextTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleContextTagToggle = (tag: string) => {
    setSelectedContextTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const clearContextTagFilters = () => {
    setSelectedContextTags([]);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setEnergyLevelFilter("all");
    setSelectedTags([]);
    setSelectedContextTags([]);
  };

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== "" || 
           statusFilter !== "all" || 
           priorityFilter !== "all" || 
           energyLevelFilter !== "all" ||
           selectedTags.length > 0 ||
           selectedContextTags.length > 0;
  }, [searchTerm, statusFilter, priorityFilter, energyLevelFilter, selectedTags, selectedContextTags]);

  return {
    // Filter state
    searchTerm,
    statusFilter,
    priorityFilter,
    energyLevelFilter,
    selectedTags,
    selectedContextTags,
    allTags,
    allContextTags,
    
    // Filtered data
    filteredTasks,
    hasActiveFilters,
    
    // Filter actions
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    setEnergyLevelFilter,
    handleTagToggle,
    handleContextTagToggle,
    clearTagFilters,
    clearContextTagFilters,
    clearAllFilters,
  };
};
