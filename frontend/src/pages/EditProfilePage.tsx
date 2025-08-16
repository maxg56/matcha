import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Calendar,
  Edit3,
  Camera,
  Save,
  X,
  Ruler,
  Palette,
  GraduationCap,
  Briefcase,
  Church,
  Baby,
  Wine,
  Cigarette,
  PillBottle,
  Dog,
  Activity,
  Users,
  Heart,
  MapPin,
  Star,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const mockUser: UserProfile = {
  username: 'alex_martin',
  firstName: 'Alex',
  lastName: 'Martin',
  email: 'alex.martin@example.com',
  birthDate: '1997-03-15',
  age: 26,
  height: 175,
  hairColor: 'brown',
  skinColor: 'white',
  eyeColor: 'blue',
  alcoholConsumption: 'sometimes',
  smoking: 'no',
  cannabis: 'no',
  drugs: 'no',
  pets: 'yes',
  socialActivityLevel: 'medium',
  sportActivity: 'high',
  educationLevel: 'master',
  personalOpinion: 'Optimiste et toujours prêt pour de nouvelles aventures',
  bio: 'Passionné de tech et de sport, j\'adore découvrir de nouveaux endroits et rencontrer des gens interessants.',
  birthCity: 'Lyon',
  currentCity: 'Paris',
  job: 'Développeur Full Stack',
  religion: 'atheism',
  relationshipType: 'long_term',
  childrenStatus: 'no',
  childrenDetails: '',
  zodiacSign: 'Poissons',
  politicalView: 'center',
  gender: 'man',
  sexPref: 'woman',
  tags: ['🌍 Voyage', '🍳 Cuisine', '🚴 Sport', '🎮 Jeux vidéo', '📚 Lecture'],
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop'
  ]
};

const fieldOptions = {
  hairColor: [
    { value: 'black', label: 'Noirs', icon: '⚫' },
    { value: 'brown', label: 'Bruns', icon: '🤎' },
    { value: 'blonde', label: 'Blonds', icon: '🟡' },
    { value: 'red', label: 'Roux', icon: '🔴' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'white', label: 'Blancs', icon: '⚪' }
  ],
  skinColor: [
    { value: 'white', label: 'Blanche', icon: '🤍' },
    { value: 'black', label: 'Noire', icon: '🖤' },
    { value: 'brown', label: 'Brune', icon: '🤎' },
    { value: 'yellow', label: 'Jaune', icon: '💛' },
    { value: 'olive', label: 'Olive', icon: '🫒' }
  ],
  eyeColor: [
    { value: 'brown', label: 'Marron', icon: '🤎' },
    { value: 'blue', label: 'Bleus', icon: '🔵' },
    { value: 'green', label: 'Verts', icon: '🟢' },
    { value: 'hazel', label: 'Noisette', icon: '🟤' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'black', label: 'Noirs', icon: '⚫' }
  ],
  alcoholConsumption: [
    { value: 'yes', label: 'Oui', icon: '🍷' },
    { value: 'sometimes', label: 'Parfois', icon: '🥂' },
    { value: 'no', label: 'Non', icon: '🚫' }
  ],
  smoking: [
    { value: 'yes', label: 'Oui', icon: '🚬' },
    { value: 'sometimes', label: 'Parfois', icon: '💨' },
    { value: 'no', label: 'Non', icon: '🚭' }
  ],
  cannabis: [
    { value: 'yes', label: 'Oui', icon: '🌿' },
    { value: 'sometimes', label: 'Parfois', icon: '🍃' },
    { value: 'no', label: 'Non', icon: '🚫' }
  ],
  drugs: [
    { value: 'yes', label: 'Oui', icon: '💊' },
    { value: 'sometimes', label: 'Parfois', icon: '⚗️' },
    { value: 'no', label: 'Non', icon: '🚫' }
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
  ],
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
  ]
};

const availableTags = [
  '🌍 Voyage', '🍳 Cuisine', '🚴 Sport', '🏋️ Fitness',
  '🎮 Jeux vidéo', '📚 Lecture', '🎶 Musique', '🎨 Art & Créativité',
  '🐶 Amoureux des animaux', '🌱 Écologie & nature', '🎥 Cinéma & séries',
  '💃 Danse', '📷 Photographie', '🚀 Tech & innovation',
  '🍷 Gastronomie & vin', '👨‍💻 Code avec vim', '⛰️ Randonnée & plein air'
];

