import { Heart, X, MapPin, Briefcase, ChevronLeft, ChevronRight, Star, Crown, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ImmersiveProfileCardProps {
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

export function ImmersiveProfileCard({ profile, onLike, onPass, className }: ImmersiveProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
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
    <div className={cn("flex flex-col h-full", className)}>
      {/* Full screen image - no card styling */}
      <div className="relative flex-1 w-full min-h-[400px] max-h-screen">
        <img
          src={profile.images[currentImageIndex]}
          alt={`${profile.name} - Photo ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Image indicators */}
        {profile.images.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
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

        {/* Navigation areas (invisible touch zones) */}
        {profile.images.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <div 
                className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
                onClick={prevImage}
              />
            )}
            {currentImageIndex < profile.images.length - 1 && (
              <div 
                className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10"
                onClick={nextImage}
              />
            )}
          </>
        )}

        {/* Navigation buttons */}
        {profile.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              disabled={currentImageIndex === 0}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full z-20",
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
                "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full z-20",
                "bg-black/30 text-white flex items-center justify-center transition-opacity",
                currentImageIndex === profile.images.length - 1 ? "opacity-30" : "opacity-70 hover:opacity-100"
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Basic info overlay - minimal */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-10">
          <div className="flex items-end justify-between">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-1">
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
            
            {/* Toggle details button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-white hover:bg-white/20 z-20"
            >
              {showDetails ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Details panel below image */}
      {showDetails && (
        <div className="bg-background p-4 space-y-3 border-t border-border animate-in slide-in-from-bottom duration-300">
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
              {profile.interests.slice(0, 6).map((interest) => (
                <Badge
                  key={interest}
                  variant="outline"
                  className="text-xs"
                >
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 6 && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  +{profile.interests.length - 6}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons section below image */}
      <div className="bg-background p-4 border-t border-border">
        <div className="flex justify-center gap-4">
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