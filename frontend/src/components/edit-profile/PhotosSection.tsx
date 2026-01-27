import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { useUserStore } from '@/stores/userStore';

interface PhotosSectionProps {
  photos: string[];
  isEditing?: boolean;
}

export function PhotosSection({ photos, isEditing = false }: PhotosSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { profile, isLoading, uploadImage, removeImage } = useUserStore();
  
  // Utiliser les images du store pour un affichage en temps réel, sinon fallback sur la prop
  const currentPhotos = profile?.images || photos;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadImage(file);
        
        // Le service uploadImage met déjà à jour le store automatiquement
        
        // Reset le champ fichier
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch {
        // Silently handle upload errors
      }
    }
  };

  const handleRemoveImage = async (photoUrl: string) => {
    try {
      if (!photoUrl || photoUrl === 'undefined') {
        return;
      }

      // Sécurité : Empêcher la suppression de la dernière image
      const validPhotos = currentPhotos.filter(photo => photo && photo !== 'undefined');
      if (validPhotos.length <= 1) {
        alert('Vous devez garder au moins une photo sur votre profil.');
        return;
      }
      
      // Vérifier si c'est une image de notre service media (commence par /api/v1/media/)
      if (photoUrl.includes('/api/v1/media/get/')) {
        // Extraire le nom de fichier pour les images de notre service
        const filename = photoUrl.split('/api/v1/media/get/')[1];
        if (filename) {
          await removeImage(filename);
        }
      } else {
        // Pour les images externes ou par défaut, on les supprime juste du profil
        const currentImages = currentPhotos;
        const updatedImages = currentImages.filter(img => img !== photoUrl);
        
        // Mise à jour directe dans le store + sauvegarde
        const currentProfile = useUserStore.getState().profile;
        if (currentProfile) {
          useUserStore.getState().setProfile({ 
            ...currentProfile, 
            images: updatedImages 
          });
          
          // Sauvegarder immédiatement en base
          const { updateProfile } = useUserStore.getState();
          updateProfile({ images: updatedImages });
        }
      }
    } catch {
      // Silently handle errors
    }
  };

  // Fonction pour réorganiser les images
  const reorderImages = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }
    
    const newImages = [...currentPhotos];
    const movedImage = newImages.splice(fromIndex, 1)[0];
    newImages.splice(toIndex, 0, movedImage);
    
    try {
      // Mise à jour locale immédiate pour le feedback visuel
      const currentProfile = useUserStore.getState().profile;
      if (currentProfile) {
        useUserStore.getState().setProfile({ 
          ...currentProfile, 
          images: newImages 
        });
      }
      
      // Appel API pour sauvegarder
      const { updateProfile } = useUserStore.getState();
      updateProfile({ images: newImages });
    } catch {
      // Silently handle errors
    }
  };

  // Fonctions pour boutons de réorganisation
  const moveImageLeft = async (index: number) => {
    if (index > 0) {
      await reorderImages(index, index - 1);
    }
  };

  const moveImageRight = async (index: number) => {
    if (index < currentPhotos.length - 1) {
      await reorderImages(index, index + 1);
    }
  };

  // Événements pour desktop (drag & drop)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (_e: React.DragEvent, index: number) => {
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Ne clear que si on sort vraiment du conteneur
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      await reorderImages(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Événements pour mobile (touch)
  const handleTouchStart = (_e: React.TouchEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Ne pas appeler preventDefault() car l'événement est passif
    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (elementBelow) {
      const imageContainer = elementBelow.closest('[data-image-index]');
      if (imageContainer) {
        const index = parseInt(imageContainer.getAttribute('data-image-index') || '-1');
        if (index >= 0) {
          setDragOverIndex(index);
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      await reorderImages(draggedIndex, dragOverIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };


  return (
    <div className="p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        {currentPhotos.filter(photo => photo && photo !== 'undefined').map((photo, index) => (
          <div 
            key={index}
            data-image-index={index}
            draggable={isEditing}
            onDragStart={(e) => isEditing && handleDragStart(e, index)}
            onDragOver={(e) => isEditing && handleDragOver(e)}
            onDragEnter={(e) => isEditing && handleDragEnter(e, index)}
            onDragLeave={(e) => isEditing && handleDragLeave(e)}
            onDrop={(e) => isEditing && handleDrop(e, index)}
            onDragEnd={isEditing ? handleDragEnd : undefined}
            onTouchStart={(e) => isEditing && handleTouchStart(e, index)}
            onTouchMove={(e) => isEditing && handleTouchMove(e)}
            onTouchEnd={isEditing ? handleTouchEnd : undefined}
            className={`relative aspect-[3/4] rounded-lg overflow-hidden bg-muted transition-all ${
              isEditing ? 'cursor-move touch-none' : 'cursor-default'
            } ${
              dragOverIndex === index ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''
            } ${
              draggedIndex === index ? 'opacity-50 scale-95' : ''
            }`}
          >
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`} 
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            {index === 0 && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="text-xs">Principal</Badge>
              </div>
            )}
            {isEditing && (
              <>
                <button 
                  onClick={() => handleRemoveImage(photo)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors z-10"
                  title="Supprimer cette photo"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 rounded p-1" title="Glissez pour réorganiser">
                  <GripVertical className="h-4 w-4 text-white" />
                </div>
                {/* Boutons de réorganisation alternative */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => moveImageLeft(index)}
                      className="w-6 h-6 bg-black/50 rounded flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                      title="Déplacer vers la gauche"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                  )}
                  {index < currentPhotos.length - 1 && (
                    <button
                      onClick={() => moveImageRight(index)}
                      className="w-6 h-6 bg-black/50 rounded flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                      title="Déplacer vers la droite"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {isEditing && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`aspect-[3/4] rounded-lg border-2 border-dashed transition-colors flex items-center justify-center ${
              isLoading 
                ? 'border-gray-300 cursor-not-allowed' 
                : 'border-border hover:border-primary cursor-pointer'
            }`}
            title={isLoading ? "Chargement en cours..." : "Ajouter une nouvelle photo"}
          >
            <div className="text-center">
              {isLoading ? (
                <>
                  <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-primary rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Upload...</p>
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Ajouter</p>
                </>
              )}
            </div>
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {isEditing 
          ? "Ajoutez au moins 2 photos. La première sera votre photo principale. Glissez-déposez ou utilisez les flèches ← → pour réorganiser. Au moins une photo est obligatoire."
          : "Vos photos de profil. Cliquez sur 'Modifier' pour les gérer."
        }
      </p>
      

    </div>
  );
}