import { User } from 'lucide-react';
import { SettingSection, SelectField, SliderField, TextInput } from '../index';
import { fieldOptions } from '@/data/EditProfileOptions';
import type { UserProfile } from '@/data/UserProfileData';
import { formatBirthDate, formatAge } from '@/utils/dateUtils';

interface BasicInfoSectionProps {
  user: UserProfile;
  editingSection: string | null;
  getCurrentValue: <K extends keyof UserProfile>(field: K) => UserProfile[K];
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
  startEditing: (section: string) => void;
  saveChanges: () => void;
  cancelEditing: () => void;
}

export function BasicInfoSection({
  user,
  editingSection,
  getCurrentValue,
  updateField,
  startEditing,
  saveChanges,
  cancelEditing
}: BasicInfoSectionProps) {
  return (
    <SettingSection 
      title="Informations de Base" 
      icon={<User className="h-5 w-5" />} 
      sectionKey="basic" 
      editable
      editingSection={editingSection}
      onStartEditing={startEditing}
      onSaveChanges={saveChanges}
      onCancelEditing={cancelEditing}
    >
      <TextInput 
        field="firstName" 
        label="Prénom" 
        placeholder="Votre prénom" 
        currentValue={getCurrentValue('firstName') as string}
        editingSection={editingSection === 'basic'}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <TextInput 
        field="lastName" 
        label="Nom" 
        placeholder="Votre nom" 
        currentValue={getCurrentValue('lastName') as string}
        editingSection={editingSection === 'basic'}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <TextInput 
        field="username" 
        label="Nom d'utilisateur" 
        placeholder="@username" 
        currentValue={getCurrentValue('username') as string}
        editingSection={editingSection === 'basic'}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground mb-2">Date de naissance</h3>
        <p className="text-foreground">{formatBirthDate(user.birthDate)} ({formatAge(user.age)})</p>
        <p className="text-xs text-muted-foreground mt-1">L'âge ne peut pas être modifié</p>
      </div>
      <SelectField 
        field="gender" 
        options={fieldOptions.gender} 
        label="Genre" 
        currentValue={getCurrentValue('gender') as string}
        editable={true}
        editingSection={editingSection === 'basic'}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <SelectField 
        field="sexPref" 
        options={fieldOptions.sexPref} 
        label="Intéressé par" 
        currentValue={getCurrentValue('sexPref') as string}
        editable={true}
        editingSection={editingSection === 'basic'}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
      <SliderField 
        field="height" 
        label="Taille" 
        min={140} 
        max={220} 
        unit="cm" 
        currentValue={getCurrentValue('height') as number}
        editingSection={editingSection === 'basic'}
        onChange={(field, value) => updateField(field as keyof UserProfile, value)}
      />
    </SettingSection>
  );
}