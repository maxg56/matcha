import { cn } from '@/lib/utils';
import { availableTags } from './FilterOptions';

interface TagsFilterProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export function TagsFilter({ selectedTags, onToggle }: TagsFilterProps) {
  return (
    <div>
      <h4 className="font-medium mb-3">Tags</h4>
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium transition-colors",
              selectedTags.includes(tag)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}