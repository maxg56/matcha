import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface PreferencesActionsProps {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  onClose?: () => void;
}

export function PreferencesActions({
  hasChanges,
  saving,
  onSave,
  onReset,
  onClose
}: PreferencesActionsProps) {
  if (onClose) {
    // Mode modal - layout spécial avec bouton fermer
    return (
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={saving}
        >
          Fermer
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={!hasChanges || saving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>

          <Button
            onClick={onSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>
    );
  }

  // Mode page normale
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onReset}
        disabled={!hasChanges || saving}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Annuler
      </Button>

      <Button
        onClick={onSave}
        disabled={!hasChanges || saving}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Sauvegarder
      </Button>
    </div>
  );
}