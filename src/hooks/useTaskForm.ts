import { useState, useEffect, useMemo, useCallback } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { TIME_CONSTANTS } from "@/constants/app.constants";

interface UseTaskFormProps {
  initialTask?: Task | null;
  defaultValues?: Partial<Task>;
  onReset?: () => void;
}

export const useTaskForm = ({ initialTask, defaultValues, onReset }: UseTaskFormProps = {}) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // Memoize default form data to prevent infinite re-renders
  const defaultFormData = useMemo(() => ({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    tags: [],
    subtasks: [],
    isFixedTime: false,
    recurrence: 'none' as const,
    recurrence_end_date: undefined,
    ...defaultValues,
  }), [defaultValues]);

  // Initialize form data
  useEffect(() => {
    if (initialTask) {
      setFormData(initialTask);
      setEstimatedDays(initialTask.estimatedTime ? Math.floor(initialTask.estimatedTime / TIME_CONSTANTS.MINUTES_PER_DAY) : 0);
      setEstimatedHours(initialTask.estimatedTime ? Math.floor((initialTask.estimatedTime % TIME_CONSTANTS.MINUTES_PER_DAY) / TIME_CONSTANTS.MINUTES_PER_HOUR) : 0);
    } else {
      setFormData(defaultFormData);
      setEstimatedDays(defaultFormData.estimatedTime ? Math.floor(defaultFormData.estimatedTime / TIME_CONSTANTS.MINUTES_PER_DAY) : 0);
      setEstimatedHours(defaultFormData.estimatedTime ? Math.floor((defaultFormData.estimatedTime % TIME_CONSTANTS.MINUTES_PER_DAY) / TIME_CONSTANTS.MINUTES_PER_HOUR) : 0);
    }
    setIsDirty(false);
  }, [initialTask, defaultFormData]);

  const updateField = useCallback((field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<Task>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const updateEstimatedDays = useCallback((days: number) => {
    setEstimatedDays(days);
    setFormData(prev => {
      const totalMinutes = days * TIME_CONSTANTS.MINUTES_PER_DAY + estimatedHours * TIME_CONSTANTS.MINUTES_PER_HOUR;
      return { ...prev, estimatedTime: totalMinutes };
    });
    setIsDirty(true);
  }, [estimatedHours]);

  const updateEstimatedHours = useCallback((hours: number) => {
    setEstimatedHours(hours);
    setFormData(prev => {
      const totalMinutes = estimatedDays * TIME_CONSTANTS.MINUTES_PER_DAY + hours * TIME_CONSTANTS.MINUTES_PER_HOUR;
      return { ...prev, estimatedTime: totalMinutes };
    });
    setIsDirty(true);
  }, [estimatedDays]);

  const resetForm = useCallback(() => {
    if (initialTask) {
      setFormData(initialTask);
      setEstimatedDays(initialTask.estimatedTime ? Math.floor(initialTask.estimatedTime / TIME_CONSTANTS.MINUTES_PER_DAY) : 0);
      setEstimatedHours(initialTask.estimatedTime ? Math.floor((initialTask.estimatedTime % TIME_CONSTANTS.MINUTES_PER_DAY) / TIME_CONSTANTS.MINUTES_PER_HOUR) : 0);
    } else {
      setFormData(defaultFormData);
      setEstimatedDays(defaultFormData.estimatedTime ? Math.floor(defaultFormData.estimatedTime / TIME_CONSTANTS.MINUTES_PER_DAY) : 0);
      setEstimatedHours(defaultFormData.estimatedTime ? Math.floor((defaultFormData.estimatedTime % TIME_CONSTANTS.MINUTES_PER_DAY) / TIME_CONSTANTS.MINUTES_PER_HOUR) : 0);
    }
    setIsDirty(false);
    onReset?.();
  }, [initialTask, defaultFormData, onReset]);

  const getFormDataWithEstimatedTime = useCallback((): Partial<Task> => {
    const estimatedTime = estimatedDays * TIME_CONSTANTS.MINUTES_PER_DAY + estimatedHours * TIME_CONSTANTS.MINUTES_PER_HOUR;
    return { ...formData, estimatedTime };
  }, [formData, estimatedDays, estimatedHours]);

  const isValid = useCallback(() => {
    return formData.title && formData.title.trim().length > 0;
  }, [formData.title]);

  return {
    formData,
    estimatedDays,
    estimatedHours,
    isDirty,
    updateField,
    updateMultipleFields,
    updateEstimatedDays,
    updateEstimatedHours,
    resetForm,
    getFormDataWithEstimatedTime,
    isValid,
  };
};
