import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Coffee, ArrowRight, Sparkles } from 'lucide-react';

interface CompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeBreak: () => void;
  onNextTask: () => void;
  taskTitle: string;
  actualTime?: number;
  estimatedTime?: number;
}

export const CompletionCelebration = ({
  isOpen,
  onClose,
  onTakeBreak,
  onNextTask,
  taskTitle,
  actualTime,
  estimatedTime
}: CompletionCelebrationProps) => {
  const getEncouragingMessage = () => {
    const messages = [
      "🎉 太棒了！你又完成了一个任务！",
      "🔥 你的专注力真是令人惊叹！",
      "⚡ 你就像闪电一样高效！",
      "🚀 你的执行力简直无敌！",
      "💪 你的坚持和努力值得赞扬！",
      "🌟 你是真正的行动者！",
      "🎯 又一个目标被你征服了！",
      "🏆 你的成就感一定爆棚！",
      "✨ 你的专注力就是你的超能力！",
      "🎊 为你的出色表现鼓掌！"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getTimePerformance = () => {
    if (!actualTime || !estimatedTime) return null;
    
    const efficiency = (estimatedTime / actualTime) * 100;
    
    if (efficiency >= 120) {
      return {
        message: "🚀 你的效率超乎想象！比预期快了很多！",
        color: "text-green-600",
        bgColor: "bg-green-50"
      };
    } else if (efficiency >= 100) {
      return {
        message: "🎯 时间掌控得恰到好处！完美的时间管理！",
        color: "text-blue-600", 
        bgColor: "bg-blue-50"
      };
    } else if (efficiency >= 80) {
      return {
        message: "👍 用时合理，稳扎稳打的风格！",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      };
    } else {
      return {
        message: "💪 虽然用时多了些，但质量更重要！",
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      };
    }
  };

  const timePerformance = getTimePerformance();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-6 py-6">
          {/* 庆祝图标 */}
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>

          {/* 激励消息 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-green-600">
              {getEncouragingMessage()}
            </h2>
            <p className="text-gray-600">
              「{taskTitle}」已经完成！
            </p>
          </div>

          {/* 时间分析 */}
          {timePerformance && (
            <Card className={`p-4 ${timePerformance.bgColor} border-0`}>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-sm font-medium ${timePerformance.color}`}>
                  {timePerformance.message}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                实际用时: {actualTime}分钟 | 预估时间: {estimatedTime}分钟
              </div>
            </Card>
          )}

          {/* 激励语句 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">
              ✨ 每一次完成都是向目标迈进的一大步！
            </p>
            <p className="text-sm text-gray-600 mt-1">
              你的坚持和努力正在创造奇迹！
            </p>
          </div>

          {/* 下一步选择 */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              现在你可以：
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={onTakeBreak}
                variant="outline"
                className="flex-1 hover:bg-blue-50"
              >
                <Coffee className="w-4 h-4 mr-2" />
                小憩一下
              </Button>
              <Button 
                onClick={onNextTask}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                继续下一个
              </Button>
            </div>
          </div>

          {/* 关闭按钮 */}
          <Button 
            onClick={onClose}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            稍后决定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};