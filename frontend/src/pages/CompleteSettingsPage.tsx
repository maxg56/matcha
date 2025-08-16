import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Bell, 
  Shield, 
  Eye, 
  Heart, 
  MapPin, 
  Calendar,
  Edit3,
  Camera,
  Trash2,
  LogOut,
  Crown,
  Zap,
  Star,
  ChevronRight,
  Globe,
  Moon,
  Volume2,
  Vibrate,
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
  Save,
  X
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
  fame: number;
  
  // Location
  latitude: number;
  longitude: number;
  
  // Profile
  avatar: string;
  verified: boolean;
  premium: boolean;
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
  fame: 75,
  latitude: 48.8566,
  longitude: 2.3522,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  verified: true,
  premium: false
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

export default function CompleteSettingsPage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<Partial<UserProfile>>({});

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    if (editingSection) {
      setTempData(prev => ({ ...prev, [field]: value }));
    } else {
      setUser(prev => ({ ...prev, [field]: value }));
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
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempData({});
  };

  const getCurrentValue = <K extends keyof UserProfile>(field: K): UserProfile[K] => {
    return editingSection && tempData[field] !== undefined ? tempData[field] as UserProfile[K] : user[field];
  };

  const SettingSection = ({ 
    title, 
    icon, 
    children, 
    sectionKey,
    editable = false
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

  return (
    <ResponsiveLayout
      title="Profil Complet"
      showNavigation={true}
      maxWidth="lg"
    >
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <SettingSection title="Photo de Profil" icon={<Camera className="h-5 w-5" />} sectionKey="photo">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{user.firstName} {user.lastName}</h3>
                  {user.verified && (
                    <Badge variant="default" className="bg-blue-500 text-white text-xs">
                      Vérifié
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Basic Information */}
        <SettingSection title="Informations de Base" icon={<User className="h-5 w-5" />} sectionKey="basic" editable>
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground mb-2">Âge</h3>
            <p className="text-foreground">{user.age} ans (né le {new Date(user.birthDate).toLocaleDateString('fr-FR')})</p>
          </div>
          <SelectField field="gender" options={fieldOptions.gender} label="Genre" editable={editingSection === 'basic'} />
          <SelectField field="sexPref" options={fieldOptions.sexPref} label="Intéressé par" editable={editingSection === 'basic'} />
          <SliderField field="height" label="Taille" min={140} max={220} unit="cm" />
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
        <SettingSection title="Informations Personnelles" icon={<Heart className="h-5 w-5" />} sectionKey="personal" editable>
          <TextArea field="bio" label="Bio" placeholder="Parlez-nous de vous..." maxLength={400} />
          <TextArea field="personalOpinion" label="Opinion personnelle" placeholder="Votre vision de la vie..." />
          <SelectField field="religion" options={fieldOptions.religion} label="Religion" editable={editingSection === 'personal'} />
          <SelectField field="relationshipType" options={fieldOptions.relationshipType} label="Type de relation recherchée" editable={editingSection === 'personal'} />
          <SelectField field="childrenStatus" options={fieldOptions.childrenStatus} label="Situation avec les enfants" editable={editingSection === 'personal'} />
          <SelectField field="politicalView" options={fieldOptions.politicalView} label="Orientation politique" editable={editingSection === 'personal'} />
        </SettingSection>

        {/* Location & Career */}
        <SettingSection title="Localisation & Carrière" icon={<MapPin className="h-5 w-5" />} sectionKey="location" editable>
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground mb-2">Ville de naissance</h3>
            {editingSection === 'location' ? (
              <input
                type="text"
                value={getCurrentValue('birthCity') || ''}
                onChange={(e) => updateField('birthCity', e.target.value)}
                className="w-full p-2 border border-border rounded-lg"
                placeholder="Ville de naissance"
              />
            ) : (
              <p className="text-foreground">{user.birthCity}</p>
            )}
          </div>
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground mb-2">Ville actuelle</h3>
            {editingSection === 'location' ? (
              <input
                type="text"
                value={getCurrentValue('currentCity') || ''}
                onChange={(e) => updateField('currentCity', e.target.value)}
                className="w-full p-2 border border-border rounded-lg"
                placeholder="Ville actuelle"
              />
            ) : (
              <p className="text-foreground">{user.currentCity}</p>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-foreground mb-2">Profession</h3>
            {editingSection === 'location' ? (
              <input
                type="text"
                value={getCurrentValue('job') || ''}
                onChange={(e) => updateField('job', e.target.value)}
                className="w-full p-2 border border-border rounded-lg"
                placeholder="Votre profession"
              />
            ) : (
              <p className="text-foreground">{user.job}</p>
            )}
          </div>
        </SettingSection>

        {/* Fame Score */}
        <SettingSection title="Popularité" icon={<Star className="h-5 w-5" />} sectionKey="fame">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Score de popularité</h3>
              <span className="text-lg font-bold text-primary">{user.fame}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all"
                style={{ width: `${user.fame}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Votre score augmente avec les likes, messages et interactions
            </p>
          </div>
        </SettingSection>

        {/* Account Actions */}
        <SettingSection title="Actions du Compte" icon={<Shield className="h-5 w-5" />} sectionKey="account">
          <div className="p-4 space-y-3">
            <Button variant="outline" className="w-full gap-2">
              <Eye className="h-4 w-4" />
              Modifier la visibilité du profil
            </Button>
            <Button variant="outline" className="w-full gap-2 text-destructive border-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              Supprimer le compte
            </Button>
            <Button variant="outline" className="w-full gap-2 text-destructive border-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </SettingSection>
      </div>
    </ResponsiveLayout>
  );
}