import { useState } from 'react';
import type{ UserProfile } from '@/data/UserProfileData';

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

  const saveAllChanges = () => {
    console.log('Saving all profile changes:', user);
    setHasChanges(false);
    // TODO: API call to save profile
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