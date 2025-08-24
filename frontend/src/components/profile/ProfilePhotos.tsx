import { useState } from 'react';

interface ProfilePhotosProps {
  images: string[];
  userName: string;
}

export function ProfilePhotos({ images, userName }: ProfilePhotosProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="relative mx-auto max-w-sm md:max-w-md lg:max-w-lg">
      <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-700 cursor-pointer group shadow-lg border border-gray-200 dark:border-gray-600">
        <img
          src={images[activeImageIndex]}
          alt={userName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeImageIndex 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}