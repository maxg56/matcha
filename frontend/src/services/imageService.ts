import { apiService } from './api';

interface ImageUploadResponse {
  success: boolean;
  data: {
    image_id: string;
    image_url: string;
    thumbnail_url?: string;
  };
}

interface ImageDeleteResponse {
  success: boolean;
  message: string;
}

interface ImageData {
  id: number;
  filename: string;
  original_name: string;
  order_index: number;
  visibility: 'public' | 'private' | 'friends_only';
  description?: string;
  alt_text?: string;
  is_profile: boolean;
  url?: string;
}

interface ImageReorderResponse {
  success: boolean;
  message: string;
  data: {
    images: ImageData[];
  };
}

interface ImageMetadataResponse {
  success: boolean;
  message: string;
  data: {
    image: ImageData;
  };
}

interface UserImagesResponse {
  success: boolean;
  data: {
    images: ImageData[];
  };
}

class ImageService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8443';

  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Custom fetch for progress tracking
      const response = await fetch(`${this.baseURL}/api/v1/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async uploadImageWithProgress(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('image', file);

      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.error || 'Upload failed'));
            }
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      // Abort handler
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Start upload
      xhr.open('POST', `${this.baseURL}/api/v1/media/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      xhr.send(formData);
    });
  }

  async deleteImage(imageId: string): Promise<ImageDeleteResponse> {
    return apiService.delete<ImageDeleteResponse>(`/api/v1/media/images/${imageId}`);
  }

  async getUserImages(userId?: number): Promise<ImageData[]> {
    const endpoint = userId
      ? `/api/v1/media/user/${userId}`
      : '/api/v1/media/my';

    const response = await apiService.get<UserImagesResponse>(endpoint);
    return response.data.images;
  }

  async reorderImages(imageOrders: { id: number; order_index: number }[]): Promise<ImageData[]> {
    const response = await apiService.put<ImageReorderResponse>('/api/v1/media/order', {
      images: imageOrders
    });
    return response.data.images;
  }

  async updateImageMetadata(
    imageId: number,
    metadata: {
      description?: string;
      alt_text?: string;
      visibility?: string;
    }
  ): Promise<ImageData> {
    const response = await apiService.put<ImageMetadataResponse>(`/api/v1/media/images/${imageId}`, metadata);
    return response.data.image;
  }

  async getImageById(imageId: number): Promise<ImageData> {
    const response = await apiService.get<ImageMetadataResponse>(`/api/v1/media/images/${imageId}`);
    return response.data.image;
  }

  // Temporary upload for registration (before user account is created)
  async uploadTemporaryImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('temporary', 'true');

    try {
      const response = await fetch(`${this.baseURL}/api/v1/media/upload-temp`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Temporary upload failed');
      }

      return data;
    } catch (error) {
      console.error('Temporary image upload failed:', error);
      throw error;
    }
  }

  // Convert temporary images to permanent after registration
  async confirmTemporaryImages(imageUrls: string[]): Promise<void> {
    return apiService.post('/api/v1/media/confirm-temp-images', {
      image_urls: imageUrls
    });
  }

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Seuls les formats JPG, PNG et WEBP sont acceptés'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'L\'image ne doit pas dépasser 5MB'
      };
    }

    return { valid: true };
  }

  // Create image preview URL
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Cleanup preview URL
  revokePreviewUrl(url: string): void {
    if (url && !url.startsWith('http')) {
      URL.revokeObjectURL(url);
    }
  }
}

export const imageService = new ImageService();
export type {
  ImageUploadResponse,
  ImageDeleteResponse,
  ImageData,
  ImageReorderResponse,
  ImageMetadataResponse,
  UserImagesResponse
};