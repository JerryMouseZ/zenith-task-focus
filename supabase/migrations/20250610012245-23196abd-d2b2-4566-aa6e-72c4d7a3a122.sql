
-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_fixed_time BOOLEAN NOT NULL DEFAULT false,
  estimated_time INTEGER, -- in minutes
  actual_time INTEGER, -- in minutes
  tags TEXT[] DEFAULT '{}',
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for subtasks
CREATE POLICY "Users can view subtasks of their tasks" 
  ON public.subtasks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create subtasks for their tasks" 
  ON public.subtasks 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update subtasks of their tasks" 
  ON public.subtasks 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete subtasks of their tasks" 
  ON public.subtasks 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Create function to handle time range adjustments
CREATE OR REPLACE FUNCTION public.adjust_task_times_on_insert(
  p_user_id UUID,
  p_insert_time TIMESTAMP WITH TIME ZONE,
  p_duration_minutes INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Push back tasks that start after the insertion time and are not fixed
  UPDATE public.tasks 
  SET 
    start_time = start_time + (p_duration_minutes || ' minutes')::INTERVAL,
    end_time = end_time + (p_duration_minutes || ' minutes')::INTERVAL,
    updated_at = now()
  WHERE 
    user_id = p_user_id 
    AND start_time >= p_insert_time 
    AND is_fixed_time = false
    AND start_time IS NOT NULL;
END;
$$;

-- Create function to handle time range adjustments on deletion
CREATE OR REPLACE FUNCTION public.adjust_task_times_on_delete(
  p_user_id UUID,
  p_delete_start_time TIMESTAMP WITH TIME ZONE,
  p_duration_minutes INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Pull forward tasks that start after the deleted task and are not fixed
  UPDATE public.tasks 
  SET 
    start_time = start_time - (p_duration_minutes || ' minutes')::INTERVAL,
    end_time = end_time - (p_duration_minutes || ' minutes')::INTERVAL,
    updated_at = now()
  WHERE 
    user_id = p_user_id 
    AND start_time >= p_delete_start_time 
    AND is_fixed_time = false
    AND start_time IS NOT NULL;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_start_time ON public.tasks(start_time);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id);
