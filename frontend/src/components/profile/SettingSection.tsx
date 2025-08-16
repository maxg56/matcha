import { Button } from '@/components/ui/button';
import { Edit3, Save, X } from 'lucide-react';

interface SettingSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  sectionKey: string;
  editable?: boolean;
  isEditing: boolean;
  onStartEdit: (section: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SettingSection({
  title,
  icon,
  children,
  sectionKey,
  editable = true,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}: SettingSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {editable && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={onSave}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  onClick={onCancel}
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onStartEdit(sectionKey)}
                size="sm"
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
}
