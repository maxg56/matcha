import React, { useCallback, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export const MAX_IMAGES = 5;

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

export const ImageUploadStep: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ouvre le dialogue de fichier
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Gestion de la selection de fichiers
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const newImages: UploadedImage[] = [];
      const newErrors: string[] = [];
      const remainingSlots = MAX_IMAGES - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        if (!file.type.startsWith('image/')) {
          newErrors.push(`Le fichier ${file.name} n'est pas une image.`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          newErrors.push(`Le fichier ${file.name} dépasse 10 Mo.`);
          return;
        }

        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          id: Math.random().toString(36).substring(2, 9),
        });
      });

      setErrors(newErrors);
      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [images.length]
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Camera className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold">Ajoutez vos photos</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Au moins 1 photo requise - Ajoutez jusqu'à {MAX_IMAGES} photos pour compléter votre profil.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative">
            <img src={img.preview} alt="preview" className="w-full h-32 object-cover rounded-md" />
            <button
              onClick={() => handleRemoveImage(img.id)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={openFileDialog}
            className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-32 text-gray-500 hover:border-gray-400 hover:text-gray-700"
          >
            Ajouter
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((err, idx) => (
            <div key={idx} className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {err}
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <span className={images.length === 0 ? 'text-red-600 font-medium' : ''}>
          {images.length}/{MAX_IMAGES} photos ajoutées
        </span>
        {images.length === 0 && <div className="text-xs mt-1 text-red-500">Minimum requis: 1 photo</div>}
      </div>
    </div>
  );
};
