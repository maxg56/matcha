import { User, Eye, MapPin, Heart, Users, Zap, Book } from 'lucide-react';
import { ProfileDetailsHeader } from './ProfileDetailsHeader';
import { DetailSection } from './DetailSection';
import { InfoCard } from './InfoCard';
import { PersonalPresentationSection } from './PersonalPresentationSection';
import { InterestsSection } from './InterestsSection';

interface ProfileDetailsProps {
  bio: string;
  interests: string[];
  personalOpinion?: string;
  educationLevel?: string;
  socialActivityLevel?: string;
  sportActivity?: string;
  religion?: string;
  childrenStatus?: string;
  childrenDetails?: string;
  zodiacSign?: string;
  hairColor?: string;
  skinColor?: string;
  eyeColor?: string;
  birthCity?: string;
  currentCity?: string;
  job?: string;
  relationshipType?: string;
  politicalView?: string;
  alcoholConsumption?: string;
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
  height?: number;
  fame?: number;
  gender?: string;
  sexPref?: string;
  age?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isOpen: boolean;
  profileId: string;
  onClose: () => void;
  onReport?: (id: string) => void;
}

export function ProfileDetails({
  bio,
  interests,
  personalOpinion,
  educationLevel,
  socialActivityLevel,
  sportActivity,
  religion,
  childrenStatus,
  childrenDetails,
  zodiacSign,
  hairColor,
  skinColor,
  eyeColor,
  birthCity,
  currentCity,
  job,
  relationshipType,
  politicalView,
  alcoholConsumption,
  smoking,
  cannabis,
  drugs,
  pets,
  height,
  fame,
  gender,
  sexPref,
  age,
  username,
  firstName,
  lastName,
  profileId,
  isOpen,
  onClose,
  onReport
}: ProfileDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end z-50">
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[90%] overflow-y-auto">
        <ProfileDetailsHeader
          firstName={firstName}
          lastName={lastName}
          username={username}
          profileId={profileId}
          onClose={onClose}
          onReport={onReport}
        />

        <div className="space-y-8">
          <DetailSection title="Informations générales" icon={User}>
            <InfoCard icon="🎂" label="Âge" value={age && `${age} ans`} />
            <InfoCard icon="⚡" label="Score Flamme" value={fame && `${fame}%`} />
            <InfoCard icon="🏷️" label="Genre" value={gender} formatType="capitalize" />
            <InfoCard icon="💘" label="Préférence" value={sexPref} formatType="capitalize" />
            <InfoCard icon="📏" label="Taille" value={height && `${height} cm`} />
            <InfoCard icon="💼" label="Profession" value={job} formatType="capitalize" />
          </DetailSection>

          <DetailSection title="Apparence" icon={Eye} columns={3}>
            <InfoCard icon="💇" label="Cheveux" value={hairColor} formatType="capitalize" />
            <InfoCard icon="👁️" label="Yeux" value={eyeColor} formatType="capitalize" />
            <InfoCard icon="🎨" label="Peau" value={skinColor} formatType="capitalize" />
            <InfoCard icon="⭐" label="Signe" value={zodiacSign} formatType="capitalize" />
          </DetailSection>

          <DetailSection title="Localisation" icon={MapPin}>
            <InfoCard icon="🏠" label="Ville actuelle" value={currentCity} formatType="capitalize" />
            <InfoCard icon="🌍" label="Ville de naissance" value={birthCity} formatType="capitalize" />
          </DetailSection>

          <DetailSection title="Mode de vie" icon={Heart}>
            <InfoCard icon="🍷" label="Alcool" value={alcoholConsumption} formatType="yes_sometimes_no" />
            <InfoCard icon="🚬" label="Tabac" value={smoking} formatType="yes_sometimes_no" />
            <InfoCard icon="🌿" label="Cannabis" value={cannabis} formatType="yes_sometimes_no" />
            <InfoCard icon="💊" label="Autres drogues" value={drugs} formatType="yes_no" />
            <InfoCard icon="🐕" label="Animaux" value={pets} formatType="yes_no" />
          </DetailSection>

          <DetailSection title="Relations et famille" icon={Users} columns={1}>
            <InfoCard icon="💑" label="Type de relation" value={relationshipType} formatType="capitalize" />
            <InfoCard icon="👶" label="Enfants" value={childrenStatus} formatType="capitalize" />
            <InfoCard icon="📝" label="Détails enfants" value={childrenDetails} />
          </DetailSection>

          <DetailSection title="Activités et loisirs" icon={Zap}>
            <InfoCard icon="🏃" label="Sport" value={sportActivity} formatType="capitalize" />
            <InfoCard icon="👥" label="Vie sociale" value={socialActivityLevel} formatType="capitalize" />
          </DetailSection>

          <DetailSection title="Valeurs et croyances" icon={Book}>
            <InfoCard icon="📚" label="Éducation" value={educationLevel} formatType="capitalize" />
            <InfoCard icon="🙏" label="Religion" value={religion} formatType="capitalize" />
            <InfoCard icon="🏛️" label="Politique" value={politicalView} formatType="capitalize" />
          </DetailSection>

          <PersonalPresentationSection bio={bio} personalOpinion={personalOpinion} />

          <InterestsSection interests={interests} />
        </div>
      </div>
    </div>
  );
}
