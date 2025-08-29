import React from 'react';
import { X, Camera } from 'lucide-react';
import type { ImagePreview } from './types';

interface ImagePreviewItemProps {
  image: ImagePreview;
  index: number;
  onRemove: (id: string) => void;
}

export const ImagePreviewItem: React.FC<ImagePreviewItemProps> = React.memo(({ image, index, onRemove }) => (
  <div className="relative group">
    <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-lg border border-gray-200/60 dark:border-gray-600/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 hover:-rotate-1">
      {/* Image with gradient overlay */}
      <div className="relative w-full h-full">
        <img
          src={image.preview}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {/* Main photo badge */}
        {index === 0 && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Photo principale
            </span>
          </div>
        )}
        
        {/* Photo number indicator */}
        <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20 dark:border-gray-600/20">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{index + 1}</span>
        </div>
        
        {/* Delete button */}
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
          aria-label="Supprimer l'image"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-gray-400/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>
    </div>
    
    {/* 3D shadow effect */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 dark:from-purple-400/10 dark:to-blue-400/10 transform translate-y-2 translate-x-2 -z-10 transition-all duration-500 group-hover:translate-y-3 group-hover:translate-x-3 group-hover:opacity-40"></div>
  </div>
));