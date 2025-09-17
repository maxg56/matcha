import { useState, useEffect } from 'react';
import { usePreferences } from '@/hooks';
import { type UpdatePreferencesRequest } from '@/types/preferences';
import { type LifestyleType } from '../constants/lifestyle';

interface UsePreferencesFormProps {
  onClose?: () => void;
}

interface UsePreferencesFormResult {
  // State
  formData: UpdatePreferencesRequest;
  hasChanges: boolean;
  saving: boolean;
  loading: boolean;
  preferences: any;

  // Handlers
  handleGenderChange: (gender: string, checked: boolean) => void;
  handleTagToggle: (tag: string, type: 'required' | 'blocked') => void;
  handleLifestyleChange: (type: LifestyleType, value: string) => void;
  handleReligionPreferenceChange: (value: string) => void;
  handleReligionToggle: (religion: string) => void;
  handleSliderChange: (field: 'age_min' | 'age_max' | 'max_distance' | 'min_fame', value: number) => void;
  handleSave: () => Promise<void>;
  handleReset: () => void;
}

export function usePreferencesForm({ onClose }: UsePreferencesFormProps = {}): UsePreferencesFormResult {
  const { preferences, loading, updatePreferences } = usePreferences();

  const [formData, setFormData] = useState<UpdatePreferencesRequest>({
    age_min: 18,
    age_max: 99,
    max_distance: 100,
    min_fame: 0,
    preferred_genders: ['man', 'woman', 'other'],
    required_tags: [],
    blocked_tags: [],

    // Lifestyle preferences
    smoking_preference: 'any',
    alcohol_preference: 'any',
    drugs_preference: 'any',
    cannabis_preference: 'any',

    // Religious preferences
    religion_preference: 'any',
    blocked_religions: []
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Synchroniser avec les préférences chargées
  useEffect(() => {
    if (preferences) {
      const newFormData = {
        age_min: preferences.age_min,
        age_max: preferences.age_max,
        max_distance: preferences.max_distance,
        min_fame: preferences.min_fame,
        preferred_genders: preferences.preferred_genders,
        required_tags: preferences.required_tags,
        blocked_tags: preferences.blocked_tags,

        // Lifestyle preferences
        smoking_preference: preferences.smoking_preference || 'any',
        alcohol_preference: preferences.alcohol_preference || 'any',
        drugs_preference: preferences.drugs_preference || 'any',
        cannabis_preference: preferences.cannabis_preference || 'any',

        // Religious preferences
        religion_preference: preferences.religion_preference || 'any',
        blocked_religions: preferences.blocked_religions || []
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [preferences]);

  // Detecter les changements
  useEffect(() => {
    if (!preferences) return;

    const hasChanged =
      formData.age_min !== preferences.age_min ||
      formData.age_max !== preferences.age_max ||
      formData.max_distance !== preferences.max_distance ||
      formData.min_fame !== preferences.min_fame ||
      JSON.stringify(formData.preferred_genders) !== JSON.stringify(preferences.preferred_genders) ||
      JSON.stringify(formData.required_tags) !== JSON.stringify(preferences.required_tags) ||
      JSON.stringify(formData.blocked_tags) !== JSON.stringify(preferences.blocked_tags) ||
      formData.smoking_preference !== (preferences.smoking_preference || 'any') ||
      formData.alcohol_preference !== (preferences.alcohol_preference || 'any') ||
      formData.drugs_preference !== (preferences.drugs_preference || 'any') ||
      formData.cannabis_preference !== (preferences.cannabis_preference || 'any') ||
      formData.religion_preference !== (preferences.religion_preference || 'any') ||
      JSON.stringify(formData.blocked_religions) !== JSON.stringify(preferences.blocked_religions || []);

    setHasChanges(hasChanged);
  }, [formData, preferences]);

  const handleSave = async () => {
    setSaving(true);
    const success = await updatePreferences(formData);
    if (success) {
      setHasChanges(false);
      // Fermer le modal après sauvegarde si on est en mode modal
      if (onClose) {
        onClose();
      }
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (preferences) {
      setFormData({
        age_min: preferences.age_min,
        age_max: preferences.age_max,
        max_distance: preferences.max_distance,
        min_fame: preferences.min_fame,
        preferred_genders: preferences.preferred_genders,
        required_tags: preferences.required_tags,
        blocked_tags: preferences.blocked_tags,

        // Lifestyle preferences
        smoking_preference: preferences.smoking_preference || 'any',
        alcohol_preference: preferences.alcohol_preference || 'any',
        drugs_preference: preferences.drugs_preference || 'any',
        cannabis_preference: preferences.cannabis_preference || 'any',

        // Religious preferences
        religion_preference: preferences.religion_preference || 'any',
        blocked_religions: preferences.blocked_religions || []
      });
      setHasChanges(false);
    }
  };

  const handleGenderChange = (gender: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferred_genders: checked
        ? [...prev.preferred_genders, gender]
        : prev.preferred_genders.filter(g => g !== gender)
    }));
  };

  const handleTagToggle = (tag: string, type: 'required' | 'blocked') => {
    setFormData(prev => {
      if (type === 'required') {
        const isRequired = prev.required_tags.includes(tag);

        return {
          ...prev,
          required_tags: isRequired
            ? prev.required_tags.filter(t => t !== tag)
            : [...prev.required_tags, tag],
          blocked_tags: isRequired ? prev.blocked_tags : prev.blocked_tags.filter(t => t !== tag)
        };
      } else {
        const isBlocked = prev.blocked_tags.includes(tag);

        return {
          ...prev,
          blocked_tags: isBlocked
            ? prev.blocked_tags.filter(t => t !== tag)
            : [...prev.blocked_tags, tag],
          required_tags: isBlocked ? prev.required_tags : prev.required_tags.filter(t => t !== tag)
        };
      }
    });
  };

  const handleLifestyleChange = (type: LifestyleType, value: string) => {
    setFormData(prev => ({
      ...prev,
      [`${type}_preference`]: value
    }));
  };

  const handleReligionPreferenceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      religion_preference: value
    }));
  };

  const handleReligionToggle = (religion: string) => {
    setFormData(prev => ({
      ...prev,
      blocked_religions: prev.blocked_religions?.includes(religion)
        ? prev.blocked_religions.filter(r => r !== religion)
        : [...(prev.blocked_religions || []), religion]
    }));
  };

  const handleSliderChange = (field: 'age_min' | 'age_max' | 'max_distance' | 'min_fame', value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    // State
    formData,
    hasChanges,
    saving,
    loading,
    preferences,

    // Handlers
    handleGenderChange,
    handleTagToggle,
    handleLifestyleChange,
    handleReligionPreferenceChange,
    handleReligionToggle,
    handleSliderChange,
    handleSave,
    handleReset
  };
}