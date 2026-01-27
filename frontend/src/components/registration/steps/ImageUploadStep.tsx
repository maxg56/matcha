import React, { useCallback, useRef, useState } from 'react';
import { Camera, AlertCircle, Upload, CheckCircle, X } from 'lucide-react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { ErrorAlert } from '@/components/ui/error-alert';
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
          newErrors.push(`❌ ${file.name} : Format non supporté. Utilisez JPG, PNG, GIF ou WebP.`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          newErrors.push(`📏 ${file.name} : Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 10 Mo.`);
          return;
        }
        if (file.size < 1024) {
          newErrors.push(`⚠️ ${file.name} : Fichier trop petit. Minimum 1 Ko.`);
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
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ajoutez vos photos</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          📸 Au moins 1 photo requise pour continuer. Ajoutez jusqu'à {MAX_IMAGES} photos pour un profil attractif.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span>✅ JPG, PNG, GIF, WebP</span>
          <span>📏 Max 10 Mo</span>
          <span>🎯 Minimum 1 Ko</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {selectedImages.map((img, index) => (
          <div key={img.id} className="relative group">
            <div className="relative">
              <img
                src={img.preview}
                alt="preview"
                className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl" />

              {/* Badge numéro */}
              <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {index + 1}
              </div>

              {/* Bouton supprimer */}
              <button
                onClick={() => handleRemoveImage(img.id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Supprimer cette photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {selectedImages.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={openFileDialog}
            className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl h-32 text-purple-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
          >
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Ajouter</span>
            <span className="text-xs opacity-75">Cliquez ici</span>
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

      {/* Affichage des erreurs */}
      {formErrors.images && (
        <ErrorAlert error={formErrors.images} />
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Erreurs de téléchargement ({errors.length})
            </h4>
            <div className="space-y-1">
              {errors.map((err, idx) => (
                <div key={idx} className="text-sm text-red-600 dark:text-red-400">
                  {err}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compteur et indicateur de statut */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          selectedImages.length === 0
            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            : selectedImages.length >= 3
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
        }`}>
          {selectedImages.length === 0 ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>0/{MAX_IMAGES} photos - Minimum requis: 1 photo</span>
            </>
          ) : selectedImages.length >= 3 ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{selectedImages.length}/{MAX_IMAGES} photos - Excellent profil ! 🎉</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>{selectedImages.length}/{MAX_IMAGES} photos - Ajoutez-en plus pour un meilleur profil</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
