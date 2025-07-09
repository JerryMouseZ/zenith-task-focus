import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentTask, recentTasks, aiConfig, timezone, forceRefresh } = await req.json();
    
    if (!aiConfig || !aiConfig.apiKey || !aiConfig.baseUrl || !aiConfig.model) {
      throw new Error('AI configuration is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header to extract user info
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Use the client's auth token instead of service role for user context
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    
    // Extract user from JWT token
    const { data: { user }, error: authError } = await userSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication');
    }

    // Check for cached suggestions if forceRefresh is not true
    if (!forceRefresh) {
      const { data: cachedSuggestions, error: cacheError } = await supabase
        .from('ai_suggestions_cache')
        .select('suggestions, expires_at')
        .eq('user_id', user.id)
        .single();

      if (!cacheError && cachedSuggestions) {
        const expiresAt = new Date(cachedSuggestions.expires_at);
        if (expiresAt > new Date()) {
          console.log('Returning cached suggestions');
          return new Response(JSON.stringify({ 
            success: true, 
            suggestions: cachedSuggestions.suggestions,
            fromCache: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Query all pending tasks for the user using service role client
    const { data: allTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        is_fixed_time,
        estimated_time,
        actual_time,
        current_time_minutes,
        energy_level,
        context_tags,
        tags,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .in('status', ['todo', 'in_progress'])
      .neq('completed', true)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw new Error(`Failed to fetch tasks from database: ${tasksError.message}`);
    }

    // Query completed tasks for analysis (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: completedTasks, error: completedError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        priority,
        estimated_time,
        actual_time,
        energy_level,
        context_tags,
        tags,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(20);

    if (completedError) {
      console.error('Error fetching completed tasks:', completedError);
      // Continue without completed tasks analysis
    }

    const userTimezone = timezone || 'Asia/Shanghai';
    const currentTime = new Date().toISOString();
    
    // 分析当前任务类型并生成相关建议
    const systemPrompt = `你是一个智能任务建议助手。根据用户当前的任务、所有待完成的任务以及已完成任务的模式，生成2个相关的任务建议。

当前任务信息：
${currentTask ? `
- 标题: ${currentTask.title}
- 描述: ${currentTask.description || '无'}
- 优先级: ${currentTask.priority}
- 能量级别: ${currentTask.energyLevel}
- 上下文标签: ${currentTask.contextTags?.join(', ') || '无'}
- 标签: ${currentTask.tags?.join(', ') || '无'}
- 预估时间: ${currentTask.estimatedTime || '未设置'}分钟
` : '无当前任务'}

所有待完成任务 (${allTasks?.length || 0}个)：
${allTasks?.map((task: any, index: number) => `
${index + 1}. ${task.title} (${task.status})
   - 优先级: ${task.priority}, 能量级别: ${task.energy_level || '未设置'}
   - 标签: ${task.tags?.join(', ') || '无'}
   - 上下文: ${task.context_tags?.join(', ') || '无'}
   - 预估时间: ${task.estimated_time || '未设置'}分钟
   - 实际用时: ${task.actual_time || '未设置'}分钟
   - 当前进度: ${task.current_time_minutes || 0}分钟
   - 描述: ${task.description || '无'}
   - 截止时间: ${task.due_date ? new Date(task.due_date).toLocaleString('zh-CN', { timeZone: userTimezone }) : '未设置'}
`).join('') || '无待完成任务'}

已完成任务分析 (最近30天，共${completedTasks?.length || 0}个)：
${completedTasks?.map((task: any, index: number) => `
${index + 1}. ${task.title}
   - 优先级: ${task.priority}, 能量级别: ${task.energy_level || '未设置'}
   - 标签: ${task.tags?.join(', ') || '无'}
   - 上下文: ${task.context_tags?.join(', ') || '无'}
   - 预估时间: ${task.estimated_time || '未设置'}分钟
   - 实际用时: ${task.actual_time || '未设置'}分钟
   - 时间准确度: ${task.estimated_time && task.actual_time ? `${((task.estimated_time / task.actual_time) * 100).toFixed(1)}%` : '未知'}
`).join('') || '无已完成任务数据'}

最近任务历史：
${recentTasks?.map((task: any, index: number) => `
${index + 1}. ${task.title} (${task.priority}优先级, ${task.energyLevel}能量级别)
   标签: ${task.tags?.join(', ') || '无'}
   上下文: ${task.contextTags?.join(', ') || '无'}
`).join('') || '无最近任务'}

基于以上信息，请分析用户的工作模式并生成任务建议。建议应该：
1. 参考已完成任务的时间模式、优先级偏好和成功率
2. 从待完成任务中选择最合适的任务进行推荐
3. 考虑用户的能量级别和上下文偏好
4. 分析用户的时间估算准确性，提供更现实的时间建议
5. 优先推荐与当前任务相关或具有相似特征的任务
6. 考虑任务的紧急程度和重要性

**重要：建议的任务必须是从待完成任务列表中选择的，不能创建新任务。**

请按照相关性和重要性排序，严格只返回2个最相关的建议。

返回格式为JSON数组，每个建议包含：
- title: 任务标题（必须来自待完成任务列表）
- description: 任务描述（可选）
- priority: 优先级 ('urgent', 'high', 'medium', 'low')
- energyLevel: 能量级别 ('high', 'medium', 'low')
- contextTags: 上下文标签数组
- estimatedTime: 预估时间（分钟，基于历史数据调整）
- tags: 相关标签数组
- reason: 推荐理由（说明为什么现在推荐这个任务，包括基于历史数据的分析）
- source: 建议来源 ('pending_tasks', 'priority_based', 'pattern_based', 'context_based')
- taskId: 对应待完成任务的ID（如果适用）

重要提醒：
1. 严格限制只返回2个建议
2. 建议的任务必须来自待完成任务列表
3. 基于已完成任务的模式来优化建议的准确性

当前用户时区：${userTimezone}
当前时间：${currentTime}

只返回JSON数组，不要包含任何其他文本、解释或格式化标记。`;

    const response = await fetch(`${aiConfig.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 65536  // Increased from 1500 to 3000
      }),
    });

    console.log('AI API response status:', response.status);
    console.log('AI API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error response:', errorText);
      throw new Error(`AI API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('Full AI response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in AI response. Full response:', data);
      throw new Error('No choices in AI response');
    }
    
    const choice = data.choices[0];
    console.log('First choice:', JSON.stringify(choice, null, 2));
    
    if (!choice.message) {
      console.error('No message in choice. Choice:', choice);
      throw new Error('No message in AI response choice');
    }
    
    if (!choice.message.content) {
      console.error('No content in message. Message:', choice.message);
      
      // Check if there's a function call or other response format
      if (choice.message.function_call) {
        console.log('Function call detected:', choice.message.function_call);
        throw new Error('AI returned function call instead of content');
      }
      
      if (choice.finish_reason) {
        console.log('Finish reason:', choice.finish_reason);
        throw new Error(`AI response finished with reason: ${choice.finish_reason}`);
      }
      
      throw new Error('No content in AI response message');
    }
    
    let content = choice.message.content;
    
    console.log('Raw AI response content:', content);
    
    // Clean up the response to extract JSON
    content = content.trim();
    
    // Remove any markdown code block formatting
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON content between brackets
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    console.log('Cleaned content for parsing:', content);
    
    // Parse the JSON response from AI
    let suggestions;
    try {
      suggestions = JSON.parse(content);
      
      // Validate that it's an array
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each suggestion has required fields
      suggestions = suggestions.map((suggestion: any) => ({
        title: suggestion.title || '未知任务',
        description: suggestion.description || '',
        priority: suggestion.priority || 'medium',
        energyLevel: suggestion.energyLevel || 'medium',
        contextTags: Array.isArray(suggestion.contextTags) ? suggestion.contextTags : [],
        estimatedTime: typeof suggestion.estimatedTime === 'number' ? suggestion.estimatedTime : 30,
        tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
        reason: suggestion.reason || '基于相关任务推荐',
        source: suggestion.source || 'pending_tasks',
        taskId: suggestion.taskId || null
      }));
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      
      // Fallback: generate generic suggestions based on pending tasks
      const fallbackSuggestions = [];
      
      if (allTasks && allTasks.length > 0) {
        // Pick the highest priority pending task
        const highPriorityTask = allTasks.find(task => task.priority === 'urgent' || task.priority === 'high') || allTasks[0];
        fallbackSuggestions.push({
          title: highPriorityTask.title,
          description: highPriorityTask.description || '',
          priority: highPriorityTask.priority,
          energyLevel: highPriorityTask.energy_level || 'medium',
          contextTags: highPriorityTask.context_tags || [],
          estimatedTime: highPriorityTask.estimated_time || 30,
          tags: highPriorityTask.tags || [],
          reason: '基于优先级推荐的待完成任务',
          source: 'pending_tasks',
          taskId: highPriorityTask.id
        });
        
        // Pick another task with different characteristics
        const otherTask = allTasks.find(task => 
          task.id !== highPriorityTask.id && 
          (task.energy_level !== highPriorityTask.energy_level || task.priority !== highPriorityTask.priority)
        ) || allTasks[1];
        
        if (otherTask) {
          fallbackSuggestions.push({
            title: otherTask.title,
            description: otherTask.description || '',
            priority: otherTask.priority,
            energyLevel: otherTask.energy_level || 'medium',
            contextTags: otherTask.context_tags || [],
            estimatedTime: otherTask.estimated_time || 30,
            tags: otherTask.tags || [],
            reason: '基于任务多样性推荐',
            source: 'pending_tasks',
            taskId: otherTask.id
          });
        }
      }
      
      suggestions = fallbackSuggestions.length > 0 ? fallbackSuggestions : [
        {
          title: '整理任务清单',
          description: '回顾和整理当前的任务清单',
          priority: 'medium',
          energyLevel: 'low',
          contextTags: ['@碎片时间'],
          estimatedTime: 15,
          tags: ['整理', '回顾'],
          reason: '定期整理有助于提高效率',
          source: 'optimization',
          taskId: null
        },
        {
          title: '计划下一步工作',
          description: '为接下来的工作制定详细计划',
          priority: 'high',
          energyLevel: 'medium',
          contextTags: ['@电脑前'],
          estimatedTime: 30,
          tags: ['计划', '工作'],
          reason: '良好的计划是成功的基础',
          source: 'optimization',
          taskId: null
        }
      ];
    }

    console.log('Final suggestions:', suggestions);

    // Cache the suggestions in the database
    const cacheData = {
      user_id: user.id,
      suggestions: suggestions, // Don't truncate here since AI should return exactly 2
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to cache suggestions:', cacheData);

    // Use upsert to either insert or update existing cache
    const { error: cacheError } = await supabase
      .from('ai_suggestions_cache')
      .upsert(cacheData, { onConflict: 'user_id' });

    if (cacheError) {
      console.error('Failed to cache suggestions:', cacheError);
      // Don't throw error, just continue without caching
    } else {
      console.log('Successfully cached suggestions');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      suggestions: suggestions, // Return all suggestions from AI (should be exactly 2)
      fromCache: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-task-suggestions function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
