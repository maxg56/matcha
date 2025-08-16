import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Calendar, 
  MapPin, 
  Ruler, 
  Heart,
  GraduationCap,
  Briefcase,
  Church,
  Baby,
  Palette,
  Eye,
  Activity,
  Users,
  Wine,
  Cigarette,
  PillBottle,
  Dog,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

interface FilterState {
  ageRange: [number, number];
  distance: number;
  heightRange: [number, number];
  showMe: 'woman' | 'man' | 'both';
  
  // Physical attributes
  hairColors: string[];
  eyeColors: string[];
  skinColors: string[];
  
  // Lifestyle
  alcoholConsumption: string[];
  smoking: string[];
  cannabis: string[];
  drugs: string[];
  pets: string[];
  
  // Social & Activity
  socialActivityLevel: string[];
  sportActivity: string[];
  educationLevel: string[];
  
  // Personal
  religion: string[];
  relationshipType: string[];
  childrenStatus: string[];
  politicalView: string[];
  
  // Location
  birthCity: string;
  currentCity: string;
  
  // Tags
  tags: string[];
}

const defaultFilters: FilterState = {
  ageRange: [18, 65],
  distance: 50,
  heightRange: [150, 200],
  showMe: 'both',
  hairColors: [],
  eyeColors: [],
  skinColors: [],
  alcoholConsumption: [],
  smoking: [],
  cannabis: [],
  drugs: [],
  pets: [],
  socialActivityLevel: [],
  sportActivity: [],
  educationLevel: [],
  religion: [],
  relationshipType: [],
  childrenStatus: [],
  politicalView: [],
  birthCity: '',
  currentCity: '',
  tags: []
};

const filterOptions = {
  showMe: [
    { value: 'woman', label: 'Femmes', icon: '👩' },
    { value: 'man', label: 'Hommes', icon: '👨' },
    { value: 'both', label: 'Tout le monde', icon: '👫' }
  ],
  hairColors: [
    { value: 'black', label: 'Noirs', icon: '⚫' },
    { value: 'brown', label: 'Bruns', icon: '🤎' },
    { value: 'blonde', label: 'Blonds', icon: '🟡' },
    { value: 'red', label: 'Roux', icon: '🔴' },
    { value: 'gray', label: 'Gris', icon: '⚪' },
    { value: 'white', label: 'Blancs', icon: '⚪' }
  ],
  eyeColors: [
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
    { value: 'atheism', label: 'Athéisme', icon: '🔬' }
  ],
  relationshipType: [
    { value: 'friendship', label: 'Amitié', icon: '👫' },
    { value: 'short_term', label: 'Court terme', icon: '💕' },
    { value: 'long_term', label: 'Long terme', icon: '💖' },
    { value: 'life', label: 'Vie', icon: '💍' }
  ],
  childrenStatus: [
    { value: 'yes', label: 'Avec enfants', icon: '👶' },
    { value: 'no', label: 'Sans enfants', icon: '🚫' }
  ],
  activityLevel: [
    { value: 'low', label: 'Faible', icon: '🛋️' },
    { value: 'medium', label: 'Modéré', icon: '🚶' },
    { value: 'high', label: 'Élevé', icon: '🏃' }
  ]
};

const availableTags = [
  '🌍 Voyage', '🍳 Cuisine', '🚴 Sport', '🏋️ Fitness',
  '🎮 Jeux vidéo', '📚 Lecture', '🎶 Musique', '🎨 Art & Créativité',
  '🐶 Amoureux des animaux', '🌱 Écologie & nature', '🎥 Cinéma & séries',
  '💃 Danse', '📷 Photographie', '🚀 Tech & innovation',
  '🍷 Gastronomie & vin', '👨‍💻 Code avec vim', '⛰️ Randonnée & plein air'
];

