import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Heart,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  MapPin,
  Ruler,
  Palette,
  GraduationCap,
  Briefcase,
  Church,
  Baby,
  Wine,
  Activity,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RegistrationData {
  // Étape 1: Compte
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Étape 2: Infos de base
  birthDate: string;
  gender: string;
  sexPref: string;
  height: number;
  
  // Étape 3: Apparence
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  
  // Étape 4: Style de vie
  alcoholConsumption: string;
  smoking: string;
  cannabis: string;
  drugs: string;
  pets: string;
  
  // Étape 5: Activité & Éducation
  socialActivityLevel: string;
  sportActivity: string;
  educationLevel: string;
  
  // Étape 6: Infos personnelles
  bio: string;
  birthCity: string;
  currentCity: string;
  job: string;
  religion: string;
  relationshipType: string;
  childrenStatus: string;
  politicalView: string;
  
  // Étape 7: Centres d'intérêt
  tags: string[];
}

const defaultData: RegistrationData = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  gender: '',
  sexPref: '',
  height: 170,
  hairColor: '',
  eyeColor: '',
  skinColor: '',
  alcoholConsumption: '',
  smoking: '',
  cannabis: '',
  drugs: '',
  pets: '',
  socialActivityLevel: '',
  sportActivity: '',
  educationLevel: '',
  bio: '',
  birthCity: '',
  currentCity: '',
  job: '',
  religion: '',
  relationshipType: '',
  childrenStatus: '',
  politicalView: '',
  tags: []
};

const fieldOptions = {
  gender: [
    { value: 'woman', label: 'Femme', icon: '👩' },
    { value: 'man', label: 'Homme', icon: '👨' },
    { value: 'other', label: 'Autre', icon: '🏳️‍⚧️' }
  ],
  sexPref: [
    { value: 'woman', label: 'Femmes', icon: '👩' },
    { value: 'man', label: 'Hommes', icon: '👨' },
    { value: 'both', label: 'Les deux', icon: '👫' },
    { value: 'other', label: 'Autre', icon: '🏳️‍🌈' }
  ],
  hairColor: [
    { value: 'black', label: 'Noirs', icon: '⚫' },
    { value: 'brown', label: 'Bruns', icon: '🤎' },
    { value: 'blonde', label: 'Blonds', icon: '🟡' },
    { value: 'red', label: 'Roux', icon: '🔴' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'white', label: 'Blancs', icon: '⚪' }
  ],
  eyeColor: [
    { value: 'brown', label: 'Marron', icon: '🤎' },
    { value: 'blue', label: 'Bleus', icon: '🔵' },
    { value: 'green', label: 'Verts', icon: '🟢' },
    { value: 'hazel', label: 'Noisette', icon: '🟤' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'black', label: 'Noirs', icon: '⚫' }
  ],
  skinColor: [
    { value: 'white', label: 'Blanche', icon: '🤍' },
    { value: 'black', label: 'Noire', icon: '🖤' },
    { value: 'brown', label: 'Brune', icon: '🤎' },
    { value: 'yellow', label: 'Jaune', icon: '💛' },
    { value: 'olive', label: 'Olive', icon: '🫒' }
  ],
  lifestyle: [
    { value: 'yes', label: 'Oui', icon: '✅' },
    { value: 'sometimes', label: 'Parfois', icon: '🔶' },
    { value: 'no', label: 'Non', icon: '❌' }
  ],
  pets: [
    { value: 'yes', label: 'Oui', icon: '🐕' },
    { value: 'no', label: 'Non', icon: '🚫' }
  ],
  activityLevel: [
    { value: 'low', label: 'Faible', icon: '🛋️' },
    { value: 'medium', label: 'Modéré', icon: '🚶' },
    { value: 'high', label: 'Élevé', icon: '🏃' }
  ],
  educationLevel: [
    { value: 'high_school', label: 'Lycée', icon: '🎓' },
    { value: 'bachelor', label: 'Licence', icon: '📜' },
    { value: 'master', label: 'Master', icon: '🏆' },
    { value: 'doctorate', label: 'Doctorat', icon: '👨‍🎓' }
  ],
  religion: [
    { value: 'christianity', label: 'Christianisme', icon: '✝️' },
    { value: 'islam', label: 'Islam', icon: '☪️' },
    { value: 'hinduism', label: 'Hindouisme', icon: '🕉️' },
    { value: 'buddhism', label: 'Bouddhisme', icon: '☸️' },
    { value: 'atheism', label: 'Athéisme', icon: '🔬' },
    { value: 'other', label: 'Autre', icon: '❓' }
  ],
  relationshipType: [
    { value: 'friendship', label: 'Amitié', icon: '👫' },
    { value: 'short_term', label: 'Court terme', icon: '💕' },
    { value: 'long_term', label: 'Long terme', icon: '💖' },
    { value: 'life', label: 'Vie', icon: '💍' }
  ],
  childrenStatus: [
    { value: 'yes', label: 'Avec enfants', icon: '👶' },
    { value: 'no', label: 'Sans enfants', icon: '🚫' },
    { value: 'other', label: 'Compliqué', icon: '❓' }
  ],
  politicalView: [
    { value: 'left', label: 'Gauche', icon: '⬅️' },
    { value: 'center', label: 'Centre', icon: '⚖️' },
    { value: 'right', label: 'Droite', icon: '➡️' },
    { value: 'apolitical', label: 'Apolitique', icon: '🤷' }
  ]
};

