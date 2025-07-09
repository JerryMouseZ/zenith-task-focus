import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Clock, Zap, MapPin, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { TaskDetailModal } from "./TaskDetailModal";

interface TaskSuggestion {
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  energyLevel: 'high' | 'medium' | 'low';
  contextTags: string[];
  estimatedTime: number;
  tags: string[];
  reason: string;
}

interface AiTaskSuggestionsProps {
  currentTask?: Task | null;
  recentTasks?: Task[];
  onTaskCreated?: () => void;
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const energyColors = {
  high: 'bg-purple-100 text-purple-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800'
};

export const AiTaskSuggestions = ({ 
  currentTask, 
  recentTasks, 
  onTaskCreated 
}: AiTaskSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<TaskSuggestion | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { profile } = useProfile();

  const loadSuggestions = async () => {
    if (!profile?.ai_api_key || !profile?.ai_base_url || !profile?.ai_model) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-task-suggestions', {
        body: {
          currentTask,
          recentTasks: recentTasks?.slice(0, 5), // 只传最近5个任务
          aiConfig: {
            apiKey: profile.ai_api_key,
            baseUrl: profile.ai_base_url,
            model: profile.ai_model
          },
          timezone: profile?.timezone
        }
      });

      if (error) throw error;

      if (data.success) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      toast.error('加载AI建议失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [currentTask, recentTasks, profile]);

  const handleCreateTask = (suggestion: TaskSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setSelectedSuggestion(null);
    if (onTaskCreated) {
      onTaskCreated();
    }
  };

  // 转换建议为Task格式
  const convertSuggestionToTask = (suggestion: TaskSuggestion): Partial<Task> => {
    return {
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority as any,
      energyLevel: suggestion.energyLevel as any,
      contextTags: suggestion.contextTags,
      estimatedTime: suggestion.estimatedTime,
      tags: suggestion.tags,
      status: 'todo' as any,
      completed: false,
      subtasks: [],
      recurrence: 'none' as any
    };
  };

  if (!profile?.ai_api_key || !profile?.ai_base_url || !profile?.ai_model) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="w-4 h-4" />
            AI任务建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            请先在设置中配置AI参数以启用智能任务建议功能
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4" />
              AI任务建议
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSuggestions}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无建议，请稍后刷新</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateTask(suggestion)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {suggestion.description && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {suggestion.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-0.5 ${priorityColors[suggestion.priority]}`}
                    >
                      {suggestion.priority}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-0.5 ${energyColors[suggestion.energyLevel]}`}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {suggestion.energyLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {suggestion.estimatedTime}分钟
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {suggestion.contextTags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="text-xs px-2 py-0.5"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    {suggestion.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSuggestion && (
        <TaskDetailModal
          task={null}
          initialTask={convertSuggestionToTask(selectedSuggestion)}
          isOpen={showTaskForm}
          onClose={handleCloseTaskForm}
        />
      )}
    </>
  );
};