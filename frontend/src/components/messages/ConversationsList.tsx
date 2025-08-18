import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

interface Match {
  id: string;
  name: string;
  age: number;
  image: string;
  images?: string[];
  lastMessage?: string | null;
  timestamp?: string | null;
  unread: boolean;
  commonInterests: string[];
  matchedAt?: string;
  isNew?: boolean;
  bio?: string;
  location?: string;
  occupation?: string;
  interests?: string[];
  distance?: number;
}

interface ConversationsListProps {
  matches: Match[];
  onMatchClick: (matchId: string) => void;
  onProfileClick?: (match: Match) => void;
  isMobile?: boolean;
}

export function ConversationsList({
  matches,
  onMatchClick,
  onProfileClick,
  isMobile = false
}: ConversationsListProps) {
  if (isMobile) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Conversations</h2>
        </div>

        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={() => onMatchClick(match.id)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProfileClick?.(match);
                    }}
                  >
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={match.image} alt={match.name} />
                      <AvatarFallback>{match.name[0]}</AvatarFallback>
                    </Avatar>
                  </button>
                  {match.unread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {match.name}, {match.age}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {match.timestamp}
                    </span>
                  </div>

                  {match.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {match.lastMessage}
                    </p>
                  )}

                  <div className="flex gap-1">
                    {match.commonInterests.slice(0, 2).map((interest) => (
                      <Badge key={interest} variant="outline" className="text-xs glass">
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
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 m-4 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Conversations</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                onClick={() => onMatchClick(match.id)}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={match.image} alt={match.name} />
                    <AvatarFallback>{match.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {match.name}, {match.age}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {match.timestamp}
                      </span>
                    </div>

                    {match.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {match.lastMessage}
                      </p>
                    )}

                    <div className="flex gap-1 mt-1">
                      {match.commonInterests.slice(0, 2).map((interest) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {match.unread && (
                    <div className="w-3 h-3 bg-primary rounded-full shadow-lg" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
