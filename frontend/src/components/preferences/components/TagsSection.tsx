import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { COMMON_TAGS } from '../constants/tags';

interface TagsSectionProps {
  requiredTags: string[];
  blockedTags: string[];
  onToggle: (tag: string, type: 'required' | 'blocked') => void;
}

export function TagsSection({ requiredTags, blockedTags, onToggle }: TagsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Tags requis */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Centres d'intérêt requis</Label>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les centres d'intérêt que les profils doivent avoir
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(tag => {
            const isRequired = requiredTags.includes(tag);
            const isBlocked = blockedTags.includes(tag);

            return (
              <Badge
                key={tag}
                variant={isRequired ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isBlocked ? 'bg-destructive text-destructive-foreground' : ''
                }`}
                onClick={() => onToggle(tag, 'required')}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Tags bloqués */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Centres d'intérêt à éviter</Label>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les centres d'intérêt que vous souhaitez éviter
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(tag => {
            const isRequired = requiredTags.includes(tag);
            const isBlocked = blockedTags.includes(tag);

            return (
              <Badge
                key={tag}
                variant={isBlocked ? "destructive" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isRequired ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => onToggle(tag, 'blocked')}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}