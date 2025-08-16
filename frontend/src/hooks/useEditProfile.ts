import { useState } from 'react';

interface UserProfile {
  // Basic info
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  age: number;
  height: number;
  
  // Physical attributes
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  
  // Lifestyle
  alcoholConsumption: string;
  smoking: string;
  cannabis: string;
  drugs: string;
  pets: string;
  
  // Social & Activity
  socialActivityLevel: string;
  sportActivity: string;
  educationLevel: string;
  
  // Personal info
  personalOpinion: string;
  bio: string;
  birthCity: string;
  currentCity: string;
  job: string;
  religion: string;
  relationshipType: string;
  childrenStatus: string;
  childrenDetails: string;
  zodiacSign: string;
  politicalView: string;
  
  // Profile settings
  gender: string;
  sexPref: string;
  
  // Tags
  tags: string[];
  
  // Profile
  avatar: string;
  photos: string[];
}

export function useEditProfile(initialUser: UserProfile) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<Partial<UserProfile>>({});
  const [hasChanges, setHasChanges] = useState(false);

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

  const saveChanges = () => {
    setUser(prev => ({ ...prev, ...tempData }));
    setEditingSection(null);
    setTempData({});
    setHasChanges(false);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempData({});
  };

  const saveAllChanges = async () => {
    try {
      console.log('Saving all profile changes:', user);
      setHasChanges(false);
      // TODO: API call to save profile
    } catch (error) {
      console.error('Error saving profile:', error);
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

  const addPhoto = (photo: string) => {
    const currentPhotos = getCurrentValue('photos');
    updateField('photos', [...currentPhotos, photo]);
  };

  const removePhoto = (photoIndex: number) => {
    const currentPhotos = getCurrentValue('photos');
    updateField('photos', currentPhotos.filter((_, index) => index !== photoIndex));
  };

  const setAvatar = (avatar: string) => {
    updateField('avatar', avatar);
  };

  return {
    user,
    editingSection,
    hasChanges,
    tempData,
    updateField,
    startEditing,
    saveChanges,
    cancelEditing,
    saveAllChanges,
    getCurrentValue,
    toggleTag,
    addPhoto,
    removePhoto,
    setAvatar,
  };
}

export type { UserProfile };
