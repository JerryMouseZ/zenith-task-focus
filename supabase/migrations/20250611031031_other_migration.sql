
-- Add tags column to tasks table (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'tags') THEN
        ALTER TABLE public.tasks ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add parent_id column to tasks table for task hierarchy
ALTER TABLE public.tasks ADD COLUMN parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create index for parent_id for better performance
CREATE INDEX idx_tasks_parent_id ON public.tasks(parent_id);

-- Create index for tags for better search performance
CREATE INDEX idx_tasks_tags ON public.tasks USING GIN(tags);

-- Update the subtasks table to be optional (keep existing structure but add parent_id relationship)
-- We'll use the parent_id in tasks table instead of the separate subtasks table for simplicity

-- Create a function to get all child tasks
CREATE OR REPLACE FUNCTION public.get_child_tasks(parent_task_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_fixed_time BOOLEAN,
  estimated_time INTEGER,
  actual_time INTEGER,
  tags TEXT[],
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.start_time,
    t.end_time,
    t.is_fixed_time,
    t.estimated_time,
    t.actual_time,
    t.tags,
    t.parent_id,
    t.created_at,
    t.updated_at
  FROM public.tasks t
  WHERE t.parent_id = parent_task_id
    AND t.user_id = auth.uid()
  ORDER BY t.created_at;
$$;

-- Create a function to search tasks by tags
CREATE OR REPLACE FUNCTION public.search_tasks_by_tags(search_tags TEXT[])
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_fixed_time BOOLEAN,
  estimated_time INTEGER,
  actual_time INTEGER,
  tags TEXT[],
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.start_time,
    t.end_time,
    t.is_fixed_time,
    t.estimated_time,
    t.actual_time,
    t.tags,
    t.parent_id,
    t.created_at,
    t.updated_at
  FROM public.tasks t
  WHERE t.tags && search_tags
    AND t.user_id = auth.uid()
  ORDER BY t.created_at;
$$;
