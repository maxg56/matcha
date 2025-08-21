import { Heart, Eye, Users } from 'lucide-react';
import { InfoCard } from './InfoCard';

interface ProfileStatsProps {
  stats: {
    matches: number;
    likes: number;
    views: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <InfoCard title="Statistiques" icon={<Users className="h-4 w-4" />}>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 mx-auto mb-2 shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.matches}</div>
          <div className="text-xs text-muted-foreground">Matches</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 mx-auto mb-2 shadow-lg">
            <Heart className="h-6 w-6 text-white fill-current" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.likes}</div>
          <div className="text-xs text-muted-foreground">Likes</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 mx-auto mb-2 shadow-lg">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.views}</div>
          <div className="text-xs text-muted-foreground">Vues</div>
        </div>
      </div>
    </InfoCard>
  );
}