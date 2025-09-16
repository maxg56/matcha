import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { imageService, type ImageData } from '@/services/imageService';

interface ImageUploadState {
  images: ImageData[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: Record<string, number>;
}

interface ImageUploadActions {
  // Image management
  fetchUserImages: () => Promise<void>;
  uploadImage: (file: File, onProgress?: (progress: number) => void) => Promise<ImageData>;
  deleteImage: (imageId: number) => Promise<void>;

  // Reordering
  reorderImages: (reorderedImages: ImageData[]) => Promise<void>;
  optimisticReorder: (reorderedImages: ImageData[]) => void;

  // Metadata management
  updateImageMetadata: (
    imageId: number,
    metadata: {
      description?: string;
      alt_text?: string;
      visibility?: string;
    }
  ) => Promise<void>;

  // Visibility toggle
  toggleImageVisibility: (imageId: number, currentVisibility: string) => Promise<void>;

  // State management
  setImages: (images: ImageData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setUploadProgress: (fileId: string, progress: number) => void;
  clearUploadProgress: (fileId: string) => void;
  reset: () => void;
}

type ImageUploadStore = ImageUploadState & ImageUploadActions;

export const useImageUploadStore = create<ImageUploadStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      images: [],
      isLoading: false,
      error: null,
      uploadProgress: {},

      // State setters
      setImages: (images) => set({ images }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setUploadProgress: (fileId, progress) =>
        set((state) => ({
          uploadProgress: { ...state.uploadProgress, [fileId]: progress },
        })),
      clearUploadProgress: (fileId) =>
        set((state) => {
          const { [fileId]: _, ...rest } = state.uploadProgress;
          return { uploadProgress: rest };
        }),

      // Fetch user images
      fetchUserImages: async () => {
        set({ isLoading: true, error: null });
        try {
          const images = await imageService.getUserImages();

          // Sort by order_index
          const sortedImages = images.sort((a, b) => a.order_index - b.order_index);

          set({
            images: sortedImages,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch images';
          set({
            images: [],
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Upload new image
      uploadImage: async (file: File, onProgress?: (progress: number) => void) => {
        const fileId = `upload-${Date.now()}-${Math.random()}`;

        try {
          set({ error: null });

          // Set initial progress
          get().setUploadProgress(fileId, 0);

          // Upload with progress tracking
          const response = await imageService.uploadImageWithProgress(file, (progress) => {
            get().setUploadProgress(fileId, progress);
            onProgress?.(progress);
          });

          // Clear progress
          get().clearUploadProgress(fileId);

          // Create ImageData from response
          const newImage: ImageData = {
            id: parseInt(response.data.image_id),
            filename: response.data.image_url.split('/').pop() || '',
            original_name: file.name,
            order_index: get().images.length,
            visibility: 'public',
            is_profile: false,
            url: response.data.image_url,
          };

          // Add to state
          set((state) => ({
            images: [...state.images, newImage],
          }));

          return newImage;
        } catch (error) {
          get().clearUploadProgress(fileId);
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Delete image
      deleteImage: async (imageId: number) => {
        try {
          set({ error: null });

          await imageService.deleteImage(imageId.toString());

          // Remove from state
          set((state) => ({
            images: state.images.filter((img) => img.id !== imageId),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Optimistic reorder (for immediate UI feedback)
      optimisticReorder: (reorderedImages) => {
        set({ images: reorderedImages });
      },

      // Persist reorder to server
      reorderImages: async (reorderedImages: ImageData[]) => {
        const currentImages = get().images;

        try {
          set({ error: null });

          // Optimistically update UI
          get().optimisticReorder(reorderedImages);

          // Prepare reorder data
          const imageOrders = reorderedImages.map((image, index) => ({
            id: image.id,
            order_index: index,
          }));

          // Send to server
          const updatedImages = await imageService.reorderImages(imageOrders);

          // Update with server response
          set({ images: updatedImages });
        } catch (error) {
          // Revert optimistic update on error
          set({ images: currentImages });

          const errorMessage = error instanceof Error ? error.message : 'Failed to reorder images';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Update image metadata
      updateImageMetadata: async (imageId, metadata) => {
        try {
          set({ error: null });

          const updatedImage = await imageService.updateImageMetadata(imageId, metadata);

          // Update in state
          set((state) => ({
            images: state.images.map((img) =>
              img.id === imageId ? { ...img, ...updatedImage } : img
            ),
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update metadata';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Toggle image visibility
      toggleImageVisibility: async (imageId, currentVisibility) => {
        const visibilityOrder = ['public', 'friends_only', 'private'];
        const currentIndex = visibilityOrder.indexOf(currentVisibility);
        const nextVisibility = visibilityOrder[(currentIndex + 1) % visibilityOrder.length];

        try {
          await get().updateImageMetadata(imageId, { visibility: nextVisibility });
        } catch (error) {
          console.error('Failed to toggle visibility:', error);
          throw error;
        }
      },

      // Reset store
      reset: () => {
        set({
          images: [],
          isLoading: false,
          error: null,
          uploadProgress: {},
        });
      },
    }),
    { name: 'ImageUploadStore' }
  )
);

export type { ImageData };