import { Heart, X, MapPin, Briefcase, ChevronLeft, ChevronRight, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { getDisplayName, getInitial } from '@/utils/safeString';

interface ProfileCardProps {
  profile: {
    id: string | number;
    name?: string;
    first_name?: string;
    last_name?: string;
    age: number;
    images?: string[];
    profile_photos?: string[];
    bio?: string;
    location?: string;
    occupation?: string;
    interests?: string[];
    distance?: number;
    // Propriétés supplémentaires pour les détails du profil
    height?: number;
    education_level?: string;
    relationship_type?: string;
    smoking?: string;
    alcohol_consumption?: string;
    sport_activity?: string;
    pets?: string;
  };
  candidate?: {
    id: number;
    algorithm_type: string;
    compatibility_score?: number;
    distance?: number;
  };
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  onBoost?: () => void;
  onMessage?: () => void;
  onReport?: () => void;
  className?: string;
}

export function ProfileCard({ 
  profile, 
  candidate, 
  onLike, 
  onPass, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuperLike: _onSuperLike, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBoost: _onBoost, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMessage: _onMessage, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onReport: _onReport, 
  className 
}: ProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const displayName = getDisplayName(profile);
  const images = profile.images || profile.profile_photos || [];
  
  const handleLike = () => onLike?.();
  const handlePass = () => onPass?.();

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < images.length - 1 ? prev + 1 : prev
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
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={`${displayName} - Photo ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">
              {getInitial(displayName)}
            </span>
          </div>
        )}

        {/* Navigation buttons */}
        {images.length > 1 && (
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
              disabled={currentImageIndex === images.length - 1}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full",
                "bg-black/30 text-white flex items-center justify-center transition-opacity",
                currentImageIndex === images.length - 1 ? "opacity-30" : "opacity-70 hover:opacity-100"
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1">
            {images.map((_, index) => (
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
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">
              {displayName}, {profile.age}
            </h3>
            {candidate?.compatibility_score && (
              <div className="flex items-center gap-1 bg-purple-600 px-2 py-1 rounded-full">
                <Star className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {(candidate.compatibility_score * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
          {profile.location && (
            <div className="flex items-center gap-1 text-white/90">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {profile.location}
                {(candidate?.distance || profile.distance) && ` • ${candidate?.distance || profile.distance}km`}
              </span>
            </div>
          )}
          {candidate?.algorithm_type && (
            <div className="flex items-center gap-1 text-white/70 mt-1">
              <Zap className="h-3 w-3" />
              <span className="text-xs">
                {candidate.algorithm_type === 'vector_based' ? 'Match intelligent' : 
                 candidate.algorithm_type === 'proximity' ? 'À proximité' : 
                 candidate.algorithm_type === 'random' ? 'Découverte' : 
                 candidate.algorithm_type}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile details section below image */}
      <div className="p-6 space-y-4">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {profile.height && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">📏</span>
              <span className="text-sm">{profile.height}cm</span>
            </div>
          )}
          
          {profile.occupation && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">{profile.occupation}</span>
            </div>
          )}
          
          {profile.education_level && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">🎓</span>
              <span className="text-sm">{profile.education_level}</span>
            </div>
          )}
          
          {profile.relationship_type && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">💕</span>
              <span className="text-sm">{profile.relationship_type}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-foreground text-sm leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Lifestyle Info */}
        <div className="flex flex-wrap gap-2">
          {profile.smoking && (
            <Badge variant="outline" className="text-xs">
              🚬 {profile.smoking}
            </Badge>
          )}
          {profile.alcohol_consumption && (
            <Badge variant="outline" className="text-xs">
              🍷 {profile.alcohol_consumption}
            </Badge>
          )}
          {profile.sport_activity && (
            <Badge variant="outline" className="text-xs">
              🏃 {profile.sport_activity}
            </Badge>
          )}
          {profile.pets && (
            <Badge variant="outline" className="text-xs">
              🐕 {profile.pets}
            </Badge>
          )}
        </div>
        
        {/* Interests/Tags */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.interests.slice(0, 6).map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
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