// import { Button } from '@/components/ui/button';
import { Heart, X, Star, Zap, MessageCircle } from 'lucide-react';

interface ProfileActionsProps {
  profileId: string;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike?: (id: string) => void;
  onBoost?: (id: string) => void;
  onMessage?: (id: string) => void;
}

export function ProfileActions({
  profileId,
  onLike,
  onPass,
  onSuperLike,
  onBoost,
  onMessage
}: ProfileActionsProps) {
  return (
    <div className="flex justify-center items-center gap-2 md:gap-4 py-3 md:py-4">
      {/* Bouton Pass */}
      <button
        onClick={() => onPass(profileId)}
        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <X className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Bouton Super Like */}
      {onSuperLike && (
        <button
          onClick={() => onSuperLike(profileId)}
          className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Star className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      )}

      {/* Bouton Like */}
      <button
        onClick={() => onLike(profileId)}
        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Heart className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Bouton Message */}
      {onMessage && (
        <button
          onClick={() => onMessage(profileId)}
          className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 text-purple-600 dark:text-purple-400 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {/* Bouton Boost */}
      {onBoost && (
        <button
          onClick={() => onBoost(profileId)}
          className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 text-yellow-600 dark:text-yellow-400 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Zap className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}
    </div>
  );
}