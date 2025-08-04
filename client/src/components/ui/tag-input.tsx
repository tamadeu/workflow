import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: Tag[];
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function TagInput({ 
  tags, 
  onTagsChange, 
  availableTags = [], 
  placeholder = "Add tag...",
  className,
  "data-testid": testId
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const getTagColor = (tagName: string) => {
    const availableTag = availableTags.find(t => t.name === tagName);
    return availableTag ? availableTag.color : "#3B82F6";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Display current tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${getTagColor(tag)}20`,
                color: getTagColor(tag),
              }}
              data-testid={`tag-${tag}`}
            >
              {tag}
              <button
                data-testid={`button-remove-tag-${tag}`}
                onClick={() => removeTag(tag)}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Input for new tags */}
      <Input
        data-testid={testId}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}
