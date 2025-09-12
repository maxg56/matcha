import { useState } from 'react';

interface ProfilePhotosProps {
  images?: string[];
  userName: string;
}

export function ProfilePhotos({ images = [], userName }: ProfilePhotosProps) {
  const safeImages = images && images.length > 0 ? images : [];
  const hasImages = safeImages.length > 0;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const prevImage = () => {
    if (hasImages) {
      setActiveImageIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
    }
  };

  const nextImage = () => {
    if (hasImages) {
      setActiveImageIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));
    }
  };

  // Si pas d'images, afficher un placeholder
  if (!hasImages) {
    return (
      <div className="relative mx-auto max-w-sm md:max-w-md lg:max-w-lg">
        <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {(userName && userName.length > 0 ? userName : 'Utilisateur').charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm">Aucune photo</p>
          </div>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(activeImageIndex, safeImages.length - 1);

  return (
    <div className="relative mx-auto max-w-sm md:max-w-md lg:max-w-lg">
      <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-700 cursor-pointer group shadow-lg border border-gray-200 dark:border-gray-600">
        <img
          src={safeImages[safeIndex]}
          alt={userName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        {safeImages.length > 1 && (
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
              {safeImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === safeIndex 
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