import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

interface PhotosSectionProps {
  photos: string[];
}

export function PhotosSection({ photos }: PhotosSectionProps) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="text-xs">Principal</Badge>
              </div>
            )}
            <button className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button className="aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center">
          <div className="text-center">
            <Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Ajouter</p>
          </div>
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Ajoutez au moins 2 photos. La première sera votre photo principale.</p>
    </div>
  );
}