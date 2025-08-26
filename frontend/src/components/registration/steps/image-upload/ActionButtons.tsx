import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
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
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Finalisation...
          </>
        ) : (
          <>
            Finaliser mon profil
            <Check className="h-4 w-4" />
          </>
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