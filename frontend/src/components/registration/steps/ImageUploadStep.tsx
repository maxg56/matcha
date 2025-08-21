import React, { useState, useRef } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImagePreview {
  file: File;
  preview: string;
  id: string;
}

export const ImageUploadStep: React.FC = () => {
  const {
    isLoading,
    errors,
  } = useRegistrationStore();

  const [images, setImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxImages = 5;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    const remainingSlots = maxImages - images.length;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          id: Math.random().toString(36).substring(7),
        });
      }
    });

    setImages(prev => [...prev, ...newImages]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up object URL
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return updated;
    });
  };

  const handleSkip = () => {
    // Skip image upload and go directly to the app
    window.location.href = '/app/discover';
  };

  const canAddMore = images.length < maxImages;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Camera className="w-12 h-12 text-blue-500" />
        </div>
        <CardTitle>Ajoutez vos photos</CardTitle>
        <CardDescription>
          Ajoutez entre 1 et {maxImages} photos pour compléter votre profil. 
          Une belle photo peut faire toute la différence !
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Principale
                  </div>
                )}
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Image Button */}
          {canAddMore && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-blue-500"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Ajouter</span>
            </button>
          )}
        </div>

        {/* Upload Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Guidelines */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Conseils pour de belles photos
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Utilisez des photos récentes et de bonne qualité</li>
            <li>• Montrez clairement votre visage sur la photo principale</li>
            <li>• Variez les angles et les contextes (portrait, activité, etc.)</li>
            <li>• Évitez les photos de groupe où on ne vous distingue pas</li>
            <li>• Souriez ! Les photos joyeuses attirent plus de matches</li>
          </ul>
        </div>

        {/* Error Messages */}
        {errors.images && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.images}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <div className="text-center text-sm text-muted-foreground">
          {images.length}/{maxImages} photos ajoutées
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="mx-auto"
          >
            Passer pour maintenant et finaliser mon profil
          </Button>
        </div>

        {images.length === 0 && (
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucune photo ajoutée. Cliquez sur "Ajouter" pour commencer.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};