const availableTags = [
  '🌍 Voyage', '🍳 Cuisine', '🚴 Sport', '🏋️ Fitness',
  '🎮 Jeux vidéo', '📚 Lecture', '🎶 Musique', '🎨 Art & Créativité',
  '🐶 Amoureux des animaux', '🌱 Écologie & nature', '🎥 Cinéma & séries',
  '💃 Danse', '📷 Photographie', '🚀 Tech & innovation',
  '🍷 Gastronomie & vin', '👨‍💻 Code avec vim', '⛰️ Randonnée & plein air'
];

const steps = [
  { id: 1, title: 'Compte', icon: User },
  { id: 2, title: 'Infos de base', icon: Calendar },
  { id: 3, title: 'Apparence', icon: Palette },
  { id: 4, title: 'Style de vie', icon: Wine },
  { id: 5, title: 'Activité', icon: Activity },
  { id: 6, title: 'Personnel', icon: Heart },
  { id: 7, title: 'Intérêts', icon: Star }
];

export default function InscriptionPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>(defaultData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    updateField('tags', newTags);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.username) newErrors.username = 'Pseudo requis';
        if (!formData.firstName) newErrors.firstName = 'Prénom requis';
        if (!formData.lastName) newErrors.lastName = 'Nom requis';
        if (!formData.email) newErrors.email = 'Email requis';
        if (!formData.password) newErrors.password = 'Mot de passe requis';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        break;
      case 2:
        if (!formData.birthDate) newErrors.birthDate = 'Date de naissance requise';
        if (!formData.gender) newErrors.gender = 'Genre requis';
        if (!formData.sexPref) newErrors.sexPref = 'Préférence requise';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canContinue = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.username && formData.firstName && formData.lastName && 
                 formData.email && formData.password && formData.confirmPassword &&
                 formData.password === formData.confirmPassword);
      case 2:
        return !!(formData.birthDate && formData.gender && formData.sexPref);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: API call
      console.log('Registration data:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/discover');
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const SelectField = ({ 
    field, 
    options, 
    label,
    columns = 2
  }: { 
    field: keyof RegistrationData; 
    options: Array<{value: string, label: string, icon: string}>; 
    label: string;
    columns?: number;
  }) => {
    const currentValue = formData[field] as string;
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </label>
        <div className={cn(
          "grid gap-2",
          columns === 2 ? "grid-cols-2" : "grid-cols-3"
        )}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField(field, option.value as any)}
              className={cn(
                "p-3 rounded-xl border text-sm font-medium transition-colors",
                "flex items-center gap-2 justify-center",
                currentValue === option.value
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                  : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              )}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pseudo
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateField('username', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="@votre_pseudo"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre prénom"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre nom"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="votre.email@exemple.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField('birthDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
            </div>

            <SelectField field="gender" options={fieldOptions.gender} label="Genre" />
            <SelectField field="sexPref" options={fieldOptions.sexPref} label="Intéressé(e) par" />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Taille: {formData.height} cm
              </label>
              <Slider
                value={[formData.height]}
                min={140}
                max={220}
                step={1}
                onValueChange={(value) => updateField('height', value[0])}
                className="mb-4"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <SelectField field="hairColor" options={fieldOptions.hairColor} label="Couleur des cheveux" columns={3} />
            <SelectField field="eyeColor" options={fieldOptions.eyeColor} label="Couleur des yeux" columns={3} />
            <SelectField field="skinColor" options={fieldOptions.skinColor} label="Couleur de peau" columns={3} />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <SelectField field="alcoholConsumption" options={fieldOptions.lifestyle} label="Consommation d'alcool" columns={3} />
            <SelectField field="smoking" options={fieldOptions.lifestyle} label="Tabac" columns={3} />
            <SelectField field="cannabis" options={fieldOptions.lifestyle} label="Cannabis" columns={3} />
            <SelectField field="drugs" options={fieldOptions.lifestyle} label="Autres drogues" columns={3} />
            <SelectField field="pets" options={fieldOptions.pets} label="Animaux de compagnie" />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <SelectField field="socialActivityLevel" options={fieldOptions.activityLevel} label="Niveau d'activité sociale" columns={3} />
            <SelectField field="sportActivity" options={fieldOptions.activityLevel} label="Activité sportive" columns={3} />
            <SelectField field="educationLevel" options={fieldOptions.educationLevel} label="Niveau d'éducation" />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Parlez-nous de vous..."
                maxLength={400}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/400</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville de naissance
                </label>
                <input
                  type="text"
                  value={formData.birthCity}
                  onChange={(e) => updateField('birthCity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre ville de naissance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville actuelle
                </label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => updateField('currentCity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre ville actuelle"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profession
              </label>
              <input
                type="text"
                value={formData.job}
                onChange={(e) => updateField('job', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Votre profession"
              />
            </div>

            <SelectField field="religion" options={fieldOptions.religion} label="Religion" columns={3} />
            <SelectField field="relationshipType" options={fieldOptions.relationshipType} label="Type de relation recherchée" />
            <SelectField field="childrenStatus" options={fieldOptions.childrenStatus} label="Situation avec les enfants" columns={3} />
            <SelectField field="politicalView" options={fieldOptions.politicalView} label="Orientation politique" />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Centres d'intérêt
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Sélectionnez vos centres d'intérêt pour que les autres puissent mieux vous connaître
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                      formData.tags.includes(tag)
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.tags.length} centre(s) d'intérêt sélectionné(s)
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-center pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inscription</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Créez votre profil Matcha</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Étape {currentStep} sur {steps.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    isCompleted 
                      ? "bg-green-500 text-white" 
                      : isCurrent 
                        ? "bg-purple-500 text-white" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-16">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {currentStep === 1 && "Créez votre compte avec vos informations de base"}
                {currentStep === 2 && "Renseignez vos informations personnelles"}
                {currentStep === 3 && "Décrivez votre apparence physique"}
                {currentStep === 4 && "Partagez votre style de vie"}
                {currentStep === 5 && "Indiquez votre niveau d'activité et d'éducation"}
                {currentStep === 6 && "Complétez votre profil personnel"}
                {currentStep === 7 && "Sélectionnez vos centres d'intérêt"}
              </p>
            </div>

            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? () => navigate('/login') : handlePrev}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Retour' : 'Précédent'}
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canContinue(currentStep)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}