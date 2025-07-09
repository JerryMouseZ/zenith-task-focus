
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aiConfig, timezone } = await req.json();
    // timezone 由前端传递，默认 Asia/Shanghai 或 +08:00
    const userTimezone = timezone || 'Asia/Shanghai';
    
    if (!aiConfig || !aiConfig.apiKey || !aiConfig.baseUrl || !aiConfig.model) {
      throw new Error('AI configuration is required');
    }

    const currentTime = new Date().toISOString();
    
    // 明确告知AI当前用户时区，并要求所有时间字段返回UTC（ISO 8601，带Z后缀）
    const systemPrompt = `你是一个智能任务解析助手。请将以下文本解析为一个或多个任务的 JSON 对象。

解析规则：
1. 如果文本包含多个任务（如"1. xxx 2. xxx"或用分号、换行分隔），请返回一个数组
2. 如果只有一个任务，返回单个对象
3. 为每个任务生成简洁、清晰的标题，将具体细节放入description字段

每个任务对象包含以下字段：
- title: 简洁的任务标题（不超过20个字符，突出核心内容）
- description: 详细描述和具体要求（包含原始文本中的具体细节）
- dueDate: ISO 8601 格式的截止日期（可选，必须为UTC时间，带Z后缀）
- endTime: ISO 8601 格式的结束时间（可选，必须为UTC时间，带Z后缀）
- isFixedTime: 布尔值，如果指定了具体时间则为true
- priority: 从 'urgent', 'high', 'medium', 'low' 中选择
- tags: 字符串数组，从文本中提取项目名、课程名、技术栈等关键词
- contextTags: 字符串数组，从预定义上下文中选择
- energyLevel: 从 'high', 'medium', 'low' 中选择
- estimatedTime: 数字，预估时长（单位：分钟）
- recurrence: 字符串，从 'none', 'daily', 'weekly', 'monthly' 中选择，默认为 'none'
- recurrence_end_date: ISO 8601 格式的循环截止日期（可选，必须为UTC时间，带Z后缀）

智能解析增强规则：

**标题生成规则：**
- 提取核心动作和对象，去除冗余信息
- 例如："星期五之前完成OS作业cp1的更多测试" → "OS作业cp1测试"
- 例如："debug OS作业cp2的死锁问题" → "OS作业cp2死锁调试"

**优先级智能识别：**
- 'urgent': "紧急"、"立即"、"马上"、"急需"、"ASAP"
- 'high': "重要"、"优先"、"关键"、"尽快"、"重要程度高"、"高优先级"
- 'medium': "一般"、"常规"、"正常"或默认情况
- 'low': "不急"、"有空时"、"可以延后"、"低优先级"

**能量级别智能识别：**
- 'high': "消耗精力高"、"高精力"、"复杂"、"困难"、"debug"、"编程"、"设计"、"创作"、"学习"、"研究"
- 'medium': "中等精力"、"一般难度"、"会议"、"沟通"、"整理"
- 'low': "简单"、"轻松"、"消耗精力低"、"低精力"、"查看"、"回复"

**上下文标签智能判断：**
- '@电脑前': 编程、debug、写作业、设计、办公
- '@通勤路上': 阅读、听音频、思考
- '@碎片时间': 查看消息、简单回复、快速整理
- '@会议室': 团队讨论、汇报、培训
- '@家中': 个人学习、休息、家庭事务
- '@外出办事': 购买、办证、见面
- '@休息时间': 娱乐、运动、放松

**时间解析规则：**
- 当前用户时区：'${userTimezone}'
- 当前时间：'${currentTime}'
- 请将所有解析到的时间都转换为 UTC（ISO 8601，带Z后缀）后返回
- "星期X之前"、"周X前" → 解析为对应日期的23:59
- "X月X日前"、"X号前" → 解析为具体日期
- 预估时间关键词："需要X小时"、"大概X分钟"、"预计X小时" → 转换为分钟数
- 如果文本中包含"每天"、"每日"等词语，将 recurrence 设为 'daily'
- 如果文本中包含"每周"、"周常"等词语，将 recurrence 设为 'weekly'
- 如果文本中包含"每月"、"月度"等词语，将 recurrence 设为 'monthly'
- 如果文本中指定了循环截止条件（如"到7月之前"、"直到下个月"），请解析为具体的截止日期并填充到 recurrence_end_date 字段
- 如果文本中包含"预计"、"耗时"、"大概"等描述时长（如"2小时"、"30分钟"）的词语，请解析为总分钟数并填充到 estimatedTime 字段。例如，"预计2小时"应解析为 120
- 如果是"在什么时间之前完成"，则填充 dueDate


**标签提取规则：**
- 课程相关：OS、数据结构、算法、数学等
- 项目相关：cp1、cp2、作业、项目名称
- 技术相关：debug、测试、开发、设计
- 人名、地点、工具名称

**多任务处理：**
- 识别"1. 2."、"a) b)"、"• •"、分号、换行等分隔符
- 为每个子任务生成独立的对象
- 共享的属性（如截止时间）应用到所有子任务

示例输入："星期五之前完成1. OS作业cp1的更多测试 2. OS作业cp2死锁的debug.消耗精力高，重要程度高"

期望输出：
[
  {
    "title": "OS作业cp1测试",
    "description": "完成OS作业cp1的更多测试，消耗精力高，重要程度高",
    "dueDate": "2025-07-11T15:59:00Z",
    "priority": "high",
    "energyLevel": "high",
    "tags": ["OS", "作业", "cp1", "测试"],
    "contextTags": ["@电脑前"],
    "estimatedTime": 120
  },
  {
    "title": "OS作业cp2死锁调试", 
    "description": "调试OS作业cp2的死锁问题，消耗精力高，重要程度高",
    "dueDate": "2025-07-11T15:59:00Z",
    "priority": "high",
    "energyLevel": "high", 
    "tags": ["OS", "作业", "cp2", "debug", "死锁"],
    "contextTags": ["@电脑前"],
    "estimatedTime": 180
  }
]

只返回有效的JSON格式，不要包含任何其他文本、解释或格式化标记。`;

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
        max_tokens: 65536
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
    
    // Find JSON content - support both objects and arrays
    let jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    console.log('Cleaned content for parsing:', content);
    
    // Parse the JSON response from AI
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      
      // Fallback: try to create a basic task from the prompt
      parsedResult = {
        title: prompt.substring(0, 50),
        description: prompt,
        priority: 'medium',
        energyLevel: 'medium',
        tags: [],
        contextTags: [],
        isFixedTime: false
      };
    }

    // Function to validate and normalize a single task
    const validateTask = (task: any) => {
      // Validate and set defaults for required fields
      if (!task.title) {
        task.title = prompt.substring(0, 50);
      }
      if (!task.priority) {
        task.priority = 'medium';
      }
      if (!task.energyLevel) {
        task.energyLevel = 'medium';
      }
      if (!task.tags) {
        task.tags = [];
      }
      if (!task.contextTags) {
        task.contextTags = [];
      }
      if (task.isFixedTime === undefined) {
        task.isFixedTime = false;
      }

      // Convert string dates to Date objects for consistency
      if (task.dueDate) {
        try {
          task.dueDate = new Date(task.dueDate);
        } catch (e) {
          console.error('Invalid dueDate format:', task.dueDate);
          task.dueDate = null;
        }
      }
      if (task.startTime) {
        try {
          task.startTime = new Date(task.startTime);
        } catch (e) {
          console.error('Invalid startTime format:', task.startTime);
          task.startTime = null;
        }
      }
      if (task.endTime) {
        try {
          task.endTime = new Date(task.endTime);
        } catch (e) {
          console.error('Invalid endTime format:', task.endTime);
          task.endTime = null;
        }
      }

      return task;
    };

    // Handle both single task and multiple tasks
    let finalResult;
    if (Array.isArray(parsedResult)) {
      // Multiple tasks
      finalResult = {
        success: true,
        tasks: parsedResult.map(validateTask),
        isMultiple: true
      };
    } else {
      // Single task
      finalResult = {
        success: true,
        task: validateTask(parsedResult),
        isMultiple: false
      };
    }

    console.log('Final parsed result:', finalResult);

    return new Response(JSON.stringify(finalResult), {
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
