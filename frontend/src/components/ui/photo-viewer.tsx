import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, X as XIcon, Star, Zap, Crown } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  url: string;
  description?: string;
}

interface ProfilePhotoViewerProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  onBoost?: () => void;
  profile?: {
    name: string;
    age: number;
    bio?: string;
    location?: string;
    interests?: string[];
  };
  showActions?: boolean;
  className?: string;
}

export function ProfilePhotoViewer({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onLike,
  onPass,
  onSuperLike,
  onBoost,
  profile,
  showActions = false,
  className
}: ProfilePhotoViewerProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      goToNext();
    }
    if (isRightSwipe && photos.length > 1) {
      goToPrevious();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  if (!isOpen) return null;

  const currentPhoto = photos[activeIndex];

  return (
    <div className={cn(
      "fixed inset-0 z-50 liquid-bg backdrop-blur-sm flex items-center justify-center",
      className
    )}>
      <div 
        ref={containerRef}
        className="relative w-full h-full max-w-4xl mx-auto flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 glass-card rounded-b-2xl m-4 mb-0">
          <div className="flex items-center gap-2">
            {profile && (
              <>
                <h2 className="text-white font-semibold text-lg">
                  {profile.name}, {profile.age}
                </h2>
                {profile.location && (
                  <span className="text-white/70 text-sm">• {profile.location}</span>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Photo counter */}
            {photos.length > 1 && (
              <div className="glass-light rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">
                  {activeIndex + 1} / {photos.length}
                </span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:glass-light rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:glass-light glass-card rounded-full"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:glass-light glass-card rounded-full"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Photo */}
        <div className="flex-1 flex items-center justify-center relative">
          <img
            src={currentPhoto.url}
            alt={`Photo ${activeIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        </div>

        {/* Photo indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === activeIndex ? "bg-white" : "bg-white/40"
                )}
              />
            ))}
          </div>
        )}

        {/* Bottom section with description and actions */}
        <div className="absolute bottom-0 left-0 right-0 glass-card rounded-t-2xl m-4 mt-0 p-4 pb-6">
          {/* Description */}
          {currentPhoto.description && (
            <div className="mb-4">
              <p className="text-white text-center max-w-2xl mx-auto leading-relaxed">
                {currentPhoto.description}
              </p>
            </div>
          )}

          {/* Profile info */}
          {profile && (
            <div className="mb-4 text-center">
              {profile.bio && (
                <p className="text-white/90 text-sm mb-2 max-w-lg mx-auto">
                  {profile.bio}
                </p>
              )}
              
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.interests.slice(0, 4).map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 text-xs"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 4 && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 text-xs"
                    >
                      +{profile.interests.length - 4}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {showActions && (
            <div className="flex items-center justify-center gap-4">
              {onPass && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onPass}
                  className="w-14 h-14 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-white/10 backdrop-blur-sm"
                >
                  <XIcon className="h-6 w-6" />
                </Button>
              )}

              {onSuperLike && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onSuperLike}
                  className="w-12 h-12 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white bg-white/10 backdrop-blur-sm"
                >
                  <Star className="h-5 w-5" />
                </Button>
              )}

              {onLike && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onLike}
                  className="w-14 h-14 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white bg-white/10 backdrop-blur-sm"
                >
                  <Heart className="h-6 w-6" />
                </Button>
              )}

              {onBoost && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onBoost}
                  className="w-12 h-12 rounded-full border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white bg-white/10 backdrop-blur-sm"
                >
                  <Zap className="h-5 w-5" />
                </Button>
              )}

              {/* Premium actions placeholder */}
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white bg-white/10 backdrop-blur-sm opacity-60"
                disabled
              >
                <Crown className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}