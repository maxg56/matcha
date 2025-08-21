import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { InfoCard } from './InfoCard';

interface ProfileInterestsProps {
  interests: string[];
}

export function ProfileInterests({ interests }: ProfileInterestsProps) {
  return (
    <InfoCard title="Centres d'intérêt" icon={<Crown className="h-4 w-4" />}>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <Badge
            key={interest}
            variant="secondary"
            className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
          >
            {interest}
          </Badge>
        ))}
      </div>
    </InfoCard>
  );
}