import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface Match {
  id: string;
  name: string;
  age: number;
  image: string;
  images?: string[];
  matchedAt: string;
  commonInterests: string[];
  isNew: boolean;
  lastMessage?: string | null;
  timestamp?: string | null;
  unread?: boolean;
  bio?: string;
  location?: string;
  occupation?: string;
  interests?: string[];
  distance?: number;
}

interface NewMatchesSectionProps {
  matches: Match[];
  onMatchClick: (matchId: string) => void;
  isMobile?: boolean;
}

export function NewMatchesSection({ matches, onMatchClick, isMobile = false }: NewMatchesSectionProps) {
  if (matches.length === 0) return null;

  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Nouveaux Matches</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex-shrink-0 w-20 text-center cursor-pointer"
              onClick={() => onMatchClick(match.id)}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-2 mb-2">
                <Avatar className="w-16 h-16 mx-auto">
                  <AvatarImage src={match.image} alt={match.name} />
                  <AvatarFallback>{match.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-xs font-medium text-foreground truncate">{match.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 m-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Nouveaux Matches</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {matches.length} nouvelle{matches.length > 1 ? 's' : ''} connexion{matches.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-4 space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-600"
              onClick={() => onMatchClick(match.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={match.image} alt={match.name} />
                  <AvatarFallback>{match.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{match.name}, {match.age}</p>
                    {match.isNew && (
                      <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Nouveau</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{match.matchedAt}</p>
                  <div className="flex gap-1 mt-1">
                    {match.commonInterests.slice(0, 2).map((interest) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
