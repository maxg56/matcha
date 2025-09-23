import { useState, useEffect } from 'react';
import type{ UserProfile } from '@/data/UserProfileData';
import { useUserStore } from '@/stores/userStore';

export function useEditProfile(initialUser: UserProfile) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<Partial<UserProfile>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const { updateProfile, fetchProfile } = useUserStore();

  // Mettre à jour l'utilisateur quand initialUser change (données fraîches du store)
  useEffect(() => {
    // Si on n'est pas en train d'éditer, accepter les nouvelles données
    if (!editingSection) {
      setUser(initialUser);
      // Si les données sont fraîches du store, il n'y a plus de modifications locales non sauvées
      setHasChanges(false);
    }
  }, [initialUser, editingSection]);

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    if (editingSection) {
      setTempData(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
    } else {
      setUser(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
    }
  };

  const startEditing = (section: string) => {
    setEditingSection(section);
    setTempData({});
  };

  const saveChanges = async () => {
    // Mettre à jour l'état local d'abord
    const updatedUser = { ...user, ...tempData };
    setUser(updatedUser);
    setEditingSection(null);
    setTempData({});
    
    // Auto-sauvegarder immédiatement en base de données
    try {
      const storeFormatData = convertToStoreFormat(updatedUser);
      console.log('🔄 Auto-saving section data:', storeFormatData);
      
      await updateProfile(storeFormatData);
      console.log('✅ Auto-save successful');
      
      setHasChanges(false); // Plus de modifications en attente
      
      // Force un rechargement des données depuis le serveur pour s'assurer que l'UI est à jour
      await fetchProfile();
    } catch (error) {
      console.error('❌ Failed to auto-save section:', error);
      setHasChanges(true); // Garder le flag pour retry plus tard
      
      // Afficher l'erreur à l'utilisateur
      alert(`Erreur de sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Fonction helper pour convertir vers le format store
  const convertToStoreFormat = (userData: UserProfile) => {
    return {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      birth_date: userData.birthDate,
      age: userData.age,
      height: userData.height,
      hair_color: userData.hairColor,
      skin_color: userData.skinColor,
      eye_color: userData.eyeColor,
      alcohol_consumption: userData.alcoholConsumption,
      smoking: userData.smoking,
      cannabis: userData.cannabis,
      drugs: userData.drugs,
      pets: userData.pets,
      social_activity_level: userData.socialActivityLevel,
      sport_activity: userData.sportActivity,
      education_level: userData.educationLevel,
      personal_opinion: userData.personalOpinion,
      bio: userData.bio,
      birth_city: userData.birthCity,
      current_city: userData.currentCity,
      job: userData.job,
      religion: userData.religion,
      relationship_type: userData.relationshipType,
      children_status: userData.childrenStatus,
      zodiac_sign: userData.zodiacSign,
      political_view: userData.politicalView,
      gender: userData.gender,
      sex_pref: userData.sexPref,
      tags: userData.tags
    };
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempData({});
  };

  const saveAllChanges = async () => {
    try {
      // S'il y a encore des modifications non sauvegardées
      if (hasChanges) {
        const storeFormatData = convertToStoreFormat(user);
        await updateProfile(storeFormatData);
        
        // Force un rechargement des données depuis le serveur
        await fetchProfile();
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save all changes:', error);
      throw error;
    }
  };

  const getCurrentValue = <K extends keyof UserProfile>(field: K): UserProfile[K] => {
    return editingSection && tempData[field] !== undefined ? tempData[field] as UserProfile[K] : user[field];
  };

  const toggleTag = (tag: string) => {
    const currentTags = getCurrentValue('tags');
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateField('tags', newTags);
  };

  return {
    user,
    editingSection,
    hasChanges,
    updateField,
    startEditing,
    saveChanges,
    cancelEditing,
    saveAllChanges,
    getCurrentValue,
    toggleTag
  };
}