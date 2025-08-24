import { Heart } from 'lucide-react';
import { SettingSection, TextArea } from '../index';
import type { UserProfile } from '@/data/UserProfileData';

interface BioSectionProps {
  editingSection: string | null;
  getCurrentValue: <K extends keyof UserProfile>(field: K) => UserProfile[K];
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
  startEditing: (section: string) => void;
  saveChanges: () => void;
  cancelEditing: () => void;
}

export function BioSection({
  editingSection,
  getCurrentValue,
  updateField,
  startEditing,
  saveChanges,
  cancelEditing
}: BioSectionProps) {
  const isEditing = editingSection === 'bio';

  return (
    <SettingSection 
      title="À propos de moi" 
      icon={<Heart className="h-5 w-5" />} 
      sectionKey="bio" 
      editable
      editingSection={editingSection}
      onStartEditing={startEditing}
      onSaveChanges={saveChanges}
      onCancelEditing={cancelEditing}
    >
      <TextArea 
        field="bio" 
        label="Bio" 
        placeholder="Parlez-nous de vous..." 
        maxLength={400}
        currentValue={getCurrentValue('bio') as string}
        editingSection={isEditing}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <TextArea 
        field="personalOpinion" 
        label="Ma vision de la vie" 
        placeholder="Votre philosophie, vos valeurs..."
        currentValue={getCurrentValue('personalOpinion') as string}
        editingSection={isEditing}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
    </SettingSection>
  );
}