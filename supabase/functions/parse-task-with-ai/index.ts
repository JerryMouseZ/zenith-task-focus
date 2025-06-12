
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aiConfig } = await req.json();
    
    if (!aiConfig || !aiConfig.apiKey || !aiConfig.baseUrl || !aiConfig.model) {
      throw new Error('AI configuration is required');
    }

    const currentTime = new Date().toISOString();
    
    const systemPrompt = `你是一个任务解析助手。请将以下文本解析为一个 JSON 对象，包含以下字段：
- title: 任务的核心内容
- description: 额外细节（可选）
- dueDate: ISO 8601 格式的截止日期（可选）
- startTime: ISO 8601 格式的开始时间（可选）
- endTime: ISO 8601 格式的结束时间（可选）
- isFixedTime: 布尔值，如果指定了具体时间则为true
- priority: 从 'high', 'medium', 'low' 中选择，默认为 'medium'
- tags: 字符串数组，从文本中提取人名、项目名等

解析规则：
- 如果文本中包含"紧急"、"重要"、"优先"等词语，将 priority 设为 'high'
- 如果文本中包含日期或时间，请基于当前时间 '${currentTime}' 转换为完整的 ISO 8601 格式
- 如果是"在什么时间之前完成"，则填充 dueDate
- 如果是"在什么时间开始"或具体时间安排，则填充 startTime 并将 isFixedTime 设为 true
- 如果指定了时间段，则同时填充 startTime 和 endTime
- 从文本中提取人名、项目名、地点等作为 tags

只返回JSON对象，不要包含任何其他文本、解释或格式化标记。确保返回的是有效的JSON格式。`;

    const response = await fetch(`${aiConfig.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
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
    
    // Find JSON content between braces
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    console.log('Cleaned content for parsing:', content);
    
    // Parse the JSON response from AI
    let parsedTask;
    try {
      parsedTask = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      
      // Fallback: try to create a basic task from the prompt
      parsedTask = {
        title: prompt.substring(0, 100),
        description: prompt.length > 100 ? prompt : null,
        priority: 'medium',
        tags: [],
        isFixedTime: false
      };
    }

    // Validate and set defaults for required fields
    if (!parsedTask.title) {
      parsedTask.title = prompt.substring(0, 100);
    }
    if (!parsedTask.priority) {
      parsedTask.priority = 'medium';
    }
    if (!parsedTask.tags) {
      parsedTask.tags = [];
    }
    if (parsedTask.isFixedTime === undefined) {
      parsedTask.isFixedTime = false;
    }

    // Convert string dates to Date objects for consistency
    if (parsedTask.dueDate) {
      try {
        parsedTask.dueDate = new Date(parsedTask.dueDate);
      } catch (e) {
        console.error('Invalid dueDate format:', parsedTask.dueDate);
        parsedTask.dueDate = null;
      }
    }
    if (parsedTask.startTime) {
      try {
        parsedTask.startTime = new Date(parsedTask.startTime);
      } catch (e) {
        console.error('Invalid startTime format:', parsedTask.startTime);
        parsedTask.startTime = null;
      }
    }
    if (parsedTask.endTime) {
      try {
        parsedTask.endTime = new Date(parsedTask.endTime);
      } catch (e) {
        console.error('Invalid endTime format:', parsedTask.endTime);
        parsedTask.endTime = null;
      }
    }

    console.log('Final parsed task:', parsedTask);

    return new Response(JSON.stringify({ success: true, task: parsedTask }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-task-with-ai function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
