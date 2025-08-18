import { Heart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlurredLikeCardProps {
  like: {
    id: string;
    name?: string; // Peut être caché
    image: string;
    timestamp: string;
  };
  onClick?: (id: string) => void;
  className?: string;
}

export function BlurredLikeCard({ like, onClick, className }: BlurredLikeCardProps) {
  const handleClick = () => onClick?.(like.id);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer",
        "hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg",
        className
      )}
    >
      {/* Blurred image */}
      <img
        src={like.image}
        alt="Profil flouté"
        className="w-full h-full object-cover filter blur-md"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {/* Like indicator */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-1 bg-red-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
          <Heart className="h-3 w-3 fill-current" />
          Like
        </div>
      </div>
      
      {/* Lock icon center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 shadow-lg">
          <Lock className="h-8 w-8 text-white" />
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              {like.name || "Profil masqué"}
            </p>
            <p className="text-white/80 text-sm">{like.timestamp}</p>
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Voir
          </Button>
        </div>
      </div>
    </div>
  );
}

interface BlurredLikesGridProps {
  likes: Array<{
    id: string;
    name?: string;
    image: string;
    timestamp: string;
  }>;
  onLikeClick?: (id: string) => void;
  className?: string;
}

export function BlurredLikesGrid({ likes, onLikeClick, className }: BlurredLikesGridProps) {
  if (likes.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Aucun like pour le moment</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Continuez à explorer et à interagir avec d'autres profils. Vos likes apparaîtront ici !
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {likes.map((like) => (
        <BlurredLikeCard
          key={like.id}
          like={like}
          onClick={onLikeClick}
        />
      ))}
    </div>
  );
}