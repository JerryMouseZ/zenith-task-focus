import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X } from "lucide-react";

interface TagManagerProps {
  tags: string[];
  isEditing: boolean;
  onTagsChange: (tags: string[]) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  isEditing,
  onTagsChange,
}) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        标签
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {tag}
            {isEditing && (
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => handleRemoveTag(tag)}
              />
            )}
          </Badge>
        ))}
        {tags.length === 0 && !isEditing && (
          <span className="text-sm text-gray-500">暂无标签</span>
        )}
      </div>
      {isEditing && (
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="添加标签..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button onClick={handleAddTag} size="sm">
            添加
          </Button>
        </div>
      )}
    </div>
  );
};
