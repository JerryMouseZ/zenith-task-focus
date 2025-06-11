CREATE OR REPLACE FUNCTION public.handle_completed_recurring_task(task_id_arg uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  original_task record;
  next_due_date timestamptz;
  base_date timestamptz;
BEGIN
  -- Select the task to be processed
  SELECT * INTO original_task FROM public.tasks WHERE id = task_id_arg;

  -- Ensure the task is completed and has a recurrence rule
  IF original_task.completed = TRUE AND original_task.recurrence != 'none' THEN

    -- Use due_date as base, fallback to created_at
    base_date := COALESCE(original_task.due_date, original_task.created_at);

    -- Calculate the next due date
    next_due_date := CASE original_task.recurrence
      WHEN 'daily' THEN base_date + interval '1 day'
      WHEN 'weekly' THEN base_date + interval '7 days'
      WHEN 'monthly' THEN base_date + interval '1 month'
      ELSE base_date -- Should not be reached due to the IF condition
    END;

    -- Proceed only if the next date is within the recurrence period
    IF original_task.recurrence_end_date IS NULL OR next_due_date <= original_task.recurrence_end_date THEN
      -- Create the new task instance
      INSERT INTO public.tasks (
        user_id, title, description, status, priority, due_date,
        start_time, end_time, is_fixed_time, tags, estimated_time,
        actual_time, project_id, parent_id, completed, recurrence, recurrence_end_date
      )
      VALUES (
        original_task.user_id,
        original_task.title,
        original_task.description,
        'todo', -- Reset status
        original_task.priority,
        next_due_date, -- Set new due date
        NULL, -- Reset start_time
        NULL, -- Reset end_time
        original_task.is_fixed_time,
        original_task.tags,
        original_task.estimated_time,
        NULL, -- Reset actual_time
        original_task.project_id,
        original_task.parent_id,
        FALSE, -- Reset completed status
        original_task.recurrence, -- Keep the recurrence rule
        original_task.recurrence_end_date -- Keep the end date
      );
    END IF;

    -- Update the original task to prevent it from being processed again
    -- by setting its recurrence to 'none'.
    UPDATE public.tasks
    SET recurrence = 'none'
    WHERE id = task_id_arg;

  END IF;
END;
$$;
