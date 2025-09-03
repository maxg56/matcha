import { useState } from 'react';

interface ProfilePhotosProps {
  images: string[];
  userName: string;
}

export function ProfilePhotos({ images, userName }: ProfilePhotosProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const prevImage = () => {
    setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const nextImage = () => {
    setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative mx-auto max-w-sm md:max-w-md lg:max-w-lg">
      <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-700 cursor-pointer group shadow-lg border border-gray-200 dark:border-gray-600">
        <img
          src={images[activeImageIndex]}
          alt={userName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white"
              aria-label="Image précédente"
            >
              &#8592;
            </button>
            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white"
              aria-label="Image suivante"
            >
              &#8594;
            </button>
            {/* Dots */}
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
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}