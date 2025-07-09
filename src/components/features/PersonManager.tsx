import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Person, EnergyLevel, TaskPriority } from '@/types/task';
import { SmartView } from '@/types/smartViews';
import { User, Plus, Edit, Trash2 } from 'lucide-react';

interface PersonManagerProps {
  smartView: SmartView;
  onPersonCreate: (person: Partial<Person>) => void;
  onPersonUpdate: (personId: string, updates: Partial<Person>) => void;
  onPersonDelete: (personId: string) => void;
  persons: Person[];
}

export const PersonManager = ({ 
  smartView, 
  onPersonCreate, 
  onPersonUpdate, 
  onPersonDelete, 
  persons 
}: PersonManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    avatar: '',
    skills: [] as string[],
    availability: 'available' as 'available' | 'busy' | 'unavailable',
    // 继承自smart view的默认属性
    defaultEnergyLevel: EnergyLevel.MEDIUM,
    defaultContextTags: [] as string[],
    defaultPriority: TaskPriority.MEDIUM,
    defaultEstimatedTime: 30,
  });

  const handleSubmit = () => {
    const personData = {
      ...formData,
      // 如果是新建，自动从smart view继承一些属性
      defaultEnergyLevel: formData.defaultEnergyLevel,
      defaultContextTags: formData.defaultContextTags.length > 0 ? formData.defaultContextTags : [],
      defaultPriority: formData.defaultPriority,
      defaultEstimatedTime: formData.defaultEstimatedTime,
    };

    if (editingPerson) {
      onPersonUpdate(editingPerson.id, personData);
    } else {
      onPersonCreate(personData);
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingPerson(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      avatar: '',
      skills: [],
      availability: 'available',
      defaultEnergyLevel: EnergyLevel.MEDIUM,
      defaultContextTags: [],
      defaultPriority: TaskPriority.MEDIUM,
      defaultEstimatedTime: 30,
    });
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      email: person.email || '',
      role: person.role || '',
      department: person.department || '',
      avatar: person.avatar || '',
      skills: person.skills || [],
      availability: person.availability || 'available',
      defaultEnergyLevel: person.defaultEnergyLevel || EnergyLevel.MEDIUM,
      defaultContextTags: person.defaultContextTags || [],
      defaultPriority: person.defaultPriority || TaskPriority.MEDIUM,
      defaultEstimatedTime: person.defaultEstimatedTime || 30,
    });
    setIsAddDialogOpen(true);
  };

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleContextTagAdd = (tag: string) => {
    if (tag.trim() && !formData.defaultContextTags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        defaultContextTags: [...prev.defaultContextTags, tag.trim()]
      }));
    }
  };

  const handleContextTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      defaultContextTags: prev.defaultContextTags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <h3 className="font-semibold">团队成员</h3>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingPerson(null)}>
              <Plus className="w-4 h-4 mr-1" />
              添加成员
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPerson ? '编辑成员' : '添加新成员'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="请输入邮箱"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">角色</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="如：开发工程师、产品经理"
                  />
                </div>
                <div>
                  <Label htmlFor="department">部门</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="如：技术部、产品部"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="avatar">头像URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="请输入头像URL"
                />
              </div>

              {/* 默认属性（继承自smart view） */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">默认任务属性</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultEnergyLevel">默认精力等级</Label>
                    <Select
                      value={formData.defaultEnergyLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, defaultEnergyLevel: value as EnergyLevel }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EnergyLevel.LOW}>低精力</SelectItem>
                        <SelectItem value={EnergyLevel.MEDIUM}>中精力</SelectItem>
                        <SelectItem value={EnergyLevel.HIGH}>高精力</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultPriority">默认优先级</Label>
                    <Select
                      value={formData.defaultPriority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, defaultPriority: value as TaskPriority }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TaskPriority.LOW}>低优先级</SelectItem>
                        <SelectItem value={TaskPriority.MEDIUM}>中优先级</SelectItem>
                        <SelectItem value={TaskPriority.HIGH}>高优先级</SelectItem>
                        <SelectItem value={TaskPriority.URGENT}>紧急</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="defaultEstimatedTime">默认预计时间（分钟）</Label>
                  <Input
                    id="defaultEstimatedTime"
                    type="number"
                    value={formData.defaultEstimatedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultEstimatedTime: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              {/* 技能标签 */}
              <div>
                <Label>技能标签</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => handleSkillRemove(skill)} className="text-xs">×</button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="添加技能标签"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSkillAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input) {
                        handleSkillAdd(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    添加
                  </Button>
                </div>
              </div>

              {/* 上下文标签 */}
              <div>
                <Label>默认上下文标签</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.defaultContextTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleContextTagRemove(tag)} className="text-xs">×</button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="添加上下文标签（如：@电脑前）"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleContextTagAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input) {
                        handleContextTagAdd(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    添加
                  </Button>
                </div>
              </div>

              {/* 可用性 */}
              <div>
                <Label htmlFor="availability">可用性</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value as 'available' | 'busy' | 'unavailable' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">可用</SelectItem>
                    <SelectItem value="busy">忙碌</SelectItem>
                    <SelectItem value="unavailable">不可用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
                  {editingPerson ? '更新' : '创建'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 成员列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {persons.map((person) => (
          <Card key={person.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{person.name}</h4>
                  <p className="text-sm text-muted-foreground">{person.role}</p>
                  {person.department && (
                    <p className="text-xs text-muted-foreground">{person.department}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(person)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onPersonDelete(person.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">可用性:</span>
                <Badge 
                  variant={person.availability === 'available' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {person.availability === 'available' ? '可用' : person.availability === 'busy' ? '忙碌' : '不可用'}
                </Badge>
              </div>
              
              {person.skills && person.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {person.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                <div>默认精力: {person.defaultEnergyLevel}</div>
                <div>默认优先级: {person.defaultPriority}</div>
                <div>默认预计时间: {person.defaultEstimatedTime}分钟</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {persons.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>还没有添加团队成员</p>
          <p className="text-sm">点击上方按钮添加第一个成员</p>
        </div>
      )}
    </div>
  );
};