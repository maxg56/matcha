import { useMemo } from 'react';

interface Profile {
  id: string | number;
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
  profile_photos?: string[];
  bio: string;
  location?: string;
  current_city?: string;
  occupation?: string;
  job?: string;
  interests?: string[];
  tags?: string[];
  distance?: number;

  personal_opinion?: string;
  personalOpinion?: string;
  education_level?: string;
  educationLevel?: string;
  social_activity_level?: string;
  socialActivityLevel?: string;
  sport_activity?: string;
  sportActivity?: string;
  religion?: string;
  children_status?: string;
  childrenStatus?: string;
  children_details?: string;
  childrenDetails?: string;
  zodiac_sign?: string;
  zodiacSign?: string;
  hair_color?: string;
  hairColor?: string;
  skin_color?: string;
  skinColor?: string;
  eye_color?: string;
  eyeColor?: string;
  birth_city?: string;
  birthCity?: string;
  currentCity?: string;

  relationship_type?: string;
  relationshipType?: string;
  political_view?: string;
  politicalView?: string;
  alcohol_consumption?: string;
  alcoholConsumption?: string;
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
}

interface Candidate {
  id: number;
  algorithm_type: string;
  compatibility_score?: number;
  distance?: number;
}

interface NormalizedProfile {
  id: string | number;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  age: number;
  height?: number;
  fame?: number;
  gender?: string;
  sexPref?: string;
  images: string[];
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  distance: number;

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
}

export function useNormalizedProfile(profile: Profile, candidate?: Candidate): NormalizedProfile {
  return useMemo(() => ({
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

    relationshipType: profile.relationship_type || profile.relationshipType,
    politicalView: profile.political_view || profile.politicalView,
    alcoholConsumption: profile.alcohol_consumption || profile.alcoholConsumption,
    smoking: profile.smoking,
    cannabis: profile.cannabis,
    drugs: profile.drugs,
    pets: profile.pets
  }), [profile, candidate]);
}

export function getContextualInfo(
  imageIndex: number,
  normalizedProfile: NormalizedProfile
) {
  const totalImages = normalizedProfile.images.length;
  if (totalImages <= 1) return null;

  const infoSets = [
    {
      title: "À propos",
      items: [
        { label: "Âge", value: `${normalizedProfile.age} ans`, icon: "🎂" },
        { label: "Profession", value: normalizedProfile.occupation, icon: "💼" },
        { label: "Ville", value: normalizedProfile.location, icon: "📍" },
        { label: "Distance", value: `${Math.round(normalizedProfile.distance || 0)}km`, icon: "🗺️" }
      ].filter(item => item.value && item.value.trim() !== '')
    },
    {
      title: "Style de vie",
      items: [
        { label: "Activité sociale", value: normalizedProfile.socialActivityLevel, icon: "🎉" },
        { label: "Sport", value: normalizedProfile.sportActivity, icon: "🏃‍♀️" },
        { label: "Éducation", value: normalizedProfile.educationLevel, icon: "🎓" },
        { label: "Religion", value: normalizedProfile.religion, icon: "🙏" }
      ].filter(item => item.value && item.value.trim() !== '')
    },
    {
      title: "Apparence",
      items: [
        { label: "Cheveux", value: normalizedProfile.hairColor, icon: "💇‍♀️" },
        { label: "Yeux", value: normalizedProfile.eyeColor, icon: "👁️" },
        { label: "Signe", value: normalizedProfile.zodiacSign, icon: "⭐" },
        { label: "Enfants", value: normalizedProfile.childrenStatus, icon: "👶" }
      ].filter(item => item.value && item.value.trim() !== '')
    }
  ];

  return infoSets[imageIndex % infoSets.length];
}