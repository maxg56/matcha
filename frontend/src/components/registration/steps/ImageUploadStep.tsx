import React, { useCallback } from 'react';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Camera, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProfileNotifications, useRegistration } from '@/hooks';
import { useRegistrationStore } from '@/stores/registrationStore';
import { 
  ImageGrid, 
  ActionButtons, 
  PhotoGuidelines, 
  MAX_IMAGES 
} from './image-upload';

export const ImageUploadStep: React.FC = () => {
  const {
    selectedImages: images,
    isLoading,
    errors,
    completeRegistration
  } = useRegistration();
  
  const {
    addImages,
    removeImage
  } = useRegistrationStore();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Hook to handle profile completion notifications
  useProfileNotifications();

  // Gestion de la sélection de fichiers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = [];
    const remainingSlots = MAX_IMAGES - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        return;
      }
      
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        id: Math.random().toString(36).substring(7),
      });
    });

    if (newImages.length > 0) {
      addImages(newImages);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images.length, addImages]);

  const handleRemoveImage = useCallback((id: string) => {
    removeImage(id);
  }, [removeImage]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Fonction pour finaliser l'inscription avec les images du store
  const handleCompleteRegistration = useCallback(async () => {
    await completeRegistration();
  }, [completeRegistration]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Camera className="w-10 h-10 text-purple-600" />
        </div>
        <CardTitle className="text-2xl">Ajoutez vos photos</CardTitle>
        <CardDescription>
          <span className="text-red-600 dark:text-red-400 font-medium">Au moins 1 photo requise</span> - 
          Ajoutez jusqu'à {MAX_IMAGES} photos pour compléter votre profil. 
          Une belle photo peut faire toute la différence !
        </CardDescription>
      </div>

      <CardContent className="space-y-6">
        <ImageGrid 
          images={images}
          canAddMore={images.length < MAX_IMAGES}
          onRemoveImage={handleRemoveImage}
          onAddImage={openFileDialog}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Sélectionner des images"
        />

        <PhotoGuidelines />

        {errors.images && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.images}</AlertDescription>
          </Alert>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <span className={images.length === 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
            {images.length}/{MAX_IMAGES} photos ajoutées
          </span>
          {images.length === 0 && (
            <span className="block text-xs mt-1 text-red-500 dark:text-red-400">
              Minimum requis: 1 photo
            </span>
          )}
        </div>

        <ActionButtons 
          images={images}
          isLoading={isLoading}
          onUpload={handleCompleteRegistration}
        />
      </CardContent>
    </div>
  );
};
