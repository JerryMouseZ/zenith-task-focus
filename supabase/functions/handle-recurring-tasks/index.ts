import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
    );

    // Fetch tasks that are completed and have a recurrence rule
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('completed', true)
      .neq('recurrence', 'none');

    if (fetchError) {
      throw fetchError;
    }

    if (!tasks || tasks.length === 0) {
        return new Response(JSON.stringify({ message: 'No recurring tasks to process.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    const processingPromises = tasks.map(task => 
      supabase.rpc('handle_completed_recurring_task', { task_id_arg: task.id })
    );

    const results = await Promise.allSettled(processingPromises);

    const log = results.map((result, index) => {
        const taskId = tasks[index].id;
        if (result.status === 'fulfilled') {
            return `Successfully processed task ${taskId}.`;
        } else {
            console.error(`Error processing task ${taskId}:`, result.reason);
            return `Failed to process task ${taskId}.`;
        }
    });

    return new Response(JSON.stringify({ message: 'Recurring tasks processing finished.', log }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
