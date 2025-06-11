
-- Add timezone column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add reminder_sent_at column to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Add RLS policies for the new columns if they don't exist
-- (The timezone column in profiles will be accessible through existing policies)
-- (The reminder_sent_at column in tasks will be accessible through existing policies)
