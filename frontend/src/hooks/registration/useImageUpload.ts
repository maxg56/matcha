import { useState, useRef, useCallback } from 'react';
import { useSmashNotifications, attemptTokenRefresh } from '@/utils/smashNotifications';
import { useNotifications } from '../ui/useNotifications';
import { ErrorHandler } from '@/utils/errorHandler';
import type { ImagePreview } from '../../components/registration/steps/image-upload/types';
import { MAX_IMAGES } from '../../components/registration/steps/image-upload/types';

export const useImageUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const smashNotifier = useSmashNotifications();
  const { dispatchUploadEvent } = useNotifications();

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

    const files = images.map(img => img.file);
    setIsLoading(true);
    setErrors({});
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        
        dispatchUploadEvent('upload_progress', `Upload en cours: ${index + 1}/${files.length} photos`, {
          imageCount: index + 1,
          totalImages: files.length
        });
        
        const response = await fetch('/api/v1/media/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload ${file.name}: ${errorText}`);
        }
        
        return (await response.json()).data;
      });
      
      await Promise.all(uploadPromises);
      
      dispatchUploadEvent('upload_success', `${files.length} photos uploadées avec succès !`, {
        imageCount: files.length
      });
      
      smashNotifier.notifyUploadSuccess(files.length);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement des images';
      
      // Handle token expiration
      if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
        dispatchUploadEvent('upload_progress', 'Session expirée. Tentative de renouvellement...', {
          error: 'token_refresh_attempt',
          imageCount: files.length
        });
        
        const refreshSuccess = await attemptTokenRefresh();
        
        if (refreshSuccess) {
          dispatchUploadEvent('upload_progress', 'Session renouvelée. Reprise de l\'upload...', {
            error: 'token_refreshed',
            imageCount: files.length
          });
          
          try {
            await handleUpload();
            return;
          } catch (retryError) {
            console.error('Retry upload failed:', retryError);
          }
        }
        
        // Token refresh failed
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        dispatchUploadEvent('upload_error', 'Session expirée. Redirection vers la connexion...', {
          error: 'token_expired',
          imageCount: files.length
        });
        
        setErrors({ images: 'Session expirée. Veuillez vous reconnecter.' });
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        
        throw new Error('token expired');
      }
      
      // Handle other errors
      const { fieldErrors } = ErrorHandler.parseAPIError(errorMessage, 'profile');
      
      dispatchUploadEvent('upload_error', errorMessage, {
        error: errorMessage,
        imageCount: files.length
      });
      
      setErrors({ ...fieldErrors, images: fieldErrors.images || 'Erreur lors du téléchargement des images' });
      smashNotifier.notifyUploadError(errorMessage, files.length);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [images, smashNotifier, dispatchUploadEvent]);

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