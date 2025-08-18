import { useState } from 'react';
import { X, Heart, X as XIcon, MapPin, Briefcase, Star, Zap, Crown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  images: string[];
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  distance: number;
}

interface LikeProfileModalProps {
  profiles: Profile[];
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
}

export function LikeProfileModal({ profiles, isOpen, onClose, onLike, onPass }: LikeProfileModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || profiles.length === 0) return null;

  const currentProfile = profiles[currentIndex];

  const handleLike = () => {
    onLike(currentProfile.id);
    nextProfile();
  };

  const handlePass = () => {
    onPass(currentProfile.id);
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImageIndex(0);
    } else {
      onClose();
    }
  };

  const nextImage = () => {
    if (currentProfile.images && currentImageIndex < currentProfile.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-4">
        <div className="bg-background rounded-3xl shadow-2xl w-full max-w-md h-[95vh] md:h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {currentIndex + 1} / {profiles.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Image Section */}
          <div className="relative flex-1">
            <div 
              className="w-full h-full bg-muted cursor-pointer relative overflow-hidden"
              onClick={nextImage}
            >
              <img
                src={currentProfile.images?.[currentImageIndex] || currentProfile.image}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image indicators */}
              {currentProfile.images && currentProfile.images.length > 1 && (
                <div className="absolute top-3 left-3 right-3 flex gap-1">
                  {currentProfile.images.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-1 h-1 rounded-full transition-colors",
                        index <= currentImageIndex ? "bg-white" : "bg-white/30"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Previous image area */}
              {currentImageIndex > 0 && (
                <div 
                  className="absolute left-0 top-0 w-1/3 h-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                />
              )}
            </div>

            {/* Profile info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {currentProfile.name}, {currentProfile.age}
                </h2>
                
                <div className="flex items-center gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{currentProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{currentProfile.occupation}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {currentProfile.interests.slice(0, 3).map((interest) => (
                    <Badge 
                      key={interest} 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 text-xs"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="p-4 border-t border-border flex-1 overflow-y-auto">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {currentProfile.bio}
            </p>
            
            {/* Additional info visible on mobile */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Distance:</span>
                <span>{currentProfile.distance} km</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentProfile.interests.map((interest) => (
                  <Badge 
                    key={interest} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-3 border-t border-border">
            {/* Main actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={handlePass}
              >
                <XIcon className="h-5 w-5" />
                Passer
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                onClick={handleLike}
              >
                <Heart className="h-5 w-5" />
                Liker
              </Button>
            </div>

            {/* Premium actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => console.log('Super Like - Premium feature')}
              >
                <Star className="h-4 w-4" />
                Super Like
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => console.log('Boost - Premium feature')}
              >
                <Zap className="h-4 w-4" />
                Boost
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-300"
                onClick={() => console.log('Premium gift - Premium feature')}
              >
                <Gift className="h-4 w-4" />
                Cadeau
              </Button>
            </div>

            {/* Premium upgrade hint */}
            <div className="text-center">
              <button
                onClick={() => console.log('Upgrade to premium')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto"
              >
                <Crown className="h-3 w-3" />
                <span>Débloquer toutes les fonctionnalités</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}