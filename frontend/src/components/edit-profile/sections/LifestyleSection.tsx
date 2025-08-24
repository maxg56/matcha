import { Wine } from 'lucide-react';
import { SettingSection, SelectField } from '../index';
import { fieldOptions } from '@/data/EditProfileOptions';
import type { UserProfile } from '@/data/UserProfileData';

interface LifestyleSectionProps {
  editingSection: string | null;
  getCurrentValue: <K extends keyof UserProfile>(field: K) => UserProfile[K];
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
  startEditing: (section: string) => void;
  saveChanges: () => void;
  cancelEditing: () => void;
}

export function LifestyleSection({
  editingSection,
  getCurrentValue,
  updateField,
  startEditing,
  saveChanges,
  cancelEditing
}: LifestyleSectionProps) {
  const isEditing = editingSection === 'lifestyle';

  const lifestyleFields = [
    { field: 'alcoholConsumption' as const, label: 'Consommation d\'alcool', options: fieldOptions.alcoholConsumption },
    { field: 'smoking' as const, label: 'Tabac', options: fieldOptions.smoking },
    { field: 'cannabis' as const, label: 'Cannabis', options: fieldOptions.cannabis },
    { field: 'drugs' as const, label: 'Autres drogues', options: fieldOptions.drugs },
    { field: 'pets' as const, label: 'Animaux de compagnie', options: fieldOptions.pets }
  ];

  return (
    <SettingSection 
      title="Style de Vie" 
      icon={<Wine className="h-5 w-5" />} 
      sectionKey="lifestyle" 
      editable
      editingSection={editingSection}
      onStartEditing={startEditing}
      onSaveChanges={saveChanges}
      onCancelEditing={cancelEditing}
    >
      {lifestyleFields.map(({ field, label, options }) => (
        <SelectField 
          key={field}
          field={field} 
          options={options} 
          label={label}
          currentValue={getCurrentValue(field) as string}
          editable={true}
          editingSection={isEditing}
          onChange={(field, value) => updateField(field as keyof UserProfile, value)}
        />
      ))}
    </SettingSection>
  );
}