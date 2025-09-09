import React, { useCallback, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { useRegistrationStore } from '@/stores/registrationStore';
import type { ImagePreview } from '@/components/registration/steps/image-upload/types';
import { MAX_IMAGES } from '@/components/registration/steps/image-upload/types';

export const ImageUploadStep: React.FC = () => {
  const { selectedImages, addImages, removeImage, errors: formErrors } = useRegistrationStore();
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

      const newImages: ImagePreview[] = [];
      const newErrors: string[] = [];
      const remainingSlots = MAX_IMAGES - selectedImages.length;
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
        addImages(newImages);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [selectedImages.length, addImages]
  );

  const handleRemoveImage = useCallback((id: string) => {
    removeImage(id);
  }, [removeImage]);

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
        {selectedImages.map((img) => (
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

        {selectedImages.length < MAX_IMAGES && (
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

      {(errors.length > 0 || formErrors.images) && (
        <div className="space-y-2">
          {formErrors.images && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {formErrors.images}
            </div>
          )}
          {errors.map((err, idx) => (
            <div key={idx} className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {err}
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <span className={selectedImages.length === 0 ? 'text-red-600 font-medium' : ''}>
          {selectedImages.length}/{MAX_IMAGES} photos ajoutées
        </span>
        {selectedImages.length === 0 && <div className="text-xs mt-1 text-red-500">Minimum requis: 1 photo</div>}
      </div>
    </div>
  );
};
