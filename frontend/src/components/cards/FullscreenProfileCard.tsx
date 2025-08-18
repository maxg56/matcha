import { Heart, X, MapPin, Briefcase, ChevronLeft, ChevronRight, Star, Crown, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FullscreenProfileCardProps {
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

export function FullscreenProfileCard({ profile, onLike, onPass, className }: FullscreenProfileCardProps) {
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
    <div className={cn(
      "relative bg-black rounded-3xl overflow-hidden shadow-2xl",
      "w-full h-full max-h-[90vh]",
      className
    )}>
      {/* Fullscreen Image Container */}
      <div className="relative w-full h-full">
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

        {/* Action buttons - positioned above the image with slight transparency */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-4 z-20 px-4">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePass}
            className="h-14 w-14 rounded-full bg-white/90 border-white/50 hover:bg-white text-red-600 hover:text-red-700 shadow-lg backdrop-blur-sm"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full bg-white/90 border-white/50 hover:bg-white text-yellow-600 hover:text-yellow-700 shadow-lg backdrop-blur-sm"
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
            className="h-14 w-14 rounded-full bg-white/90 border-white/50 hover:bg-white text-purple-600 hover:text-purple-700 shadow-lg backdrop-blur-sm"
          >
            <Zap className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full bg-white/90 border-white/50 hover:bg-white text-orange-600 hover:text-orange-700 shadow-lg backdrop-blur-sm"
          >
            <Crown className="h-6 w-6" />
          </Button>
        </div>

        {/* Basic info overlay - always visible */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 z-10">
          <div className="flex items-end justify-between">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-1">
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

        {/* Expandable details panel */}
        {showDetails && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-6 pt-16 z-15 animate-in slide-in-from-bottom duration-300">
            <div className="space-y-4 text-white">
              {/* Occupation */}
              {profile.occupation && (
                <div className="flex items-center gap-2 text-white/90">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-medium">{profile.occupation}</span>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-white/90 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}
              
              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {profile.interests.slice(0, 6).map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 text-xs"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 6 && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 text-xs"
                    >
                      +{profile.interests.length - 6}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}