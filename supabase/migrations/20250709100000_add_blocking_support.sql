-- Add support for blocked status and blocking information
-- Modify the tasks table to include new statuses and blocking information

-- First, update the status check constraint to include new statuses
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('todo', 'in_progress', 'completed', 'overdue', 'blocked', 'cancelled', 'deleted'));

-- Add new columns for blocking information
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS blocking_info JSONB;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS custom_filter_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_person_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS current_time_minutes INTEGER; -- in minutes
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS context_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS energy_level TEXT DEFAULT 'medium' CHECK (energy_level IN ('low', 'medium', 'high'));

-- Create persons table for team member management
CREATE TABLE IF NOT EXISTS public.persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  role TEXT,
  department TEXT,
  skills TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  default_energy_level TEXT DEFAULT 'medium' CHECK (default_energy_level IN ('low', 'medium', 'high')),
  default_context_tags TEXT[] DEFAULT '{}',
  default_priority TEXT DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'urgent')),
  default_estimated_time INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom filter tags table
CREATE TABLE IF NOT EXISTS public.custom_filter_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_filter_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for persons
CREATE POLICY "Users can view their own persons" 
  ON public.persons 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own persons" 
  ON public.persons 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own persons" 
  ON public.persons 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own persons" 
  ON public.persons 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for custom filter tags
CREATE POLICY "Users can view their own custom filter tags" 
  ON public.custom_filter_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom filter tags" 
  ON public.custom_filter_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom filter tags" 
  ON public.custom_filter_tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom filter tags" 
  ON public.custom_filter_tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add foreign key constraint for assigned person
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assigned_person_id_fkey 
  FOREIGN KEY (assigned_person_id) REFERENCES public.persons(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_user_id ON public.persons(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_filter_tags_user_id ON public.custom_filter_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_person_id ON public.tasks(assigned_person_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_energy_level ON public.tasks(energy_level);

-- Update the priority constraint to include 'urgent'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON public.persons 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_filter_tags_updated_at BEFORE UPDATE ON public.custom_filter_tags 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();