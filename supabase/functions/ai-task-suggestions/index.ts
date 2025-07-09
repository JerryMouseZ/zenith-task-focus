import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentTask, recentTasks, aiConfig, timezone } = await req.json();
    
    if (!aiConfig || !aiConfig.apiKey || !aiConfig.baseUrl || !aiConfig.model) {
      throw new Error('AI configuration is required');
    }

    const userTimezone = timezone || 'Asia/Shanghai';
    const currentTime = new Date().toISOString();
    
    // 分析当前任务类型并生成相关建议
    const systemPrompt = `你是一个智能任务建议助手。根据用户当前的任务和最近的任务历史，生成5个相关的任务建议。

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

最近任务历史：
${recentTasks?.map((task: any, index: number) => `
${index + 1}. ${task.title} (${task.priority}优先级, ${task.energyLevel}能量级别)
   标签: ${task.tags?.join(', ') || '无'}
   上下文: ${task.contextTags?.join(', ') || '无'}
`).join('') || '无最近任务'}

请根据以上信息生成相关的任务建议。建议应该：
1. 与当前任务或最近任务相关
2. 考虑任务的上下文、能量级别和优先级
3. 提供不同类型的任务（深度工作、碎片时间、会议准备等）
4. 包含合适的时间估算和上下文标签

返回格式为JSON数组，每个建议包含：
- title: 任务标题
- description: 任务描述（可选）
- priority: 优先级 ('urgent', 'high', 'medium', 'low')
- energyLevel: 能量级别 ('high', 'medium', 'low')
- contextTags: 上下文标签数组
- estimatedTime: 预估时间（分钟）
- tags: 相关标签数组
- reason: 推荐理由（简短说明）

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
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);
    
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
        reason: suggestion.reason || '基于相关任务推荐'
      }));
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      
      // Fallback: generate generic suggestions
      suggestions = [
        {
          title: '整理任务清单',
          description: '回顾和整理当前的任务清单',
          priority: 'medium',
          energyLevel: 'low',
          contextTags: ['@碎片时间'],
          estimatedTime: 15,
          tags: ['整理', '回顾'],
          reason: '定期整理有助于提高效率'
        },
        {
          title: '计划下一步工作',
          description: '为接下来的工作制定详细计划',
          priority: 'high',
          energyLevel: 'medium',
          contextTags: ['@电脑前'],
          estimatedTime: 30,
          tags: ['计划', '工作'],
          reason: '良好的计划是成功的基础'
        }
      ];
    }

    console.log('Final suggestions:', suggestions);

    return new Response(JSON.stringify({ 
      success: true, 
      suggestions: suggestions.slice(0, 5) // 限制最多5个建议
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