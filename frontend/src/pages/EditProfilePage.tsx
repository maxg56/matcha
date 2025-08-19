import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { 
  User, 
  Camera,
  Palette,
  Wine,
  Activity,
  Heart,
  MapPin,
  Star
} from 'lucide-react';
import { 
  SettingSection,
  SelectField,
  TextArea,
  SliderField,
  TextInput,
  PhotosSection,
  InterestsSection
} from '@/components/edit-profile';

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

        {/* Basic Information */}
        <SettingSection 
          title="Informations de Base" 
          icon={<User className="h-5 w-5" />} 
          sectionKey="basic" 
          editable
          editingSection={editingSection}
          onStartEditing={startEditing}
          onSaveChanges={saveChanges}
          onCancelEditing={cancelEditing}
        >
          <TextInput 
            field="firstName" 
            label="Prénom" 
            placeholder="Votre prénom" 
            currentValue={getCurrentValue('firstName') as string}
            editingSection={editingSection === 'basic'}
            onChange={updateField}
          />
          <TextInput 
            field="lastName" 
            label="Nom" 
            placeholder="Votre nom" 
            currentValue={getCurrentValue('lastName') as string}
            editingSection={editingSection === 'basic'}
            onChange={updateField}
          />
          <TextInput 
            field="username" 
            label="Nom d'utilisateur" 
            placeholder="@username" 
            currentValue={getCurrentValue('username') as string}
            editingSection={editingSection === 'basic'}
            onChange={updateField}
          />
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground mb-2">Date de naissance</h3>
            <p className="text-foreground">{new Date(user.birthDate).toLocaleDateString('fr-FR')} ({user.age} ans)</p>
            <p className="text-xs text-muted-foreground mt-1">L'âge ne peut pas être modifié</p>
          </div>
          <SelectField 
            field="gender" 
            options={fieldOptions.gender} 
            label="Genre" 
            currentValue={getCurrentValue('gender') as string}
            editable={true}
            editingSection={editingSection === 'basic'}
            onChange={updateField}
          />
          <SelectField 
            field="sexPref" 
            options={fieldOptions.sexPref} 
            label="Intéressé par" 
            currentValue={getCurrentValue('sexPref') as string}
            editable={true}
            editingSection={editingSection === 'basic'}
            onChange={updateField}
          />
          <SliderField 
            field="height" 
            label="Taille" 
            min={140} 
            max={220} 
            unit="cm" 
            currentValue={getCurrentValue('height') as number}
            editingSection={editingSection === 'basic'}
            onChange={updateField}
          />
        </SettingSection>

        {/* Bio */}
        <SettingSection 
          title="À propos de moi" 
          icon={<Heart className="h-5 w-5" />} 
          sectionKey="bio" 
          editable
          editingSection={editingSection}
          onStartEditing={startEditing}
          onSaveChanges={saveChanges}
          onCancelEditing={cancelEditing}
        >
          <TextArea 
            field="bio" 
            label="Bio" 
            placeholder="Parlez-nous de vous..." 
            maxLength={400}
            currentValue={getCurrentValue('bio') as string}
            editingSection={editingSection === 'bio'}
            onChange={updateField}
          />
          <TextArea 
            field="personalOpinion" 
            label="Ma vision de la vie" 
            placeholder="Votre philosophie, vos valeurs..."
            currentValue={getCurrentValue('personalOpinion') as string}
            editingSection={editingSection === 'bio'}
            onChange={updateField}
          />
        </SettingSection>

        {/* Physical Appearance */}
        <SettingSection 
          title="Apparence Physique" 
          icon={<Palette className="h-5 w-5" />} 
          sectionKey="appearance" 
          editable
          editingSection={editingSection}
          onStartEditing={startEditing}
          onSaveChanges={saveChanges}
          onCancelEditing={cancelEditing}
        >
          <SelectField 
            field="hairColor" 
            options={fieldOptions.hairColor} 
            label="Couleur des cheveux"
            currentValue={getCurrentValue('hairColor') as string}
            editable={true}
            editingSection={editingSection === 'appearance'}
            onChange={updateField}
          />
          <SelectField 
            field="eyeColor" 
            options={fieldOptions.eyeColor} 
            label="Couleur des yeux"
            currentValue={getCurrentValue('eyeColor') as string}
            editable={true}
            editingSection={editingSection === 'appearance'}
            onChange={updateField}
          />
          <SelectField 
            field="skinColor" 
            options={fieldOptions.skinColor} 
            label="Couleur de peau"
            currentValue={getCurrentValue('skinColor') as string}
            editable={true}
            editingSection={editingSection === 'appearance'}
            onChange={updateField}
          />
        </SettingSection>

        {/* Lifestyle */}
        <SettingSection 
          title="Style de Vie" 
          icon={<Wine className="h-5 w-5" />} 
          sectionKey="lifestyle" 
          editable
          editingSection={editingSection}
          onStartEditing={startEditing}
          onSaveChanges={saveChanges}
          onCancelEditing={cancelEditing}
        >
          <SelectField 
            field="alcoholConsumption" 
            options={fieldOptions.alcoholConsumption} 
            label="Consommation d'alcool"
            currentValue={getCurrentValue('alcoholConsumption') as string}
            editable={true}
            editingSection={editingSection === 'lifestyle'}
            onChange={updateField}
          />
          <SelectField 
            field="smoking" 
            options={fieldOptions.smoking} 
            label="Tabac"
            currentValue={getCurrentValue('smoking') as string}
            editable={true}
            editingSection={editingSection === 'lifestyle'}
            onChange={updateField}
          />
          <SelectField 
            field="cannabis" 
            options={fieldOptions.cannabis} 
            label="Cannabis"
            currentValue={getCurrentValue('cannabis') as string}
            editable={true}
            editingSection={editingSection === 'lifestyle'}
            onChange={updateField}
          />
          <SelectField 
            field="drugs" 
            options={fieldOptions.drugs} 
            label="Autres drogues"
            currentValue={getCurrentValue('drugs') as string}
            editable={true}
            editingSection={editingSection === 'lifestyle'}
            onChange={updateField}
          />
          <SelectField 
            field="pets" 
            options={fieldOptions.pets} 
            label="Animaux de compagnie"
            currentValue={getCurrentValue('pets') as string}
            editable={true}
            editingSection={editingSection === 'lifestyle'}
            onChange={updateField}
          />
        </SettingSection>

        {/* Activity & Education */}
        <SettingSection 
          title="Activité & Éducation" 
          icon={<Activity className="h-5 w-5" />} 
          sectionKey="activity" 
          editable
          editingSection={editingSection}
          onStartEditing={startEditing}
          onSaveChanges={saveChanges}
          onCancelEditing={cancelEditing}
        >
          <SelectField 
            field="socialActivityLevel" 
            options={fieldOptions.activityLevel} 
            label="Niveau d'activité sociale"
            currentValue={getCurrentValue('socialActivityLevel') as string}
            editable={true}
            editingSection={editingSection === 'activity'}
            onChange={updateField}
          />
          <SelectField 
            field="sportActivity" 
            options={fieldOptions.activityLevel} 
            label="Activité sportive"
            currentValue={getCurrentValue('sportActivity') as string}
            editable={true}
            editingSection={editingSection === 'activity'}
            onChange={updateField}
          />
          <SelectField 
            field="educationLevel" 
            options={fieldOptions.educationLevel} 
            label="Niveau d'éducation"
            currentValue={getCurrentValue('educationLevel') as string}
            editable={true}
            editingSection={editingSection === 'activity'}
            onChange={updateField}
          />
        </SettingSection>

        {/* Personal Information */}
        <SettingSection 
          title="Informations Personnelles" 
          icon={<Heart className="h-5 w-5" />} 
          sectionKey="personal" 
          editable
          editingSection={editingSection}
          onStartEditing={startEditing}
          onSaveChanges={saveChanges}
          onCancelEditing={cancelEditing}
        >
          <SelectField 
            field="religion" 
            options={fieldOptions.religion} 
            label="Religion"
            currentValue={getCurrentValue('religion') as string}
            editable={true}
            editingSection={editingSection === 'personal'}
            onChange={updateField}
          />
          <SelectField 
            field="relationshipType" 
            options={fieldOptions.relationshipType} 
            label="Type de relation recherchée"
            currentValue={getCurrentValue('relationshipType') as string}
            editable={true}
            editingSection={editingSection === 'personal'}
            onChange={updateField}
          />
          <SelectField 
            field="childrenStatus" 
            options={fieldOptions.childrenStatus} 
            label="Situation avec les enfants"
            currentValue={getCurrentValue('childrenStatus') as string}
            editable={true}
            editingSection={editingSection === 'personal'}
            onChange={updateField}
          />
          <SelectField 
            field="politicalView" 
            options={fieldOptions.politicalView} 
            label="Orientation politique"
            currentValue={getCurrentValue('politicalView') as string}
            editable={true}
            editingSection={editingSection === 'personal'}
            onChange={updateField}
          />
          <TextInput 
            field="zodiacSign" 
            label="Signe du zodiaque" 
            placeholder="Votre signe astrologique"
            currentValue={getCurrentValue('zodiacSign') as string}
            editingSection={editingSection === 'personal'}
            onChange={updateField}
          />
        </SettingSection>

        {/* Location & Career */}
        <SettingSection 
          title="Localisation & Carrière" 
          icon={<MapPin className="h-5 w-5" />} 
          sectionKey="location" 
          editable
          editingSection={editingSection}
          onStartEditing={startEditing}
          onSaveChanges={saveChanges}
          onCancelEditing={cancelEditing}
        >
          <TextInput 
            field="birthCity" 
            label="Ville de naissance" 
            placeholder="Où êtes-vous né(e) ?"
            currentValue={getCurrentValue('birthCity') as string}
            editingSection={editingSection === 'location'}
            onChange={updateField}
          />
          <TextInput 
            field="currentCity" 
            label="Ville actuelle" 
            placeholder="Où habitez-vous ?"
            currentValue={getCurrentValue('currentCity') as string}
            editingSection={editingSection === 'location'}
            onChange={updateField}
          />
          <TextInput 
            field="job" 
            label="Profession" 
            placeholder="Votre métier"
            currentValue={getCurrentValue('job') as string}
            editingSection={editingSection === 'location'}
            onChange={updateField}
          />
        </SettingSection>

        {/* Tags/Interests */}
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