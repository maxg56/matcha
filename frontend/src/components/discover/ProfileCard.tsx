import { useState } from 'react';
import { ProfileImageCarousel } from './ProfileImageCarousel';
import { ProfileActions } from './ProfileActions';
import { ProfileDetails } from './ProfileDetails';
import { useProfileAnalytics } from '@/hooks/api/useProfileAnalytics';
import { ChevronDown } from 'lucide-react';

interface Profile {
  id: string | number;
  // Nom (peut venir de first_name ou name)
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  age: number;
  height?: number;
  fame?: number;
  gender?: string;
  sex_pref?: string;
  sexPref?: string;
  images?: string[];
  profile_photos?: string[]; // alias pour images
  bio: string;
  location?: string;
  current_city?: string; // source pour location
  occupation?: string;
  job?: string; // source pour occupation
  interests?: string[];
  tags?: string[]; // source pour interests
  distance?: number;
  
  // Infos détaillées
  personal_opinion?: string;
  personalOpinion?: string; // alias
  education_level?: string;
  educationLevel?: string; // alias
  social_activity_level?: string;
  socialActivityLevel?: string; // alias
  sport_activity?: string;
  sportActivity?: string; // alias
  religion?: string;
  children_status?: string;
  childrenStatus?: string; // alias
  children_details?: string;
  childrenDetails?: string; // alias
  zodiac_sign?: string;
  zodiacSign?: string; // alias
  hair_color?: string;
  hairColor?: string; // alias
  skin_color?: string;
  skinColor?: string; // alias
  eye_color?: string;
  eyeColor?: string; // alias
  birth_city?: string;
  birthCity?: string; // alias
  currentCity?: string;
  
  // Style de vie
  relationship_type?: string;
  relationshipType?: string; // alias
  political_view?: string;
  politicalView?: string; // alias
  alcohol_consumption?: string;
  alcoholConsumption?: string; // alias
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
}

interface ProfileCardProps {
  profile: Profile;
  candidate?: {
    id: number;
    algorithm_type: string;
    compatibility_score?: number;
    distance?: number;
  };
  onLike: (id: string | number) => void;
  onPass: (id: string | number) => void;
  onSuperLike?: (id: string | number) => void;
  onBoost?: (id: string | number) => void;
  onMessage?: (id: string | number) => void;
  onReport?: (id: string | number) => void;
}

