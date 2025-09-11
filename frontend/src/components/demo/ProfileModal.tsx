import { useState } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, MapPin, Briefcase, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProfileModalProps {
  profile: {
    id: string;
    name: string;
    age: number;
    images?: string[];
    bio?: string;
    location?: string;
    occupation?: string;
    interests?: string[];
    distance?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onLike?: (id: string) => void;
  onPass?: (id: string) => void;
}

export function ProfileModal({ profile, isOpen, onClose, onLike, onPass }: ProfileModalProps) {
  const safeImages = profile.images && profile.images.length > 0 ? profile.images : [];
  const hasImages = safeImages.length > 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => 
        prev < safeImages.length - 1 ? prev + 1 : prev
      );
    }
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

  const goToImage = (index: number) => {
    if (hasImages && index >= 0 && index < safeImages.length) {
      setCurrentImageIndex(index);
    }
  };

  const handleLike = () => {
    onLike?.(profile.id);
    onClose();
  };

  const handlePass = () => {
    onPass?.(profile.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg mx-auto bg-card rounded-3xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 text-white hover:bg-black/40"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Image Container with Carousel */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {hasImages ? (
            <img
              src={safeImages[Math.min(currentImageIndex, safeImages.length - 1)]}
              alt={`${profile.name} - Photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold">
                    {(profile.name && profile.name.length > 0 ? profile.name : 'Utilisateur').charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm">Aucune photo disponible</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {hasImages && safeImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                disabled={currentImageIndex === 0}
                className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full",
                  "bg-black/30 text-white flex items-center justify-center transition-opacity",
                  currentImageIndex === 0 ? "opacity-30" : "opacity-70 hover:opacity-100"
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={nextImage}
                disabled={currentImageIndex === safeImages.length - 1}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full",
                  "bg-black/30 text-white flex items-center justify-center transition-opacity",
                  currentImageIndex === safeImages.length - 1 ? "opacity-30" : "opacity-70 hover:opacity-100"
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image indicators */}
          {hasImages && safeImages.length > 1 && (
            <div className="absolute top-4 left-4 right-12 flex gap-1">
              {safeImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-all",
                    index === currentImageIndex 
                      ? "bg-white" 
                      : "bg-white/40"
                  )}
                />
              ))}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Profile content */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {profile.name}, {profile.age}
            </h2>
            
            {profile.location && (
              <div className="flex items-center gap-1 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {profile.location}
                  {profile.distance && ` • ${profile.distance}km`}
                </span>
              </div>
            )}
            
            {profile.occupation && (
              <div className="flex items-center gap-1 text-muted-foreground mb-3">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{profile.occupation}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">À propos</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {profile.bio}
              </p>
            </div>
          )}
          
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Centres d'intérêt</h3>
              <div className="flex flex-wrap gap-1">
                {profile.interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 text-xs"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              size="icon"
              variant="outline"
              onClick={handlePass}
              className="h-14 w-14 rounded-full bg-background border-border hover:bg-accent text-destructive"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full bg-background border-border hover:bg-accent text-yellow-500"
            >
              <Star className="h-6 w-6" />
            </Button>
            
            <Button
              size="icon"
              onClick={handleLike}
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
            >
              <Heart className="h-6 w-6 fill-current" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Zap className="h-6 w-6" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-0 hover:from-yellow-500 hover:to-orange-600 text-white"
            >
              <Crown className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}