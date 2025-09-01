import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface TagInputProps {
  placeholder?: string
  value?: string[]
  onChange?: (tags: string[]) => void
  className?: string
  disabled?: boolean
}

const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  ({ placeholder = "Adicionar tag...", value = [], onChange, className, disabled, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("")
    const [tags, setTags] = React.useState<string[]>(value)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      // Only update if the arrays are actually different
      if (value.length !== tags.length || value.some((tag, index) => tag !== tags[index])) {
        setTags(value)
      }
    }, [value])

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !tags.includes(trimmedTag)) {
        const newTags = [...tags, trimmedTag]
        setTags(newTags)
        onChange?.(newTags)
      }
      setInputValue("")
    }

    const removeTag = (tagToRemove: string) => {
      const newTags = tags.filter(tag => tag !== tagToRemove)
      setTags(newTags)
      onChange?.(newTags)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        removeTag(tags[tags.length - 1])
      }
    }

    const handleBlur = () => {
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex min-h-10 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => inputRef.current?.focus()}
        {...props}
      >
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 pr-1 text-xs"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 border-0 p-0 shadow-none outline-none focus-visible:ring-0"
          disabled={disabled}
        />
      </div>
    )
  }
)

TagInput.displayName = "TagInput"

export { TagInput }
