import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProfileImageCarouselProps {
  images?: string[];
  profileName?: string;
  currentIndex: number;
  onImageChange: (index: number) => void;
}

export function ProfileImageCarousel({ images = [], profileName = 'Utilisateur', currentIndex, onImageChange }: ProfileImageCarouselProps) {
  // Protection contre les images vides ou undefined
  const safeImages = images && images.length > 0 ? images : [];
  const hasImages = safeImages.length > 0;
  const safeCurrentIndex = hasImages ? Math.min(currentIndex, safeImages.length - 1) : 0;
  const safeName = profileName && profileName.length > 0 ? profileName : 'Utilisateur';
  
  const nextImage = () => {
    if (hasImages) {
      onImageChange((safeCurrentIndex + 1) % safeImages.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      onImageChange((safeCurrentIndex - 1 + safeImages.length) % safeImages.length);
    }
  };

  // Si pas d'images, afficher un placeholder
  if (!hasImages) {
    return (
      <div className="relative w-full h-[30rem] flex justify-center items-center overflow-hidden bg-gray-200 dark:bg-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold">
              {safeName.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="text-sm">Aucune photo disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[30rem] flex justify-center items-center overflow-hidden">
      {/* Image de gauche */}
      {safeImages.length > 1 && (
        <img
          src={safeImages[(safeCurrentIndex - 1 + safeImages.length) % safeImages.length]}
          alt={profileName}
          className="hidden lg:block absolute left-60 w-48 h-48 object-cover rounded-full opacity-50 transform -translate-x-1/4"
        />
      )}

      {/* Image centrale */}
      <img
        src={safeImages[safeCurrentIndex]}
        alt={profileName}
        className="w-full h-full lg:w-full lg:h-full object-contain shadow-xl z-10"
      />

      {/* Image de droite */}
      {safeImages.length > 1 && (
        <img
          src={safeImages[(safeCurrentIndex + 1) % safeImages.length]}
          alt={profileName}
          className="hidden lg:block absolute right-60 w-48 h-48 object-cover rounded-full opacity-50 transform translate-x-1/4"
        />
      )}

      {/* Boutons - seulement si plusieurs images */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-purple-500 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors z-20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors z-20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
