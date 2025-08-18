import { useState } from "react";

type Profile = {
  name: string;
  images: string[];
};

const profiles: Profile[] = [
  { name: "Alice", images: ["https://robohash.org/alice1.png", "https://robohash.org/alice2.png"] },
  { name: "Bob", images: ["https://robohash.org/bob1.png", "https://robohash.org/bob2.png", "https://robohash.org/bob3.png"] },
  { name: "Charlie", images: ["https://robohash.org/charlie1.png"] },
];

function ProfileGallery({ images }: { images: string[] }) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0));
  const prevImage = () => setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1));

  return (
    <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-gray-200">
      <img
        src={images[currentImage]}
        alt={`Profile image ${currentImage + 1}`}
        className="w-full h-full object-cover transition-transform duration-300"
      />

      {/* Flèches gauche/droite pour les images */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold bg-black/30 rounded-full p-2"
      >
        ⬅
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold bg-black/30 rounded-full p-2"
      >
        ➡
      </button>
    </div>
  );
}

export default function Gallery() {
  const [currentProfile, setCurrentProfile] = useState(0);

  const prevProfile = () => setCurrentProfile((p) => (p > 0 ? p - 1 : profiles.length - 1));
  const nextProfile = () => setCurrentProfile((p) => (p < profiles.length - 1 ? p + 1 : 0));

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2">
      <h3 className="text-center text-lg font-bold">{profiles[currentProfile].name}</h3>

      <ProfileGallery images={profiles[currentProfile].images} />

      {/* Boutons Refuser / Accepter */}
      <div className="flex justify-between w-full px-4 mt-4">
        <button
          onClick={prevProfile}
          className="bg-red-500 text-white text-xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          ✖
        </button>
        <button
          onClick={nextProfile}
          className="bg-green-500 text-white text-xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          ✔
        </button>
      </div>
    </div>
  );
}
