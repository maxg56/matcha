import { Button } from '@/components/ui/button';
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
    <div className="px-6 pb-6 mt-auto">
      <div className="grid grid-cols-5 gap-3">
        {/* Passer */}
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => onPass(profileId)}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Super Like */}
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          onClick={() => onSuperLike?.(profileId)}
        >
          <Star className="h-6 w-6" />
        </Button>

        {/* Like */}
        <Button
          size="icon"
          className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-xl"
          onClick={() => onLike(profileId)}
        >
          <Heart className="h-7 w-7" />
        </Button>

        {/* Boost */}
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-yellow-200 dark:border-yellow-600 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
          onClick={() => onBoost?.(profileId)}
        >
          <Zap className="h-6 w-6" />
        </Button>

        {/* Message */}
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-green-200 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
          onClick={() => onMessage?.(profileId)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
