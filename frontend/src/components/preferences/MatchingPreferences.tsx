import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { usePreferencesForm } from './hooks';
import {
  AgeRangeSection,
  DistanceSection,
  FameSection,
  LifestyleSection,
  ReligionSection,
  GenderSection,
  TagsSection,
  PreferencesActions
} from './components';

interface MatchingPreferencesProps {
  onClose?: () => void;
}

export function MatchingPreferences({ onClose }: MatchingPreferencesProps = {}) {
  const {
    formData,
    hasChanges,
    saving,
    loading,
    preferences,
    handleGenderChange,
    handleTagToggle,
    handleLifestyleChange,
    handleReligionPreferenceChange,
    handleReligionToggle,
    handleSliderChange,
    handleSave,
    handleReset
  } = usePreferencesForm({ onClose });

  if (loading && !preferences) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des préférences...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={onClose ? "border-0 shadow-none" : ""}>
      {!onClose && (
        <CardHeader>
          <CardTitle>Préférences de Matching</CardTitle>
          <CardDescription>
            Personnalisez vos critères de recherche pour trouver des profils qui vous correspondent
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className={`space-y-6 ${onClose ? "p-6" : ""}`}>
        {/* Âge */}
        <AgeRangeSection
          ageMin={formData.age_min}
          ageMax={formData.age_max}
          onChange={(min, max) => {
            handleSliderChange('age_min', min);
            handleSliderChange('age_max', max);
          }}
        />

        <Separator />

        {/* Distance */}
        <DistanceSection
          maxDistance={formData.max_distance}
          onChange={(distance) => handleSliderChange('max_distance', distance)}
        />

        <Separator />

        {/* Popularité minimale */}
        <FameSection
          minFame={formData.min_fame}
          onChange={(fame) => handleSliderChange('min_fame', fame)}
        />

        <Separator />

        {/* Préférences de Mode de Vie */}
        <LifestyleSection
          smokingPreference={formData.smoking_preference || 'any'}
          alcoholPreference={formData.alcohol_preference || 'any'}
          drugsPreference={formData.drugs_preference || 'any'}
          cannabisPreference={formData.cannabis_preference || 'any'}
          onChange={handleLifestyleChange}
        />

        <Separator />

        {/* Préférences Religieuses */}
        <ReligionSection
          religionPreference={formData.religion_preference || 'any'}
          blockedReligions={formData.blocked_religions || []}
          onPreferenceChange={handleReligionPreferenceChange}
          onReligionToggle={handleReligionToggle}
        />

        <Separator />

        {/* Genres préférés */}
        <GenderSection
          selectedGenders={formData.preferred_genders}
          onChange={handleGenderChange}
        />

        <Separator />

        {/* Tags */}
        <TagsSection
          requiredTags={formData.required_tags}
          blockedTags={formData.blocked_tags}
          onToggle={handleTagToggle}
        />

        <Separator />

        {/* Actions */}
        <PreferencesActions
          hasChanges={hasChanges}
          saving={saving}
          onSave={handleSave}
          onReset={handleReset}
          onClose={onClose}
        />
      </CardContent>
    </Card>
  );
}