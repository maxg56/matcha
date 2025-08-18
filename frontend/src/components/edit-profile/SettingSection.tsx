import { Button } from '@/components/ui/button';
import { Edit3, Save, X } from 'lucide-react';

interface SettingSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  sectionKey: string;
  editable?: boolean;
  editingSection: string | null;
  onStartEditing: (section: string) => void;
  onSaveChanges: () => void;
  onCancelEditing: () => void;
}

export function SettingSection({
  title,
  icon,
  children,
  sectionKey,
  editable = true,
  editingSection,
  onStartEditing,
  onSaveChanges,
  onCancelEditing
}: SettingSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {editable && (
          <div className="flex items-center gap-2">
            {editingSection === sectionKey ? (
              <>
                <Button variant="outline" size="sm" onClick={onCancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button size="sm" onClick={onSaveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauver
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onStartEditing(sectionKey)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
