import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProfileImageCarouselProps {
  images: string[];
  profileName: string;
  currentIndex: number;
  onImageChange: (index: number) => void;
}

export function ProfileImageCarousel({
  images,
  profileName,
  currentIndex,
  onImageChange
}: ProfileImageCarouselProps) {
  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      onImageChange(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      onImageChange(currentIndex - 1);
    }
  };

  return (
    <div className="relative h-96 flex-shrink-0">
      <img
        src={images[currentIndex]}
        alt={profileName}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Navigation images */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicateurs d'images */}
          <div className="absolute top-4 left-4 right-4 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
