import { useState } from 'react';
import { Calendar, MapPin, Ruler, Heart, GraduationCap, Church, Palette, Wine, Star } from 'lucide-react';
import type { FilterState } from '@/types/filters';
import { FilterHeader } from './FilterHeader';
import { FilterSection } from './FilterSection';
import { ShowMeFilter } from './ShowMeFilter';
import { RangeFilter } from './RangeFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { TagsFilter } from './TagsFilter';
import { filterOptions } from './FilterOptions';

interface FiltersProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
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

export function FiltersScreen({ onClose, onApply, initialFilters = {} }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = <K extends keyof FilterState>(key: K, value: string) => {
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

  const handleToggleSection = (sectionKey: string) => {
    setActiveSection(activeSection === sectionKey ? null : sectionKey);
  };

  return (
    <div className="fixed pr-20 inset-0 z-50 bg-white dark:bg-gray-900 overflow">
      <FilterHeader onClose={onClose} onReset={resetFilters} onApply={applyFilters} />

      <div className="p-4 pb-20 max-w-2xl mx-auto">
        {/* Basic Filters */}
        <FilterSection 
          title="Préférences de base" 
          icon={<Heart className="h-5 w-5" />} 
          sectionKey="basic"
          activeSection={activeSection}
          onToggleSection={handleToggleSection}
        >
          <ShowMeFilter
            selectedValue={filters.showMe}
            onValueChange={(value) => updateFilter('showMe', value)}
          />

          <RangeFilter
            title="Âge"
            icon={<Calendar className="h-4 w-4" />}
            value={filters.ageRange}
            min={18}
            max={65}
            step={1}
            unit="ans"
            onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
          />
          <RangeFilter
            title="Distance"
            icon={<MapPin className="h-4 w-4" />}
            value={filters.distance}
            min={1}
            max={100}
            step={1}
            unit="km"
            onValueChange={(value) => updateFilter('distance', value as number)}
          />

          <RangeFilter
            title="Taille"
            icon={<Ruler className="h-4 w-4" />}
            value={filters.heightRange}
            min={140}
            max={220}
            step={1}
            unit="cm"
            onValueChange={(value) => updateFilter('heightRange', value as [number, number])}
          />
        </FilterSection>

        {/* Physical Attributes */}
        <FilterSection 
          title="Apparence physique" 
          icon={<Palette className="h-5 w-5" />} 
          sectionKey="physical"
          activeSection={activeSection}
          onToggleSection={handleToggleSection}
        >
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

            <div>
              <h4 className="font-medium mb-3">Couleur de peau</h4>
              <MultiSelectFilter
                options={filterOptions.skinColors}
                selectedValues={filters.skinColors}
                onToggle={(value) => toggleArrayFilter('skinColors', value)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Lifestyle */}
        <FilterSection 
          title="Style de vie" 
          icon={<Wine className="h-5 w-5" />} 
          sectionKey="lifestyle"
          activeSection={activeSection}
          onToggleSection={handleToggleSection}
        >
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

            <div>
              <h4 className="font-medium mb-3">Cannabis</h4>
              <MultiSelectFilter
                options={filterOptions.cannabis}
                selectedValues={filters.cannabis}
                onToggle={(value) => toggleArrayFilter('cannabis', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Drogues</h4>
              <MultiSelectFilter
                options={filterOptions.drugs}
                selectedValues={filters.drugs}
                onToggle={(value) => toggleArrayFilter('drugs', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Animaux de compagnie</h4>
              <MultiSelectFilter
                options={filterOptions.pets}
                selectedValues={filters.pets}
                onToggle={(value) => toggleArrayFilter('pets', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Niveau d'activité sociale</h4>
              <MultiSelectFilter
                options={filterOptions.socialActivityLevel}
                selectedValues={filters.socialActivityLevel}
                onToggle={(value) => toggleArrayFilter('socialActivityLevel', value)}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Activité sportive</h4>
              <MultiSelectFilter
                options={filterOptions.sportActivity}
                selectedValues={filters.sportActivity}
                onToggle={(value) => toggleArrayFilter('sportActivity', value)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Education & Career */}
        <FilterSection 
          title="Éducation & Carrière" 
          icon={<GraduationCap className="h-5 w-5" />} 
          sectionKey="education"
          activeSection={activeSection}
          onToggleSection={handleToggleSection}
        >
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
        <FilterSection 
          title="Valeurs personnelles" 
          icon={<Church className="h-5 w-5" />} 
          sectionKey="values"
          activeSection={activeSection}
          onToggleSection={handleToggleSection}
        >
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

            <div>
              <h4 className="font-medium mb-3">Opinion politique</h4>
              <MultiSelectFilter
                options={filterOptions.politicalView}
                selectedValues={filters.politicalView}
                onToggle={(value) => toggleArrayFilter('politicalView', value)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Interests/Tags */}
        <FilterSection 
          title="Centres d'intérêt" 
          icon={<Star className="h-5 w-5" />} 
          sectionKey="interests"
          activeSection={activeSection}
          onToggleSection={handleToggleSection}
        >
          <TagsFilter
            selectedTags={filters.tags}
            onToggle={(tag) => toggleArrayFilter('tags', tag)}
          />
        </FilterSection>
      </div>
    </div>
  );
}