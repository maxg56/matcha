import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface InterestsSectionProps {
  selectedTags: string[];
  availableTags: string[];
  editingSection: boolean;
  onToggleTag: (tag: string) => void;
}

export function InterestsSection({
  selectedTags,
  availableTags,
  editingSection,
  onToggleTag
}: InterestsSectionProps) {
  return (
    <div className="p-4">
      <h3 className="font-medium text-foreground mb-3">Vos centres d'intérêt</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedTags.map(tag => (
          <Badge
            key={tag}
            variant="default"
            className="cursor-pointer hover:bg-destructive"
            onClick={() => editingSection && onToggleTag(tag)}
          >
            {tag}
            {editingSection && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        ))}
      </div>

      {editingSection && (
        <>
          <h4 className="font-medium text-foreground mb-2">Ajouter des centres d'intérêt</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags
              .filter(tag => !selectedTags.includes(tag))
              .map(tag => (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-accent transition-colors"
                >
                  {tag}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
