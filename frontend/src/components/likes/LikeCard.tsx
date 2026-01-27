import { Heart, Clock, MapPin, Briefcase, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LastSeenIndicator, OnlineStatus } from '@/components/ui/LastSeenIndicator';
import type { LikeReceived } from '@/services/matchService';

interface LikeCardProps {
  like: LikeReceived;
  onViewProfile: (like: LikeReceived) => void;
  onLikeBack: (userId: number) => void;
  onPass: (userId: number) => void;
}

export function LikeCard({ like, onViewProfile, onLikeBack, onPass }: LikeCardProps) {
  const user = like.user;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = () => {
    return user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
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
              className="w-16 h-16 rounded-full object-cover border-2 border-pink-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-pink-200">
              <span className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                {getInitials()}
              </span>
            </div>
          )}
          
          {/* Informations de base */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {user.first_name}, {user.age}
              </h3>
              <OnlineStatus lastSeen={user.last_seen} size="sm" />
            </div>

            {/* Dernière connexion */}
            <LastSeenIndicator
              lastSeen={user.last_seen}
              showIcon={false}
              size="sm"
              className="mb-1"
            />

            {/* Date du like */}
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatDate(like.created_at)}</span>
            </div>
          </div>
          
          {/* Badge du like */}
          <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Heart className="h-4 w-4 fill-current" />
            Like
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
          <p className="text-gray-700 dark:text-gray-300 text-sm overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
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
        <div className="space-y-2 pt-2">
          {/* Bouton voir le profil */}
          <button
            onClick={() => onViewProfile(like)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Voir le profil
          </button>
          
          {/* Actions principales */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onPass(user.id)}
              className="px-3 py-2 border-2 border-red-300 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors flex items-center justify-center min-h-[40px]"
            >
              <X className="h-4 w-4 mr-1" />
              Passer
            </button>
            <button
              onClick={() => onLikeBack(user.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-colors flex items-center justify-center min-h-[40px]"
            >
              <Heart className="h-4 w-4 mr-1" />
              Liker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
