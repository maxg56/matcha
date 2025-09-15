import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Camera, Star, Loader2 } from 'lucide-react';
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
import { availableTags } from '@/data/EditProfileOptions';
import { useEditProfile } from '@/hooks';
import { useUserStore } from '@/stores/userStore';
import type { UserProfile as EditUserProfile } from '@/data/UserProfileData';
import type { UserProfile as StoreUserProfile } from '@/stores/userStore';

// Fonction pour convertir les données du store vers le format d'édition
const mapStoreProfileToEditProfile = (storeProfile: StoreUserProfile): EditUserProfile => {
  return {
    username: storeProfile.username || '',
    firstName: storeProfile.first_name || '',
    lastName: storeProfile.last_name || '',
    email: storeProfile.email || '',
    birthDate: storeProfile.birth_date || '',
    age: storeProfile.age || 0,
    height: storeProfile.height || 0,
    hairColor: storeProfile.hair_color || '',
    skinColor: storeProfile.skin_color || '',
    eyeColor: storeProfile.eye_color || '',
    alcoholConsumption: storeProfile.alcohol_consumption || '',
    smoking: storeProfile.smoking || '',
    cannabis: storeProfile.cannabis || '',
    drugs: storeProfile.drugs || '',
    pets: storeProfile.pets || '',
    socialActivityLevel: storeProfile.social_activity_level || '',
    sportActivity: storeProfile.sport_activity || '',
    educationLevel: storeProfile.education_level || '',
    personalOpinion: storeProfile.personal_opinion || '',
    bio: storeProfile.bio || '',
    birthCity: storeProfile.birth_city || '',
    currentCity: storeProfile.current_city || '',
    job: storeProfile.job || '',
    religion: storeProfile.religion || '',
    relationshipType: storeProfile.relationship_type || '',
    childrenStatus: storeProfile.children_status || '',
    childrenDetails: '', // Ce champ n'existe pas dans le store
    zodiacSign: storeProfile.zodiac_sign || '',
    politicalView: storeProfile.political_view || '',
    gender: storeProfile.gender || '',
    sexPref: storeProfile.sex_pref || '',
    tags: storeProfile.tags || [],
    avatar: storeProfile.images?.[0] || '', // Première image comme avatar
    photos: storeProfile.images || []
  };
};

export default function EditProfilePage() {
  const { profile, isLoading, error, fetchProfile } = useUserStore();

  // Créer un profil par défaut stable
  const defaultProfile: EditUserProfile = useMemo(() => ({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    age: 0,
    height: 0,
    hairColor: '',
    skinColor: '',
    eyeColor: '',
    alcoholConsumption: '',
    smoking: '',
    cannabis: '',
    drugs: '',
    pets: '',
    socialActivityLevel: '',
    sportActivity: '',
    educationLevel: '',
    personalOpinion: '',
    bio: '',
    birthCity: '',
    currentCity: '',
    job: '',
    religion: '',
    relationshipType: '',
    childrenStatus: '',
    childrenDetails: '',
    zodiacSign: '',
    politicalView: '',
    gender: '',
    sexPref: '',
    tags: [],
    avatar: '',
    photos: []
  }), []);

  // Convertir le profil du store vers le format d'édition
  const editProfile = useMemo(() => {
    return profile ? mapStoreProfileToEditProfile(profile) : defaultProfile;
  }, [profile, defaultProfile]);

  // Toujours appeler useEditProfile avec une valeur stable
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
  } = useEditProfile(editProfile);

  useEffect(() => {
    // Récupérer le profil au chargement de la page si pas déjà chargé
    if (!profile && !isLoading) {
      fetchProfile();
    }
  }, [profile, isLoading, fetchProfile]);

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">Erreur lors du chargement du profil: {error}</p>
          <Button onClick={() => fetchProfile()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  // Ne pas rendre le contenu si pas de profil
  if (!profile) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Aucun profil trouvé</p>
      </div>
    );
  }

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