import { Heart, X, MapPin, Briefcase, ChevronLeft, ChevronRight, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    images: string[];
    bio?: string;
    location?: string;
    occupation?: string;
    interests?: string[];
    distance?: number;
  };
  onLike?: (id: string) => void;
  onPass?: (id: string) => void;
  className?: string;
}

export function ProfileCard({ profile, onLike, onPass, className }: ProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const handleLike = () => onLike?.(profile.id);
  const handlePass = () => onPass?.(profile.id);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < profile.images.length - 1 ? prev + 1 : prev
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={cn(
      "relative bg-card rounded-3xl overflow-hidden shadow-lg border border-border/50",
      "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
      className
    )}>
      {/* Image Container with Carousel */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={profile.images[currentImageIndex]}
          alt={`${profile.name} - Photo ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Navigation buttons */}
        {profile.images.length > 1 && (
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
              disabled={currentImageIndex === profile.images.length - 1}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full",
                "bg-black/30 text-white flex items-center justify-center transition-opacity",
                currentImageIndex === profile.images.length - 1 ? "opacity-30" : "opacity-70 hover:opacity-100"
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image indicators */}
        {profile.images.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1">
            {profile.images.map((_, index) => (
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
        
        {/* Gradient overlay for name only */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Name overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-bold">
            {profile.name}, {profile.age}
          </h3>
          {profile.location && (
            <div className="flex items-center gap-1 text-white/90">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {profile.location}
                {profile.distance && ` • ${profile.distance}km`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile details section below image */}
      <div className="p-6 space-y-4">
        {/* Occupation */}
        {profile.occupation && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="text-sm font-medium">{profile.occupation}</span>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-foreground text-sm leading-relaxed">
            {profile.bio}
          </p>
        )}
        
        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.interests.slice(0, 4).map((interest) => (
              <Badge
                key={interest}
                variant="outline"
                className="text-xs"
              >
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 4 && (
              <Badge
                variant="outline"
                className="text-xs"
              >
                +{profile.interests.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-4 pt-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePass}
            className="h-14 w-14 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-lg"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-300 shadow-lg"
          >
            <Star className="h-6 w-6" />
          </Button>
          
          <Button
            size="icon"
            onClick={handleLike}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
          >
            <Heart className="h-6 w-6 fill-current" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 shadow-lg"
          >
            <Zap className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 shadow-lg"
          >
            <Crown className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}