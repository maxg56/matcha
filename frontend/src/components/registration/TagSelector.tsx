import { cn } from '@/lib/utils';

interface TagSelectorProps {
  label: string;
  description?: string;
  selectedTags: string[];
  availableTags: string[];
  onToggleTag: (tag: string) => void;
  className?: string;
}

export function TagSelector({
  label,
  description,
  selectedTags,
  availableTags,
  onToggleTag,
  className
}: TagSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleTag(tag)}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium transition-colors",
              selectedTags.includes(tag)
                ? "bg-purple-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {selectedTags.length} centre(s) d'intérêt sélectionné(s)
      </p>
    </div>
  );
}