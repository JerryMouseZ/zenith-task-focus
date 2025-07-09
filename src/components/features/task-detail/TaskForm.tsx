import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Lock, X } from "lucide-react";
import { Task, TaskStatus, TaskPriority, EnergyLevel } from "@/types/task";
import { statusOptions, priorityOptions, energyLevelOptions, COMMON_CONTEXT_TAGS, getEnergyLevelLabel } from "@/utils/taskUtils";
import { useState } from "react";

interface TaskFormProps {
  editedTask: Partial<Task>;
  isEditing: boolean;
  estimatedDays: number;
  estimatedHours: number;
  onTaskChange: (updates: Partial<Task>) => void;
  onEstimatedDaysChange: (days: number) => void;
  onEstimatedHoursChange: (hours: number) => void;
  onCompletedToggle: (checked: boolean) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  editedTask,
  isEditing,
  estimatedDays,
  estimatedHours,
  onTaskChange,
  onEstimatedDaysChange,
  onEstimatedHoursChange,
  onCompletedToggle,
}) => {
  const [newContextTag, setNewContextTag] = useState("");

  const handleAddContextTag = (tag: string) => {
    if (tag && !editedTask.contextTags?.includes(tag)) {
      const currentTags = editedTask.contextTags || [];
      onTaskChange({ contextTags: [...currentTags, tag] });
    }
    setNewContextTag("");
  };

  const handleRemoveContextTag = (tagToRemove: string) => {
    const currentTags = editedTask.contextTags || [];
    onTaskChange({ contextTags: currentTags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          任务标题 *
        </label>
        {isEditing ? (
          <Input
            value={editedTask.title || ""}
            onChange={(e) => onTaskChange({ title: e.target.value })}
            placeholder="输入任务标题..."
            className="text-lg"
          />
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">{editedTask.title}</h2>
            {editedTask.isFixedTime && (
              <div className="flex items-center" title="固定时间任务">
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completed Checkbox */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Checkbox
            checked={!!editedTask.completed}
            onCheckedChange={onCompletedToggle}
          />
          标记为已完成
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          描述
        </label>
        {isEditing ? (
          <Textarea
            value={editedTask.description || ""}
            onChange={(e) => onTaskChange({ description: e.target.value })}
            placeholder="添加描述..."
            rows={4}
          />
        ) : (
          <p className="text-gray-600">
            {editedTask.description || "暂无描述"}
          </p>
        )}
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            状态
          </label>
          {isEditing ? (
            <Select
              value={editedTask.status || TaskStatus.TODO}
              onValueChange={(value) => onTaskChange({ status: value as TaskStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-gray-600">
              {statusOptions.find(s => s.value === editedTask.status)?.label}
            </span>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            优先级
          </label>
          {isEditing ? (
            <Select
              value={editedTask.priority || TaskPriority.MEDIUM}
              onValueChange={(value) => onTaskChange({ priority: value as TaskPriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-gray-600">
              {priorityOptions.find(p => p.value === editedTask.priority)?.label}
            </span>
          )}
        </div>
      </div>

      {/* Energy Level and Context Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            精力等级
          </label>
          {isEditing ? (
            <Select
              value={editedTask.energyLevel || EnergyLevel.MEDIUM}
              onValueChange={(value) => onTaskChange({ energyLevel: value as EnergyLevel })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {energyLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-gray-600">
              {getEnergyLevelLabel(editedTask.energyLevel || EnergyLevel.MEDIUM)}
            </span>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            情境标签
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-1">
                <Input
                  value={newContextTag}
                  onChange={(e) => setNewContextTag(e.target.value)}
                  placeholder="添加情境标签..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddContextTag(newContextTag);
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {COMMON_CONTEXT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddContextTag(tag)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={editedTask.contextTags?.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          
          {/* Display current context tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {editedTask.contextTags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContextTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Time Checkbox */}
      {isEditing && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="fixedTime"
            checked={editedTask.isFixedTime || false}
            onCheckedChange={(checked) => onTaskChange({ isFixedTime: checked as boolean })}
          />
          <label htmlFor="fixedTime" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            固定时间任务（不能被自动调整时间）
          </label>
        </div>
      )}

      {/* Due Date and Start Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            截止时间
          </label>
          {isEditing ? (
            <Input
              type="datetime-local"
              value={editedTask.dueDate ? editedTask.dueDate.toISOString().slice(0, 16) : ""}
              onChange={(e) => onTaskChange({ 
                dueDate: e.target.value ? new Date(e.target.value) : undefined 
              })}
            />
          ) : (
            <span className="text-gray-600">
              {editedTask.dueDate ? editedTask.dueDate.toLocaleString() : "无截止时间"}
            </span>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            开始时间
          </label>
          {isEditing ? (
            <Input
              type="datetime-local"
              value={editedTask.startTime ? editedTask.startTime.toISOString().slice(0, 16) : ""}
              onChange={(e) => onTaskChange({ 
                startTime: e.target.value ? new Date(e.target.value) : undefined 
              })}
            />
          ) : (
            <span className="text-gray-600">
              {editedTask.startTime ? editedTask.startTime.toLocaleString() : "无开始时间"}
            </span>
          )}
        </div>
      </div>

      {/* Estimated Time */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          预估时间
        </label>
        {isEditing ? (
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={0}
              value={estimatedDays}
              onChange={(e) => onEstimatedDaysChange(parseInt(e.target.value) || 0)}
              placeholder="天"
              className="w-20"
            />
            <span>天</span>
            <Input
              type="number"
              min={0}
              max={23}
              value={estimatedHours}
              onChange={(e) => {
                let hours = parseInt(e.target.value) || 0;
                if (hours > 23) hours = 23;
                onEstimatedHoursChange(hours);
              }}
              placeholder="小时"
              className="w-20"
            />
            <span>小时</span>
          </div>
        ) : (
          <span className="text-gray-600">
            {editedTask.estimatedTime && editedTask.estimatedTime > 0
              ? `${Math.floor(editedTask.estimatedTime / 1440)} 天 ${Math.floor((editedTask.estimatedTime % 1440) / 60)} 小时`
              : "未预估"}
          </span>
        )}
      </div>

      {/* Recurrence Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="recurrence" className="text-sm font-medium text-gray-700 mb-2 block">
            循环设置
          </label>
          <Select
            value={editedTask.recurrence || 'none'}
            onValueChange={(value) => onTaskChange({ recurrence: value })}
            disabled={!isEditing}
          >
            <SelectTrigger id="recurrence">
              <SelectValue placeholder="选择循环频率" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">不循环</SelectItem>
              <SelectItem value="daily">每天</SelectItem>
              <SelectItem value="weekly">每周</SelectItem>
              <SelectItem value="monthly">每月</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {editedTask.recurrence && editedTask.recurrence !== 'none' && (
          <div>
            <label htmlFor="recurrence_end_date" className="text-sm font-medium text-gray-700 mb-2 block">
              循环结束日期
            </label>
            <Input
              id="recurrence_end_date"
              type="date"
              value={editedTask.recurrence_end_date ? new Date(editedTask.recurrence_end_date).toISOString().split('T')[0] : ''}
              onChange={(e) => onTaskChange({ recurrence_end_date: e.target.value ? new Date(e.target.value) : undefined })}
              disabled={!isEditing}
            />
          </div>
        )}
      </div>
    </div>
  );
};
