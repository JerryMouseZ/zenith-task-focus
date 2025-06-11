// supabase/functions/send-reminders/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface Task {
  id: string;
  title: string;
  due_date: string; // ISO string
  user_id: string;
  // other fields if needed by the function
}

interface Profile {
  timezone?: string;
  // other fields if needed
}

// Helper function to format date, ensuring it's a Deno environment
function formatDateForFeishu(isoDueDate: string, targetTimeZone: string | undefined): string {
  const date = new Date(isoDueDate);
  let options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  };

  if (targetTimeZone && targetTimeZone !== 'UTC') {
    try {
      // Check if timezone is valid before using
      new Intl.DateTimeFormat('en-US', { timeZone: targetTimeZone }).format(date);
      options.timeZone = targetTimeZone;
    } catch (e) {
      console.warn(`Invalid or unsupported timezone: ${targetTimeZone}. Defaulting to UTC.`);
      options.timeZone = 'UTC';
    }
  } else {
    options.timeZone = 'UTC';
  }

  let formattedDate = date.toLocaleString('en-US', options); // Adjust locale as needed
  if (options.timeZone) {
     formattedDate += ` (${options.timeZone})`;
  }
  return formattedDate;
}


serve(async (req: Request) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const feishuWebhookUrl = Deno.env.get('FEISHU_WEBHOOK_URL');

    if (!supabaseUrl || !supabaseAnonKey || !feishuWebhookUrl) {
      console.error('Missing environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, or FEISHU_WEBHOOK_URL');
      return new Response(JSON.stringify({ error: 'Missing configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const now = new Date();
    // Fetch tasks due between now and ~2 hours 5 mins from now.
    // The inner loop will further refine if it's exactly 2 hours before due.
    const reminderWindowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000);   // 2 hours 5 minutes from now

    // 1. Fetch tasks that are due within the next ~2 hours, not completed, and no reminder sent
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, due_date, user_id')
      .is('reminder_sent_at', null) // Reminder not yet sent
      .neq('status', 'completed')   // Not completed
      .neq('status', 'deleted')     // Not deleted
      .lte('due_date', reminderWindowEnd.toISOString()) // Due date is within the reminder window end
      .gte('due_date', now.toISOString()); // Due date is in the future from now (prevents old tasks)


    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      console.log('No tasks found needing reminders in the initial fetch window.');
      return new Response(JSON.stringify({ message: 'No tasks to remind in the window.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let remindersSentCount = 0;

    for (const task of tasks as Task[]) {
      const dueDate = new Date(task.due_date);
      // Calculate the exact time when a reminder should be sent (2 hours before due date)
      const reminderTime = new Date(dueDate.getTime() - 2 * 60 * 60 * 1000);

      // Check if it's time to send the reminder (current time is past the calculated reminder time)
      // And also ensure we are not sending it too late (e.g. if due_date itself is very close to now or in past)
      if (now >= reminderTime && now < dueDate) {
        // Fetch user's profile for timezone
        let userTimeZone: string | undefined = 'UTC'; // Default to UTC
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', task.user_id)
          .single();

        if (profileError) {
          console.warn(`Error fetching profile for user ${task.user_id}:`, profileError.message);
          // Proceed with UTC if profile fetch fails
        } else if (profile && (profile as Profile).timezone) {
          userTimeZone = (profile as Profile).timezone;
        }

        const formattedDueDate = formatDateForFeishu(task.due_date, userTimeZone);
        const messageBody = {
          msg_type: 'text',
          content: {
            text: `Reminder: Task "${task.title}" is due at ${formattedDueDate}.`,
          },
        };

        // Send to Feishu
        try {
          const feishuResponse = await fetch(feishuWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageBody),
          });

          if (!feishuResponse.ok) {
            const errorBody = await feishuResponse.text();
            console.error(`Feishu API error for task ${task.id}: ${feishuResponse.status} ${feishuResponse.statusText}`, errorBody);
            // Continue to next task, don't mark as reminder sent
            continue;
          }

          console.log(`Feishu reminder sent for task ${task.id}`);

          // Update task to mark reminder as sent
          const { error: updateError } = await supabase
            .from('tasks')
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq('id', task.id);

          if (updateError) {
            console.error(`Error updating task ${task.id} after sending reminder:`, updateError);
            // If update fails, the reminder might be sent again. This is a trade-off.
          } else {
            remindersSentCount++;
          }

        } catch (feishuError) {
          console.error(`Failed to send Feishu message for task ${task.id}:`, feishuError);
          // Continue to next task
        }
      }
    }

    return new Response(JSON.stringify({ message: `Processed tasks. Reminders sent: ${remindersSentCount}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unhandled error in send-reminders function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
