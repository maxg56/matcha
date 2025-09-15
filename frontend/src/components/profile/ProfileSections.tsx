import { useState } from 'react';
import { ChevronDown, ChevronUp, Palette, Wine, Baby, Ruler } from 'lucide-react';
import { physicalTraits, lifestyleLabels, personalValues } from './ProfileLabels';
import type { UserProfile } from '@/stores/userStore';

interface ProfileSectionsProps {
  user: UserProfile;
}

export function ProfileSections({ user }: ProfileSectionsProps) {
  const [expandedSections, setExpandedSections] = useState({
    physical: false,
    lifestyle: false,
    values: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const ExpandableSection = ({ 
    title, 
    icon, 
    children, 
    sectionKey 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    sectionKey: keyof typeof expandedSections;
  }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-lg">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {expandedSections[sectionKey] ? 
          <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        }
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Apparence physique */}
      <ExpandableSection
        title="Apparence physique"
        icon={<Palette className="h-4 w-4" />}
        sectionKey="physical"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {user.height && (
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              <span>Taille: {user.height} cm</span>
            </div>
          )}
          {user.hair_color && (
            <div className="flex items-center gap-2">
              <span>{physicalTraits.hairColor[user.hair_color as keyof typeof physicalTraits.hairColor]?.icon}</span>
              <span>Cheveux: {physicalTraits.hairColor[user.hair_color as keyof typeof physicalTraits.hairColor]?.label}</span>
            </div>
          )}
          {user.eye_color && (
            <div className="flex items-center gap-2">
              <span>{physicalTraits.eyeColor[user.eye_color as keyof typeof physicalTraits.eyeColor]?.icon}</span>
              <span>Yeux: {physicalTraits.eyeColor[user.eye_color as keyof typeof physicalTraits.eyeColor]?.label}</span>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Style de vie */}
      <ExpandableSection
        title="Style de vie"
        icon={<Wine className="h-4 w-4" />}
        sectionKey="lifestyle"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {user.alcohol_consumption && (
            <div>Alcool: {lifestyleLabels.alcoholConsumption[user.alcohol_consumption as keyof typeof lifestyleLabels.alcoholConsumption]}</div>
          )}
          {user.smoking && (
            <div>Tabac: {lifestyleLabels.smoking[user.smoking as keyof typeof lifestyleLabels.smoking]}</div>
          )}
          {user.cannabis && (
            <div>Cannabis: {lifestyleLabels.cannabis[user.cannabis as keyof typeof lifestyleLabels.cannabis]}</div>
          )}
          {user.drugs && (
            <div>Drogues: {lifestyleLabels.drugs[user.drugs as keyof typeof lifestyleLabels.drugs]}</div>
          )}
          {user.sport_activity && (
            <div>Sport: {lifestyleLabels.sportActivity[user.sport_activity as keyof typeof lifestyleLabels.sportActivity]}</div>
          )}
          {user.pets && (
            <div>Animaux: {lifestyleLabels.pets[user.pets as keyof typeof lifestyleLabels.pets]}</div>
          )}
          {user.social_activity_level && (
            <div>Activité sociale: {lifestyleLabels.socialActivityLevel[user.social_activity_level as keyof typeof lifestyleLabels.socialActivityLevel]}</div>
          )}
        </div>
      </ExpandableSection>

      {/* Valeurs personnelles */}
      <ExpandableSection
        title="Valeurs personnelles"
        icon={<Baby className="h-4 w-4" />}
        sectionKey="values"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {user.religion && (
            <div>Religion: {personalValues.religion[user.religion as keyof typeof personalValues.religion]}</div>
          )}
          {user.political_view && (
            <div>Opinion politique: {personalValues.politicalView[user.political_view as keyof typeof personalValues.politicalView]}</div>
          )}
          {user.children_status && (
            <div>Enfants: {personalValues.childrenStatus[user.children_status as keyof typeof personalValues.childrenStatus]}</div>
          )}
          {user.relationship_type && (
            <div>Type de relation: {lifestyleLabels.relationshipType[user.relationship_type as keyof typeof lifestyleLabels.relationshipType]}</div>
          )}
          {user.education_level && (
            <div>Éducation: {lifestyleLabels.educationLevel[user.education_level as keyof typeof lifestyleLabels.educationLevel]}</div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}