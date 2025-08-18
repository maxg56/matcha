import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormData {
  photos: string[];
}

interface PhotosStepProps {
  formData: Pick<FormData, 'photos'>;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function PhotosStep({ formData, updateFormData }: PhotosStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground mb-6">
          Ajoutez jusqu'à 6 photos pour montrer votre personnalité
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "aspect-[3/4] rounded-2xl border-2 border-dashed border-border",
              "flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors",
              "bg-muted/20"
            )}
          >
            <div className="text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Photo {index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Choisir des photos
        </Button>
      </div>
    </div>
  );
}