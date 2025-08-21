import { Heart } from 'lucide-react';
import { SettingSection, SelectField, TextInput } from '../index';
import { fieldOptions } from '@/data/EditProfileOptions';
import type { UserProfile } from '@/data/UserProfileData';

interface PersonalInfoSectionProps {
  editingSection: string | null;
  getCurrentValue: <K extends keyof UserProfile>(field: K) => UserProfile[K];
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
  startEditing: (section: string) => void;
  saveChanges: () => void;
  cancelEditing: () => void;
}

export function PersonalInfoSection({
  editingSection,
  getCurrentValue,
  updateField,
  startEditing,
  saveChanges,
  cancelEditing
}: PersonalInfoSectionProps) {
  const isEditing = editingSection === 'personal';

  const personalFields = [
    { field: 'religion' as const, label: 'Religion', options: fieldOptions.religion },
    { field: 'relationshipType' as const, label: 'Type de relation recherchée', options: fieldOptions.relationshipType },
    { field: 'childrenStatus' as const, label: 'Situation avec les enfants', options: fieldOptions.childrenStatus },
    { field: 'politicalView' as const, label: 'Orientation politique', options: fieldOptions.politicalView }
  ];

  return (
    <SettingSection 
      title="Informations Personnelles" 
      icon={<Heart className="h-5 w-5" />} 
      sectionKey="personal" 
      editable
      editingSection={editingSection}
      onStartEditing={startEditing}
      onSaveChanges={saveChanges}
      onCancelEditing={cancelEditing}
    >
      {personalFields.map(({ field, label, options }) => (
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
      <TextInput 
        field="zodiacSign" 
        label="Signe du zodiaque" 
        placeholder="Votre signe astrologique"
        currentValue={getCurrentValue('zodiacSign') as string}
        editingSection={isEditing}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
    </SettingSection>
  );
}