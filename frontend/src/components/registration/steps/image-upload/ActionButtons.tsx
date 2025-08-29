import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import type { ImagePreview } from './types';

interface ActionButtonsProps {
  images: ImagePreview[];
  isLoading: boolean;
  onUpload: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  images, 
  isLoading, 
  onUpload
}) => (
  <div className="flex flex-col gap-4">
    {images.length > 0 ? (
      <Button
        onClick={onUpload}
        disabled={isLoading}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white disabled:opacity-50"
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
    ) : (
      <div className="text-center space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-red-800 dark:text-red-300 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Photo requise</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400">
            Vous devez ajouter au moins une photo pour finaliser votre profil et commencer à rencontrer des personnes.
          </p>
        </div>
        
        <Button
          disabled={true}
          className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        >
          Ajoutez une photo pour continuer
        </Button>
      </div>
    )}
  </div>
);