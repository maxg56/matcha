import { Heart, MessageCircle, UserMinus, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Match } from '@/services/matchService';

interface MatchCardProps {
  match: Match;
  onUnmatch?: (matchId: number) => void;
  onMessage?: (userId: number) => void;
}

export function MatchCard({ match, onUnmatch, onMessage }: MatchCardProps) {
  const user = match.target_user || match.user;

  if (!user) return null;

  const getInitials = () => {
    const firstName = user.first_name && user.first_name.length > 0 ? user.first_name : 'U';
    return firstName.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header avec photo et info de base */}
      <div className="relative">
        <div className="flex items-center p-4 space-x-3">
          {/* Photo de profil */}
          {user.images && user.images.length > 0 ? (
            <img
              src={user.images[0]}
              alt={user.first_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-green-200">
              <span className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                {getInitials()}
              </span>
            </div>
          )}
          
          {/* Informations de base */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {user.first_name}, {user.age}
            </h3>
            
            {/* Date du match */}
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
              <Heart className="h-4 w-4" />
              <span>Match depuis le {formatDate(match.created_at)}</span>
            </div>
          </div>
          
          {/* Badge du match */}
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Heart className="h-4 w-4 fill-current" />
            Match
          </div>
        </div>
      </div>

      {/* Contenu détaillé */}
      <div className="px-4 pb-4 space-y-3">
        {/* Localisation */}
        {user.current_city && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{user.current_city}</span>
          </div>
        )}
        
        {/* Profession */}
        {user.job && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
            <Briefcase className="h-4 w-4" />
            <span>{user.job}</span>
          </div>
        )}

        {/* Bio (extrait) */}
        {user.bio && (
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Tags/Intérêts */}
        {user.tags && user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {user.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {user.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{user.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onMessage && (
            <Button
              size="sm"
              onClick={() => onMessage(user.id)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
          {onUnmatch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnmatch(match.id)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Unmatch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}