export function ProfileCard({
  profile,
  candidate,
  onLike,
  onPass,
  onSuperLike,
  onBoost,
  onMessage,
  onReport
}: ProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const { trackProfileView } = useProfileAnalytics();

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleToggleDetails = async () => {
    if (!showDetails) {
      // Track profile view when opening details for the first time
      await trackProfileView(Number(profile.id));
    }
    setShowDetails(!showDetails);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Normaliser les données pour compatibilité
  const normalizedProfile = {
    ...profile,
    name: profile.name || profile.first_name || 'Utilisateur',
    firstName: profile.first_name,
    lastName: profile.last_name,
    username: profile.username,
    height: profile.height,
    fame: profile.fame,
    gender: profile.gender,
    sexPref: profile.sex_pref || profile.sexPref,
    images: profile.images || profile.profile_photos || [],
    location: profile.location || profile.current_city || '',
    occupation: profile.occupation || profile.job || '',
    interests: profile.interests || profile.tags || [],
    distance: candidate?.distance || profile.distance || 0,
    
    // Normaliser les aliases camelCase vers snake_case
    personalOpinion: profile.personal_opinion || profile.personalOpinion,
    educationLevel: profile.education_level || profile.educationLevel,
    socialActivityLevel: profile.social_activity_level || profile.socialActivityLevel,
    sportActivity: profile.sport_activity || profile.sportActivity,
    childrenStatus: profile.children_status || profile.childrenStatus,
    childrenDetails: profile.children_details || profile.childrenDetails,
    zodiacSign: profile.zodiac_sign || profile.zodiacSign,
    hairColor: profile.hair_color || profile.hairColor,
    skinColor: profile.skin_color || profile.skinColor,
    eyeColor: profile.eye_color || profile.eyeColor,
    birthCity: profile.birth_city || profile.birthCity,
    currentCity: profile.current_city || profile.currentCity,
    job: profile.job || profile.occupation,
    
    // Style de vie
    relationshipType: profile.relationship_type || profile.relationshipType,
    politicalView: profile.political_view || profile.politicalView,
    alcoholConsumption: profile.alcohol_consumption || profile.alcoholConsumption,
    smoking: profile.smoking,
    cannabis: profile.cannabis,
    drugs: profile.drugs,
    pets: profile.pets
  };

  // Informations à afficher selon l'image actuelle
  const getContextualInfo = (imageIndex: number) => {
    const totalImages = normalizedProfile.images.length;
    if (totalImages <= 1) return null;

    const infoSets = [
      // Image 1: Infos de base
      {
        title: "À propos",
        items: [
          { label: "Âge", value: `${normalizedProfile.age} ans`, icon: "🎂" },
          { label: "Profession", value: normalizedProfile.occupation, icon: "💼" },
          { label: "Ville", value: normalizedProfile.location, icon: "📍" },
          { label: "Distance", value: `${Math.round(normalizedProfile.distance || 0)}km`, icon: "🗺️" }
        ]
      },
      // Image 2: Style de vie
      {
        title: "Style de vie",
        items: [
          { label: "Activité sociale", value: normalizedProfile.socialActivityLevel, icon: "🎉" },
          { label: "Sport", value: normalizedProfile.sportActivity, icon: "🏃‍♀️" },
          { label: "Éducation", value: normalizedProfile.educationLevel, icon: "🎓" },
          { label: "Religion", value: normalizedProfile.religion, icon: "🙏" }
        ]
      },
      // Image 3: Apparence
      {
        title: "Apparence",
        items: [
          { label: "Cheveux", value: normalizedProfile.hairColor, icon: "💇‍♀️" },
          { label: "Yeux", value: normalizedProfile.eyeColor, icon: "👁️" },
          { label: "Signe", value: normalizedProfile.zodiacSign, icon: "⭐" },
          { label: "Enfants", value: normalizedProfile.childrenStatus, icon: "👶" }
        ]
      }
    ];

    return infoSets[imageIndex % infoSets.length];
  };

  const currentInfo = getContextualInfo(currentImageIndex);

  return (
    <div className="relative rounded-2xl overflow-hidden h-full flex flex-col shadow-2xl">
      {/* Carousel d'images */}
      <div className="relative bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:to-emerald-950">
        <ProfileImageCarousel
          images={normalizedProfile.images}
          profileName={normalizedProfile.name}
          currentIndex={currentImageIndex}
          onImageChange={handleImageChange}
        />
        
        {/* Overlay d'informations contextuelles */}
        {currentInfo && normalizedProfile.images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-sm bg-white/20 rounded-full px-2 py-1">
                  {currentImageIndex + 1}/{normalizedProfile.images.length}
                </span>
                {currentInfo.title}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {currentInfo.items.map((item, index) => (
                  item.value && (
                    <div key={index} className="flex items-center gap-1.5 text-sm">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-gray-200">{item.label}:</span>
                      <span className="font-medium text-white capitalize">{item.value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section infos et boutons */}
      <div className="flex-1 bg-white dark:bg-gradient-to-b dark:from-emerald-950 dark:to-gray-900 flex flex-col">
        {/* Infos profil principales */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {normalizedProfile.name}, {normalizedProfile.age}
                </h2>
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
                
              </div>
              
              {/* Informations rapides */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span>📍</span>
                  <span>{normalizedProfile.location} • {Math.round(normalizedProfile.distance || 0)}km</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span>💼</span>
                  <span>{normalizedProfile.occupation}</span>
                </div>
                {normalizedProfile.educationLevel && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span>🎓</span>
                    <span className="capitalize">{normalizedProfile.educationLevel}</span>
                  </div>
                )}
                {normalizedProfile.childrenStatus && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span>👶</span>
                    <span className="capitalize">{normalizedProfile.childrenStatus === 'yes' ? 'A des enfants' : 'Sans enfants'}</span>
                  </div>
                )}
              </div>

              {/* Bio courte */}
              {normalizedProfile.bio && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {normalizedProfile.bio}
                  </p>
                </div>
              )}

              {/* Intérêts/Tags */}
              {normalizedProfile.interests && normalizedProfile.interests.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {normalizedProfile.interests.slice(0, 6).map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                    {normalizedProfile.interests.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        +{normalizedProfile.interests.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton détails */}
            <button
              onClick={handleToggleDetails}
              className="ml-4 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronDown className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Boutons d'actions */}
        <ProfileActions
          profileId={String(profile.id)}
          onLike={onLike}
          onPass={onPass}
          onSuperLike={onSuperLike}
          onBoost={onBoost}
          onMessage={onMessage}
        />
      </div>

      {/* Détails dépliables */}
      <ProfileDetails
        bio={normalizedProfile.bio}
        interests={normalizedProfile.interests}
        personalOpinion={normalizedProfile.personalOpinion}
        educationLevel={normalizedProfile.educationLevel}
        socialActivityLevel={normalizedProfile.socialActivityLevel}
        sportActivity={normalizedProfile.sportActivity}
        religion={normalizedProfile.religion}
        childrenStatus={normalizedProfile.childrenStatus}
        childrenDetails={normalizedProfile.childrenDetails}
        zodiacSign={normalizedProfile.zodiacSign}
        hairColor={normalizedProfile.hairColor}
        skinColor={normalizedProfile.skinColor}
        eyeColor={normalizedProfile.eyeColor}
        birthCity={normalizedProfile.birthCity}
        currentCity={normalizedProfile.currentCity}
        job={normalizedProfile.job}
        relationshipType={normalizedProfile.relationshipType}
        politicalView={normalizedProfile.politicalView}
        alcoholConsumption={normalizedProfile.alcoholConsumption}
        smoking={normalizedProfile.smoking}
        cannabis={normalizedProfile.cannabis}
        drugs={normalizedProfile.drugs}
        pets={normalizedProfile.pets}
        height={normalizedProfile.height}
        fame={normalizedProfile.fame}
        gender={normalizedProfile.gender}
        sexPref={normalizedProfile.sexPref}
        age={normalizedProfile.age}
        username={normalizedProfile.username}
        firstName={normalizedProfile.firstName}
        lastName={normalizedProfile.lastName}
        profileId={String(profile.id)}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onReport={onReport}
      />

    </div>
  );
}