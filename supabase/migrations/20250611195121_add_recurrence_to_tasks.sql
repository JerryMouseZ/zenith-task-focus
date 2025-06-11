-- 为 tasks 表添加 recurrence 和 recurrence_end_date 字段
ALTER TABLE public.tasks ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.tasks ADD COLUMN recurrence_end_date TIMESTAMP WITH TIME ZONE;
