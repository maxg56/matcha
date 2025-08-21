import { Palette } from 'lucide-react';
import { SettingSection, SelectField } from '../index';
import { fieldOptions } from '@/data/EditProfileOptions';
import type { UserProfile } from '@/data/UserProfileData';

interface AppearanceSectionProps {
  editingSection: string | null;
  getCurrentValue: <K extends keyof UserProfile>(field: K) => UserProfile[K];
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
  startEditing: (section: string) => void;
  saveChanges: () => void;
  cancelEditing: () => void;
}

export function AppearanceSection({
  editingSection,
  getCurrentValue,
  updateField,
  startEditing,
  saveChanges,
  cancelEditing
}: AppearanceSectionProps) {
  const isEditing = editingSection === 'appearance';

  return (
    <SettingSection 
      title="Apparence Physique" 
      icon={<Palette className="h-5 w-5" />} 
      sectionKey="appearance" 
      editable
      editingSection={editingSection}
      onStartEditing={startEditing}
      onSaveChanges={saveChanges}
      onCancelEditing={cancelEditing}
    >
      <SelectField 
        field="hairColor" 
        options={fieldOptions.hairColor} 
        label="Couleur des cheveux"
        currentValue={getCurrentValue('hairColor') as string}
        editable={true}
        editingSection={isEditing}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <SelectField 
        field="eyeColor" 
        options={fieldOptions.eyeColor} 
        label="Couleur des yeux"
        currentValue={getCurrentValue('eyeColor') as string}
        editable={true}
        editingSection={isEditing}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <SelectField 
        field="skinColor" 
        options={fieldOptions.skinColor} 
        label="Couleur de peau"
        currentValue={getCurrentValue('skinColor') as string}
        editable={true}
        editingSection={isEditing}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
    </SettingSection>
  );
}