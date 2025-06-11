-- Add timezone column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add reminder_sent_at column to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Optionally, update policies if needed, though for these columns, it's unlikely.
-- Add comments to explain the changes.
