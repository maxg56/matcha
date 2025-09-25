import { apiService } from './api';

interface ImageUploadResponse {
  success: boolean;
  data: {
    id: number;
    filename: string;
    url: string;
    original_name: string;
    file_size: number;
    width?: number;
    height?: number;
    mime_type: string;
  };
}

interface ImageDeleteResponse {
  success: boolean;
  message: string;
}

class ImageService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8443';

  async uploadImage(file: File, _onProgress?: (progress: number) => void): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${this.baseURL}/api/v1/media/upload`, {
        method: 'POST',
        credentials: 'include', // Important: utiliser les cookies pour l'authentification
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
      xhr.withCredentials = true; // Important: utiliser les cookies pour l'authentification
      xhr.send(formData);
    });
  }

  async deleteImage(imageId: string): Promise<ImageDeleteResponse> {
    return apiService.delete<ImageDeleteResponse>(`/api/v1/media/delete/${imageId}`);
  }

  async getUserImages(userId?: number): Promise<string[]> {
    const endpoint = userId 
      ? `/api/v1/media/users/${userId}/images`
      : '/api/v1/media/images';
    
    return apiService.get<string[]>(endpoint);
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

  // Note: Image reordering is now handled via the profile update API
  // This method is kept for future potential use with a dedicated reorder endpoint
  async reorderImages(_userId: number, _newOrder: string[]): Promise<void> {
    throw new Error('Image reordering should use the profile update API');
  }
}

export const imageService = new ImageService();
export type { ImageUploadResponse, ImageDeleteResponse };