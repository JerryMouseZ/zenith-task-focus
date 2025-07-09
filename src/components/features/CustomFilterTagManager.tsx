import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomFilterTag } from '@/types/smartViews';
import { Plus, Edit, Trash2, Tag, Hash } from 'lucide-react';

interface CustomFilterTagManagerProps {
  tags: CustomFilterTag[];
  onTagCreate: (tag: Omit<CustomFilterTag, 'id'>) => void;
  onTagUpdate: (tagId: string, updates: Partial<CustomFilterTag>) => void;
  onTagDelete: (tagId: string) => void;
}

export const CustomFilterTagManager = ({ 
  tags, 
  onTagCreate, 
  onTagUpdate, 
  onTagDelete 
}: CustomFilterTagManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CustomFilterTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6', // 默认蓝色
  });

  const predefinedColors = [
    { name: '蓝色', value: '#3b82f6' },
    { name: '绿色', value: '#10b981' },
    { name: '紫色', value: '#8b5cf6' },
    { name: '红色', value: '#ef4444' },
    { name: '黄色', value: '#f59e0b' },
    { name: '粉色', value: '#ec4899' },
    { name: '青色', value: '#06b6d4' },
    { name: '橙色', value: '#f97316' },
    { name: '灰色', value: '#6b7280' },
    { name: '靛蓝', value: '#6366f1' },
  ];

  const handleSubmit = () => {
    const tagData = {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      userId: 'current-user-id', // 这里应该从用户上下文获取
    };

    if (editingTag) {
      onTagUpdate(editingTag.id, tagData);
    } else {
      onTagCreate(tagData);
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingTag(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
    });
  };

  const handleEdit = (tag: CustomFilterTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color,
    });
    setIsAddDialogOpen(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsAddDialogOpen(false);
    setEditingTag(null);
  };

  const getColorStyle = (color: string) => ({
    backgroundColor: color,
    borderColor: color,
  });

  const getBadgeStyle = (color: string) => ({
    backgroundColor: `${color}20`,
    borderColor: color,
    color: color,
  });

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          <h3 className="font-semibold">自定义筛选标签</h3>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingTag(null)}>
              <Plus className="w-4 h-4 mr-1" />
              新建标签
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTag ? '编辑标签' : '创建自定义标签'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tagName">标签名称 *</Label>
                <Input
                  id="tagName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入标签名称"
                />
              </div>

              <div>
                <Label htmlFor="tagDescription">描述</Label>
                <Input
                  id="tagDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入标签描述（可选）"
                />
              </div>

              <div>
                <Label>颜色</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {predefinedColors.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === colorOption.value ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={getColorStyle(colorOption.value)}
                      title={colorOption.name}
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-8"
                  />
                </div>
              </div>

              {/* 预览 */}
              <div>
                <Label>预览</Label>
                <div className="mt-2">
                  <Badge 
                    variant="outline" 
                    className="border-2"
                    style={getBadgeStyle(formData.color)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {formData.name || '标签名称'}
                  </Badge>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
                  {editingTag ? '更新' : '创建'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 标签列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <Card key={tag.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className="border-2"
                    style={getBadgeStyle(tag.color)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </Badge>
                </div>
                {tag.description && (
                  <p className="text-sm text-muted-foreground">{tag.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(tag)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onTagDelete(tag.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>还没有创建自定义标签</p>
          <p className="text-sm">点击上方按钮创建第一个标签</p>
        </div>
      )}

      {/* 使用说明 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">使用说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 自定义标签可以用于更精细的任务分类</li>
          <li>• 创建任务时可以选择这些标签进行标记</li>
          <li>• 在智能视图中可以根据这些标签进行筛选</li>
          <li>• 标签颜色会在任务卡片中显示，便于快速识别</li>
        </ul>
      </Card>
    </div>
  );
};