export function FiltersScreen({ onClose, onApply, initialFilters = {} }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K, 
    value: string
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterState[K]);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const applyFilters = () => {
    onApply(filters);
    onClose();
  };

  const FilterSection = ({ 
    title, 
    icon, 
    children, 
    sectionKey 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    sectionKey: string;
  }) => (
    <div className="mb-6">
      <button
        onClick={() => setActiveSection(activeSection === sectionKey ? null : sectionKey)}
        className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <div className={cn(
          "transition-transform duration-200",
          activeSection === sectionKey ? "rotate-180" : "rotate-0"
        )}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {activeSection === sectionKey && (
        <div className="mt-3 p-4 bg-background border border-border rounded-xl">
          {children}
        </div>
      )}
    </div>
  );

  const MultiSelectFilter = ({ 
    options, 
    selectedValues, 
    onToggle 
  }: { 
    options: Array<{value: string, label: string, icon: string}>; 
    selectedValues: string[]; 
    onToggle: (value: string) => void;
  }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onToggle(option.value)}
          className={cn(
            "p-2 md:p-3 rounded-lg border text-xs md:text-sm font-medium transition-colors",
            "flex items-center gap-1 md:gap-2 justify-center",
            selectedValues.includes(option.value)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-accent"
          )}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Filtres</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetFilters}>
            Réinitialiser
          </Button>
          <Button onClick={applyFilters}>
            Appliquer
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20 max-w-2xl mx-auto">
        {/* Basic Filters */}
        <FilterSection title="Préférences de base" icon={<Heart className="h-5 w-5" />} sectionKey="basic">
          {/* Show Me */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Qui souhaitez-vous voir ?</h4>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.showMe.map(option => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('showMe', option.value as any)}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-colors",
                    "flex flex-col items-center gap-1",
                    filters.showMe === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-accent"
                  )}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Âge: {filters.ageRange[0]} - {filters.ageRange[1]} ans
            </h4>
            <div className="px-2">
              <Slider
                value={filters.ageRange}
                min={18}
                max={65}
                step={1}
                onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
              />
            </div>
          </div>

          {/* Distance */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Distance: {filters.distance} km
            </h4>
            <div className="px-2">
              <Slider
                value={[filters.distance]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) => updateFilter('distance', value[0])}
              />
            </div>
          </div>

          {/* Height Range */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Taille: {filters.heightRange[0]} - {filters.heightRange[1]} cm
            </h4>
            <div className="px-2">
              <Slider
                value={filters.heightRange}
                min={140}
                max={220}
                step={1}
                onValueChange={(value) => updateFilter('heightRange', value as [number, number])}
              />
            </div>
          </div>
        </FilterSection>

        {/* Physical Attributes */}
        <FilterSection title="Apparence physique" icon={<Palette className="h-5 w-5" />} sectionKey="physical">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Couleur des cheveux</h4>
              <MultiSelectFilter
                options={filterOptions.hairColors}
                selectedValues={filters.hairColors}
                onToggle={(value) => toggleArrayFilter('hairColors', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Couleur des yeux</h4>
              <MultiSelectFilter
                options={filterOptions.eyeColors}
                selectedValues={filters.eyeColors}
                onToggle={(value) => toggleArrayFilter('eyeColors', value)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Lifestyle */}
        <FilterSection title="Style de vie" icon={<Wine className="h-5 w-5" />} sectionKey="lifestyle">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Consommation d'alcool</h4>
              <MultiSelectFilter
                options={filterOptions.alcoholConsumption}
                selectedValues={filters.alcoholConsumption}
                onToggle={(value) => toggleArrayFilter('alcoholConsumption', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Tabac</h4>
              <MultiSelectFilter
                options={filterOptions.smoking}
                selectedValues={filters.smoking}
                onToggle={(value) => toggleArrayFilter('smoking', value)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Education & Career */}
        <FilterSection title="Éducation & Carrière" icon={<GraduationCap className="h-5 w-5" />} sectionKey="education">
          <div>
            <h4 className="font-medium mb-3">Niveau d'éducation</h4>
            <MultiSelectFilter
              options={filterOptions.educationLevel}
              selectedValues={filters.educationLevel}
              onToggle={(value) => toggleArrayFilter('educationLevel', value)}
            />
          </div>
        </FilterSection>

        {/* Personal Values */}
        <FilterSection title="Valeurs personnelles" icon={<Church className="h-5 w-5" />} sectionKey="values">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Religion</h4>
              <MultiSelectFilter
                options={filterOptions.religion}
                selectedValues={filters.religion}
                onToggle={(value) => toggleArrayFilter('religion', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Type de relation recherchée</h4>
              <MultiSelectFilter
                options={filterOptions.relationshipType}
                selectedValues={filters.relationshipType}
                onToggle={(value) => toggleArrayFilter('relationshipType', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Enfants</h4>
              <MultiSelectFilter
                options={filterOptions.childrenStatus}
                selectedValues={filters.childrenStatus}
                onToggle={(value) => toggleArrayFilter('childrenStatus', value)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Interests/Tags */}
        <FilterSection title="Centres d'intérêt" icon={<Star className="h-5 w-5" />} sectionKey="interests">
          <div>
            <h4 className="font-medium mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleArrayFilter('tags', tag)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                    filters.tags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}