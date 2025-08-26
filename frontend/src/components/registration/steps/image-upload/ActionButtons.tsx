import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import type { ImagePreview } from './types';

interface ActionButtonsProps {
  images: ImagePreview[];
  isLoading: boolean;
  onUpload: () => void;
  onSkip: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  images, 
  isLoading, 
  onUpload, 
  onSkip 
}) => (
  <div className="flex flex-col gap-4">
    {images.length > 0 && (
      <Button
        onClick={onUpload}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg shadow-sm"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Téléchargement...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Continuer avec {images.length} photo{images.length > 1 ? 's' : ''}
          </div>
        )}
      </Button>
    )}
    
    {images.length === 0 && (
      <div className="text-center space-y-3">
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-orange-800 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium text-sm">Photo recommandée</span>
          </div>
          <p className="text-xs text-orange-600">
            Les profils avec photos reçoivent 10x plus de matches !
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={onSkip}
          disabled={isLoading}
          className="text-gray-600 hover:text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
        >
          Continuer sans photo
        </Button>
      </div>
    )}
  </div>
);