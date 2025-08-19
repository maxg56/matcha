import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProfileImageCarouselProps {
  images: string[];
  profileName: string;
  currentIndex: number;
  onImageChange: (index: number) => void;
}

export function ProfileImageCarousel({ images, profileName, currentIndex, onImageChange }: ProfileImageCarouselProps) {
  const nextImage = () => {
    onImageChange((currentIndex + 1) % images.length);
  };

  const prevImage = () => {
    onImageChange((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-[30rem] flex justify-center items-center overflow-hidden">
      {/* Image de gauche */}
      <img
        src={images[(currentIndex - 1 + images.length) % images.length]}
        alt={profileName}
        className="hidden lg:block absolute left-60 w-48 h-48 object-cover rounded-full opacity-50 transform -translate-x-1/4"
      />

      {/* Image centrale */}
      <img
        src={images[currentIndex]}
        alt={profileName}
        className="w-full h-full lg:w-full lg:h-full object-contain  shadow-xl z-10"
      />

      {/* Image de droite */}
      <img
        src={images[(currentIndex + 1) % images.length]}
        alt={profileName}
        className="hidden lg:block absolute right-60 w-48 h-48 object-cover rounded-full opacity-50 transform translate-x-1/4"
      />

      {/* Boutons */}
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
    </div>
  );
}
