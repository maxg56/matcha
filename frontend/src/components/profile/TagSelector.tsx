import { Badge } from '@/components/ui/badge';

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onToggleTag: (tag: string) => void;
  maxTags?: number;
}

export function TagSelector({
  selectedTags,
  availableTags,
  onToggleTag,
  maxTags = 10,
}: TagSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Centres d'intérêt
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedTags.length}/{maxTags}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const canSelect = !isSelected && selectedTags.length < maxTags;

          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'bg-purple-500 text-white'
                  : canSelect
                  ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isSelected || canSelect) {
                  onToggleTag(tag);
                }
              }}
            >
              {tag}
            </Badge>
          );
        })}
      </div>

      {selectedTags.length === maxTags && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Vous avez atteint le nombre maximum de tags ({maxTags})
        </p>
      )}
    </div>
  );
}