export default function EditProfilePage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
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

  const SettingSection = ({ 
    title, 
    icon, 
    children, 
    sectionKey,
    editable = true
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    sectionKey: string;
    editable?: boolean;
  }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {editable && (
          <div className="flex items-center gap-2">
            {editingSection === sectionKey ? (
              <>
                <Button variant="outline" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauver
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => startEditing(sectionKey)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );

  const SelectField = ({ 
    field, 
    options, 
    label,
    editable = true
  }: { 
    field: keyof UserProfile; 
    options: Array<{value: string, label: string, icon: string}>; 
    label: string;
    editable?: boolean;
  }) => {
    const currentValue = getCurrentValue(field) as string;
    const currentOption = options.find(opt => opt.value === currentValue);
    
    return (
      <div className="p-4 border-b border-border last:border-b-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-foreground">{label}</h3>
          {!editable && currentOption && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{currentOption.icon}</span>
              <span>{currentOption.label}</span>
            </div>
          )}
        </div>
        
        {editable && editingSection && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => updateField(field, option.value as any)}
                className={cn(
                  "p-2 rounded-lg border text-xs font-medium transition-colors",
                  "flex items-center gap-1 justify-center",
                  currentValue === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-accent"
                )}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {(!editable || !editingSection) && currentOption && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentOption.icon}</span>
            <span className="text-foreground">{currentOption.label}</span>
          </div>
        )}
      </div>
    );
  };

  const TextArea = ({ 
    field, 
    label, 
    placeholder,
    maxLength
  }: { 
    field: keyof UserProfile; 
    label: string; 
    placeholder: string;
    maxLength?: number;
  }) => {
    const currentValue = getCurrentValue(field) as string;
    
    return (
      <div className="p-4 border-b border-border last:border-b-0">
        <h3 className="font-medium text-foreground mb-2">{label}</h3>
        {editingSection ? (
          <textarea
            value={currentValue || ''}
            onChange={(e) => updateField(field, e.target.value as any)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        ) : (
          <p className="text-foreground">
            {currentValue || <span className="text-muted-foreground italic">{placeholder}</span>}
          </p>
        )}
        {maxLength && editingSection && (
          <p className="text-xs text-muted-foreground mt-1">
            {(currentValue || '').length} / {maxLength}
          </p>
        )}
      </div>
    );
  };

  const SliderField = ({ 
    field, 
    label, 
    min, 
    max, 
    unit,
    step = 1
  }: { 
    field: keyof UserProfile; 
    label: string; 
    min: number; 
    max: number; 
    unit: string;
    step?: number;
  }) => {
    const currentValue = getCurrentValue(field) as number;
    
    return (
      <div className="p-4 border-b border-border last:border-b-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">{label}</h3>
          <span className="text-sm text-muted-foreground">
            {currentValue} {unit}
          </span>
        </div>
        {editingSection ? (
          <Slider
            value={[currentValue]}
            min={min}
            max={max}
            step={step}
            onValueChange={(value) => updateField(field, value[0] as any)}
          />
        ) : (
          <div className="text-foreground">{currentValue} {unit}</div>
        )}
      </div>
    );
  };

  const TextInput = ({ 
    field, 
    label, 
    placeholder,
    type = "text"
  }: { 
    field: keyof UserProfile; 
    label: string; 
    placeholder: string;
    type?: string;
  }) => {
    const currentValue = getCurrentValue(field) as string;
    
    return (
      <div className="p-4 border-b border-border last:border-b-0">
        <h3 className="font-medium text-foreground mb-2">{label}</h3>
        {editingSection ? (
          <input
            type={type}
            value={currentValue || ''}
            onChange={(e) => updateField(field, e.target.value as any)}
            placeholder={placeholder}
            className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ) : (
          <p className="text-foreground">
            {currentValue || <span className="text-muted-foreground italic">{placeholder}</span>}
          </p>
        )}
      </div>
    );
  };

  return (
    <ResponsiveLayout
      title="Modifier mon profil"
      showNavigation={true}
      maxWidth="lg"
    >
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
        <SettingSection title="Photos" icon={<Camera className="h-5 w-5" />} sectionKey="photos">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {user.photos.map((photo, index) => (
                <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="text-xs">Principal</Badge>
                    </div>
                  )}
                  <button className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button className="aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center">
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Ajouter</p>
                </div>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Ajoutez au moins 2 photos. La première sera votre photo principale.</p>
          </div>
        </SettingSection>

        {/* Basic Information */}
        <SettingSection title="Informations de Base" icon={<User className="h-5 w-5" />} sectionKey="basic" editable>
          <TextInput field="firstName" label="Prénom" placeholder="Votre prénom" />
          <TextInput field="lastName" label="Nom" placeholder="Votre nom" />
          <TextInput field="username" label="Nom d'utilisateur" placeholder="@username" />
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground mb-2">Date de naissance</h3>
            <p className="text-foreground">{new Date(user.birthDate).toLocaleDateString('fr-FR')} ({user.age} ans)</p>
            <p className="text-xs text-muted-foreground mt-1">L'âge ne peut pas être modifié</p>
          </div>
          <SelectField field="gender" options={fieldOptions.gender} label="Genre" editable={editingSection === 'basic'} />
          <SelectField field="sexPref" options={fieldOptions.sexPref} label="Intéressé par" editable={editingSection === 'basic'} />
          <SliderField field="height" label="Taille" min={140} max={220} unit="cm" />
        </SettingSection>

        {/* Bio */}
        <SettingSection title="À propos de moi" icon={<Heart className="h-5 w-5" />} sectionKey="bio" editable>
          <TextArea field="bio" label="Bio" placeholder="Parlez-nous de vous..." maxLength={400} />
          <TextArea field="personalOpinion" label="Ma vision de la vie" placeholder="Votre philosophie, vos valeurs..." />
        </SettingSection>

        {/* Physical Appearance */}
        <SettingSection title="Apparence Physique" icon={<Palette className="h-5 w-5" />} sectionKey="appearance" editable>
          <SelectField field="hairColor" options={fieldOptions.hairColor} label="Couleur des cheveux" editable={editingSection === 'appearance'} />
          <SelectField field="eyeColor" options={fieldOptions.eyeColor} label="Couleur des yeux" editable={editingSection === 'appearance'} />
          <SelectField field="skinColor" options={fieldOptions.skinColor} label="Couleur de peau" editable={editingSection === 'appearance'} />
        </SettingSection>

        {/* Lifestyle */}
        <SettingSection title="Style de Vie" icon={<Wine className="h-5 w-5" />} sectionKey="lifestyle" editable>
          <SelectField field="alcoholConsumption" options={fieldOptions.alcoholConsumption} label="Consommation d'alcool" editable={editingSection === 'lifestyle'} />
          <SelectField field="smoking" options={fieldOptions.smoking} label="Tabac" editable={editingSection === 'lifestyle'} />
          <SelectField field="cannabis" options={fieldOptions.cannabis} label="Cannabis" editable={editingSection === 'lifestyle'} />
          <SelectField field="drugs" options={fieldOptions.drugs} label="Autres drogues" editable={editingSection === 'lifestyle'} />
          <SelectField field="pets" options={fieldOptions.pets} label="Animaux de compagnie" editable={editingSection === 'lifestyle'} />
        </SettingSection>

        {/* Activity & Education */}
        <SettingSection title="Activité & Éducation" icon={<Activity className="h-5 w-5" />} sectionKey="activity" editable>
          <SelectField field="socialActivityLevel" options={fieldOptions.activityLevel} label="Niveau d'activité sociale" editable={editingSection === 'activity'} />
          <SelectField field="sportActivity" options={fieldOptions.activityLevel} label="Activité sportive" editable={editingSection === 'activity'} />
          <SelectField field="educationLevel" options={fieldOptions.educationLevel} label="Niveau d'éducation" editable={editingSection === 'activity'} />
        </SettingSection>

        {/* Personal Information */}
        <SettingSection title="Informations Personnelles" icon={<Church className="h-5 w-5" />} sectionKey="personal" editable>
          <SelectField field="religion" options={fieldOptions.religion} label="Religion" editable={editingSection === 'personal'} />
          <SelectField field="relationshipType" options={fieldOptions.relationshipType} label="Type de relation recherchée" editable={editingSection === 'personal'} />
          <SelectField field="childrenStatus" options={fieldOptions.childrenStatus} label="Situation avec les enfants" editable={editingSection === 'personal'} />
          <SelectField field="politicalView" options={fieldOptions.politicalView} label="Orientation politique" editable={editingSection === 'personal'} />
          <TextInput field="zodiacSign" label="Signe du zodiaque" placeholder="Votre signe astrologique" />
        </SettingSection>

        {/* Location & Career */}
        <SettingSection title="Localisation & Carrière" icon={<MapPin className="h-5 w-5" />} sectionKey="location" editable>
          <TextInput field="birthCity" label="Ville de naissance" placeholder="Où êtes-vous né(e) ?" />
          <TextInput field="currentCity" label="Ville actuelle" placeholder="Où habitez-vous ?" />
          <TextInput field="job" label="Profession" placeholder="Votre métier" />
        </SettingSection>

        {/* Tags/Interests */}
        <SettingSection title="Centres d'intérêt" icon={<Star className="h-5 w-5" />} sectionKey="interests" editable>
          <div className="p-4">
            <h3 className="font-medium text-foreground mb-3">Vos centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {user.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer hover:bg-destructive"
                  onClick={() => editingSection === 'interests' && toggleTag(tag)}
                >
                  {tag}
                  {editingSection === 'interests' && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            
            {editingSection === 'interests' && (
              <>
                <h4 className="font-medium text-foreground mb-2">Ajouter des centres d'intérêt</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter(tag => !user.tags.includes(tag))
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-accent transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        </SettingSection>
      </div>
    </ResponsiveLayout>
  );
}