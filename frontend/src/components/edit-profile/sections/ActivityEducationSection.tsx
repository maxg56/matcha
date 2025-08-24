import { Activity } from 'lucide-react';
import { SettingSection, SelectField } from '../index';
import { fieldOptions } from '@/data/EditProfileOptions';
import type { UserProfile } from '@/data/UserProfileData';

interface ActivityEducationSectionProps {
  editingSection: string | null;
  getCurrentValue: <K extends keyof UserProfile>(field: K) => UserProfile[K];
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
  startEditing: (section: string) => void;
  saveChanges: () => void;
  cancelEditing: () => void;
}

export function ActivityEducationSection({
  editingSection,
  getCurrentValue,
  updateField,
  startEditing,
  saveChanges,
  cancelEditing
}: ActivityEducationSectionProps) {
  const isEditing = editingSection === 'activity';

  const activityFields = [
    { field: 'socialActivityLevel' as const, label: 'Niveau d\'activité sociale', options: fieldOptions.activityLevel },
    { field: 'sportActivity' as const, label: 'Activité sportive', options: fieldOptions.activityLevel },
    { field: 'educationLevel' as const, label: 'Niveau d\'éducation', options: fieldOptions.educationLevel }
  ];

  return (
    <SettingSection 
      title="Activité & Éducation" 
      icon={<Activity className="h-5 w-5" />} 
      sectionKey="activity" 
      editable
      editingSection={editingSection}
      onStartEditing={startEditing}
      onSaveChanges={saveChanges}
      onCancelEditing={cancelEditing}
    >
      {activityFields.map(({ field, label, options }) => (
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