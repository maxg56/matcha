import React from 'react';
import type { ImagePreview } from './types';
import { ImagePreviewItem } from './ImagePreviewItem';
import { AddImageButton } from './AddImageButton';

interface ImageGridProps {
  images: ImagePreview[];
  canAddMore: boolean;
  onRemoveImage: (id: string) => void;
  onAddImage: () => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  canAddMore, 
  onRemoveImage, 
  onAddImage 
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
    {images.map((image, index) => (
      <ImagePreviewItem 
        key={image.id}
        image={image}
        index={index}
        onRemove={onRemoveImage}
      />
    ))}
    
    {canAddMore && <AddImageButton onClick={onAddImage} />}
  </div>
);