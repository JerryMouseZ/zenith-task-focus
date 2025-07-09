import { useMemo } from 'react';
import { Task, EnergyLevel, TaskPriority, TaskStatus } from '@/types/task';
import { SmartViewFilter, SmartView, PRESET_SMART_VIEWS } from '@/types/smartViews';
import { differenceInCalendarDays, isToday, isThisWeek, isTomorrow } from 'date-fns';

export const useSmartViews = (tasks: Task[]) => {
  // Filter tasks based on smart view criteria
  const filterTasksByView = (tasks: Task[], filter: SmartViewFilter): Task[] => {
    return tasks.filter(task => {
      // Skip completed tasks
      if (task.completed) return false;

      // Energy level filter
      if (filter.filters.energyLevel && filter.filters.energyLevel.length > 0) {
        if (!filter.filters.energyLevel.includes(task.energyLevel)) return false;
      }

      // Context tags filter
      if (filter.filters.contextTags && filter.filters.contextTags.length > 0) {
        const hasMatchingContextTag = filter.filters.contextTags.some(tag => 
          task.contextTags.includes(tag)
        );
        if (!hasMatchingContextTag) return false;
      }

      // Due date filter - updated to handle recent tasks (today + tomorrow)
      if (filter.filters.dueDate) {
        if (!task.dueDate) return false;
        
        switch (filter.filters.dueDate) {
          case 'today':
            // For "recent" filters, include both today and tomorrow
            if (filter.id === 'urgent-recent' || filter.id === 'quick-wins-recent') {
              if (!isToday(task.dueDate) && !isTomorrow(task.dueDate)) return false;
            } else {
              if (!isToday(task.dueDate)) return false;
            }
            break;
          case 'tomorrow':
            if (!isTomorrow(task.dueDate)) return false;
            break;
          case 'thisWeek':
            if (!isThisWeek(task.dueDate)) return false;
            break;
          case 'overdue':
            if (differenceInCalendarDays(new Date(), task.dueDate) <= 0) return false;
            break;
        }
      }

      // Estimated time filter
      if (filter.filters.estimatedTime) {
        if (!task.estimatedTime) return false;
        if (task.estimatedTime > filter.filters.estimatedTime.max) return false;
      }

      // Priority filter
      if (filter.filters.priority && filter.filters.priority.length > 0) {
        if (!filter.filters.priority.includes(task.priority)) return false;
      }

      // Status filter
      if (filter.filters.status && filter.filters.status.length > 0) {
        if (!filter.filters.status.includes(task.status)) return false;
      }

      // Custom filter tags filter
      if (filter.filters.customFilterTags && filter.filters.customFilterTags.length > 0) {
        const hasMatchingCustomTag = filter.filters.customFilterTags.some(tag => 
          task.customFilterTags?.includes(tag)
        );
        if (!hasMatchingCustomTag) return false;
      }

      return true;
    });
  };

  // Generate smart views with filtered tasks
  const smartViews: SmartView[] = useMemo(() => {
    const views = PRESET_SMART_VIEWS.map(filter => {
      const filteredTasks = filterTasksByView(tasks, filter);
      return {
        id: filter.id,
        name: filter.name,
        description: filter.description,
        icon: filter.icon,
        color: filter.color,
        tasks: filteredTasks,
        count: filteredTasks.length,
        priority: filter.priority
      };
    });

    // Sort by priority (lower numbers = higher priority)
    return views.sort((a, b) => a.priority - b.priority);
  }, [tasks]);

  // Get tasks for a specific smart view
  const getTasksForView = (viewId: string): Task[] => {
    const view = smartViews.find(v => v.id === viewId);
    return view?.tasks || [];
  };

  // Get view by id
  const getViewById = (viewId: string): SmartView | undefined => {
    return smartViews.find(v => v.id === viewId);
  };

  // Get total task count across all views (unique tasks)
  const totalTaskCount = useMemo(() => {
    const allViewTasks = smartViews.flatMap(view => view.tasks);
    const uniqueTaskIds = new Set(allViewTasks.map(task => task.id));
    return uniqueTaskIds.size;
  }, [smartViews]);

  // Get most relevant view (view with most tasks)
  const mostRelevantView = useMemo(() => {
    return smartViews.reduce((prev, current) => 
      current.count > prev.count ? current : prev
    );
  }, [smartViews]);

  // Get blocked tasks
  const getBlockedTasks = (): Task[] => {
    return tasks.filter(task => task.status === TaskStatus.BLOCKED && !task.completed);
  };

  // Get blocked tasks by blocking type
  const getBlockedTasksByType = (type: string): Task[] => {
    return tasks.filter(task => 
      task.status === TaskStatus.BLOCKED && 
      task.blockingInfo?.type === type &&
      !task.completed
    );
  };

  // Search blocked tasks by tags
  const searchBlockedTasks = (searchTerm: string): Task[] => {
    const blockedTasks = getBlockedTasks();
    return blockedTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.contextTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.customFilterTags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.blockingInfo?.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    smartViews,
    getTasksForView,
    getViewById,
    totalTaskCount,
    mostRelevantView,
    filterTasksByView,
    getBlockedTasks,
    getBlockedTasksByType,
    searchBlockedTasks
  };
};