import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { usePreferences } from '@/hooks';
import { type UpdatePreferencesRequest } from '@/types/preferences';

const AVAILABLE_GENDERS = [
  { value: 'man', label: 'Homme' },
  { value: 'woman', label: 'Femme' },
  { value: 'other', label: 'Autre' }
];

const COMMON_TAGS = [
  '🌍 Voyage', '🍳 Cuisine', '🚴🏻‍♂️ Sport', '🏋️ Fitness', '🎮 Jeux vidéo',
  '📚 Lecture', '🎶 Musique', '🎨 Art & Créativité', '🐶 Amoureux des animaux',
  '🌱 Écologie & nature', '🎥 Cinéma & séries', '💃 Danse', '📷 Photographie',
  '🚀 Tech & innovation', '🍷 Gastronomie & vin', '👨🏻‍💻 Code avec vim',
  '⛰️ Randonnée & plein air'
];

const LIFESTYLE_OPTIONS = {
  smoking: [
    { value: 'any', label: 'Peu importe' },
    { value: 'smoker', label: 'Fumeur' },
    { value: 'non_smoker', label: 'Non-fumeur' }
  ],
  alcohol: [
    { value: 'any', label: 'Peu importe' },
    { value: 'drinker', label: 'Boit de l\'alcool' },
    { value: 'non_drinker', label: 'Ne boit pas' }
  ],
  drugs: [
    { value: 'any', label: 'Peu importe' },
    { value: 'user', label: 'Consomme' },
    { value: 'non_user', label: 'Ne consomme pas' }
  ],
  cannabis: [
    { value: 'any', label: 'Peu importe' },
    { value: 'user', label: 'Consomme' },
    { value: 'non_user', label: 'Ne consomme pas' }
  ]
};

const RELIGION_OPTIONS = [
  { value: 'any', label: 'Peu importe' },
  { value: 'same', label: 'Même religion' },
  { value: 'different', label: 'Religion différente' }
];

const COMMON_RELIGIONS = [
  'Christianity', 'Islam', 'Judaism', 'Buddhism', 'Hinduism', 'Atheism', 'Agnosticism', 'Sikhism', 'Other'
];

interface MatchingPreferencesProps {
  onClose?: () => void;
}

export function MatchingPreferences({ onClose }: MatchingPreferencesProps = {}) {
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

  const handleLifestyleChange = (type: 'smoking' | 'alcohol' | 'drugs' | 'cannabis', value: string) => {
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
        <div className="space-y-3">
          <Label className="text-base font-medium">Tranche d'âge</Label>
          <div className="px-2">
            <Slider
              value={[formData.age_min, formData.age_max]}
              onValueChange={([min, max]) => setFormData(prev => ({ ...prev, age_min: min, age_max: max }))}
              min={18}
              max={99}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{formData.age_min} ans</span>
              <span>{formData.age_max} ans</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Distance */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Distance maximale</Label>
          <div className="px-2">
            <Slider
              value={[formData.max_distance]}
              onValueChange={([distance]) => setFormData(prev => ({ ...prev, max_distance: distance }))}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground mt-1">
              {formData.max_distance} km
            </div>
          </div>
        </div>

        <Separator />

        {/* Popularité minimale */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Popularité minimale</Label>
          <div className="px-2">
            <Slider
              value={[formData.min_fame]}
              onValueChange={([fame]) => setFormData(prev => ({ ...prev, min_fame: fame }))}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground mt-1">
              {formData.min_fame} points
            </div>
          </div>
        </div>

        <Separator />

        {/* Préférences de Mode de Vie */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Préférences de Mode de Vie</Label>
          <p className="text-sm text-muted-foreground">
            Filtrez les profils selon leurs habitudes de vie
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tabac */}
            <div className="space-y-2">
              <Label htmlFor="smoking">Tabac</Label>
              <Select
                value={formData.smoking_preference}
                onValueChange={(value) => handleLifestyleChange('smoking', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {LIFESTYLE_OPTIONS.smoking.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Alcool */}
            <div className="space-y-2">
              <Label htmlFor="alcohol">Alcool</Label>
              <Select
                value={formData.alcohol_preference}
                onValueChange={(value) => handleLifestyleChange('alcohol', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {LIFESTYLE_OPTIONS.alcohol.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Drogues */}
            <div className="space-y-2">
              <Label htmlFor="drugs">Drogues</Label>
              <Select
                value={formData.drugs_preference}
                onValueChange={(value) => handleLifestyleChange('drugs', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {LIFESTYLE_OPTIONS.drugs.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cannabis */}
            <div className="space-y-2">
              <Label htmlFor="cannabis">Cannabis</Label>
              <Select
                value={formData.cannabis_preference}
                onValueChange={(value) => handleLifestyleChange('cannabis', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {LIFESTYLE_OPTIONS.cannabis.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Préférences Religieuses */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Préférences Religieuses</Label>
          <p className="text-sm text-muted-foreground">
            Définissez vos préférences en matière de religion
          </p>

          <div className="space-y-4">
            {/* Type de préférence religieuse */}
            <div className="space-y-2">
              <Label htmlFor="religion">Préférence religieuse</Label>
              <Select
                value={formData.religion_preference}
                onValueChange={handleReligionPreferenceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {RELIGION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Religions bloquées */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Religions à éviter</Label>
              <p className="text-xs text-muted-foreground">
                Sélectionnez les religions que vous souhaitez éviter
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_RELIGIONS.map(religion => {
                  const isBlocked = formData.blocked_religions?.includes(religion);

                  return (
                    <Badge
                      key={religion}
                      variant={isBlocked ? "destructive" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => handleReligionToggle(religion)}
                    >
                      {religion}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Genres préférés */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Genres préférés</Label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_GENDERS.map(gender => (
              <div key={gender.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`gender-${gender.value}`}
                  checked={formData.preferred_genders.includes(gender.value)}
                  onCheckedChange={(checked) => handleGenderChange(gender.value, checked as boolean)}
                />
                <Label htmlFor={`gender-${gender.value}`}>{gender.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tags requis */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Centres d'intérêt requis</Label>
          <p className="text-sm text-muted-foreground">
            Sélectionnez les centres d'intérêt que les profils doivent avoir
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map(tag => {
              const isRequired = formData.required_tags.includes(tag);
              const isBlocked = formData.blocked_tags.includes(tag);

              return (
                <Badge
                  key={tag}
                  variant={isRequired ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    isBlocked ? 'bg-destructive text-destructive-foreground' : ''
                  }`}
                  onClick={() => handleTagToggle(tag, 'required')}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Tags bloqués */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Centres d'intérêt à éviter</Label>
          <p className="text-sm text-muted-foreground">
            Sélectionnez les centres d'intérêt que vous souhaitez éviter
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map(tag => {
              const isRequired = formData.required_tags.includes(tag);
              const isBlocked = formData.blocked_tags.includes(tag);

              return (
                <Badge
                  key={tag}
                  variant={isBlocked ? "destructive" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    isRequired ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => handleTagToggle(tag, 'blocked')}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className={`flex ${onClose ? 'justify-between' : 'justify-between'} gap-3`}>
          {onClose ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Fermer
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges || saving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Annuler
              </Button>

              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}