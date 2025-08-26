import { Button } from '@/components/ui/button';
import { Save, Camera, Star } from 'lucide-react';
import { SettingSection, PhotosSection, InterestsSection } from '@/components/edit-profile';
import {
  BasicInfoSection,
  BioSection,
  AppearanceSection,
  LifestyleSection,
  ActivityEducationSection,
  PersonalInfoSection,
  LocationCareerSection
} from '@/components/edit-profile/sections';
import { mockUser } from '@/data/UserProfileData';
import { availableTags } from '@/data/EditProfileOptions';
import { useEditProfile } from '@/hooks';

export default function EditProfilePage() {
  const {
    user,
    editingSection,
    hasChanges,
    getCurrentValue,
    updateField,
    startEditing,
    saveChanges,
    cancelEditing,
    saveAllChanges,
    toggleTag
  } = useEditProfile(mockUser);

  const sectionProps = {
    editingSection,
    getCurrentValue,
    updateField,
    startEditing,
    saveChanges,
    cancelEditing
  };

  return (
    <div className="p-4 space-y-6">
      {/* Save Button */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Vous avez des modifications non sauvegardées</p>
            <Button onClick={saveAllChanges} className="gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder tout
            </Button>
          </div>
        </div>
      )}

      {/* Photos */}
      <SettingSection 
        title="Photos" 
        icon={<Camera className="h-5 w-5" />} 
        sectionKey="photos"
        editingSection={editingSection}
        onStartEditing={startEditing}
        onSaveChanges={saveChanges}
        onCancelEditing={cancelEditing}
      >
        <PhotosSection photos={user.photos} />
      </SettingSection>

      {/* Toutes les sections */}
      <BasicInfoSection user={user} {...sectionProps} />
      <BioSection {...sectionProps} />
      <AppearanceSection {...sectionProps} />
      <LifestyleSection {...sectionProps} />
      <ActivityEducationSection {...sectionProps} />
      <PersonalInfoSection {...sectionProps} />
      <LocationCareerSection {...sectionProps} />

      {/* Interests */}
      <SettingSection 
        title="Centres d'intérêt" 
        icon={<Star className="h-5 w-5" />} 
        sectionKey="interests" 
        editable
        editingSection={editingSection}
        onStartEditing={startEditing}
        onSaveChanges={saveChanges}
        onCancelEditing={cancelEditing}
      >
        <InterestsSection
          selectedTags={getCurrentValue('tags') as string[]}
          availableTags={availableTags}
          editingSection={editingSection === 'interests'}
          onToggleTag={toggleTag}
        />
      </SettingSection>
    </div>
  );
}