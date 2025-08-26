import { useState, useRef, useCallback } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useSmashNotifications } from '@/utils/smashNotifications';
import type { ImagePreview } from './types';
import { MAX_IMAGES } from './types';

export const useImageUpload = () => {
  const { isLoading, errors, uploadImages } = useRegistrationStore();
  const [images, setImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const smashNotifier = useSmashNotifications();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    const remainingSlots = MAX_IMAGES - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    // Validate files and show notifications for invalid ones
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        smashNotifier.notifyCustom('error', `${file.name} n'est pas un fichier image valide`);
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        smashNotifier.notifyCustom('error', `${file.name} est trop volumineux (max 10MB)`);
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
      setImages(prev => [...prev, ...newImages]);
      smashNotifier.notifyCustom('success', 
        newImages.length === 1 
          ? 'Photo sélectionnée avec succès' 
          : `${newImages.length} photos sélectionnées avec succès`
      );
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images.length, smashNotifier]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
        smashNotifier.notifyCustom('info', 'Photo supprimée', { duration: 2000 });
      }
      return prev.filter(img => img.id !== id);
    });
  }, [smashNotifier]);



  const handleUpload = useCallback(async () => {
    if (images.length === 0) {
      smashNotifier.notifyCustom('warning', 'Aucune photo à uploader');
      return;
    }

    try {
      const files = images.map(img => img.file);
      
      // Notify upload start
      smashNotifier.notifyUploadStart(files.length);
      
      await uploadImages(files);
      
      // Success notification is handled by the store, but we can add our own
      smashNotifier.notifyUploadSuccess(files.length);
      
    } catch (error) {
      console.error('Failed to upload images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      smashNotifier.notifyUploadError(errorMessage, images.length);
    }
  }, [images, uploadImages, smashNotifier]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    images,
    isLoading,
    errors,
    fileInputRef,
    canAddMore: images.length < MAX_IMAGES,
    handleFileSelect,
    handleRemoveImage,
    handleUpload,
    openFileDialog,
  };
};