// Types centralisés pour les préférences de matching

// Types pour les préférences lifestyle
export type LifestylePreference = 'any' | 'smoker' | 'non_smoker' | 'drinker' | 'non_drinker' | 'user' | 'non_user';
export type ReligionPreference = 'any' | 'same' | 'different';

export interface UserMatchingPreferences {
  id?: number;
  user_id: number;
  age_min: number;
  age_max: number;
  max_distance: number;
  min_fame: number;
  preferred_genders: string[];
  required_tags: string[];
  blocked_tags: string[];

  // Lifestyle preferences
  smoking_preference?: string;
  alcohol_preference?: string;
  drugs_preference?: string;
  cannabis_preference?: string;

  // Religious preferences
  religion_preference?: string;
  blocked_religions?: string[];

  created_at?: string;
  updated_at?: string;
}

export interface PreferencesResponse {
  preferences: UserMatchingPreferences;
}

export interface UpdatePreferencesRequest {
  age_min: number;
  age_max: number;
  max_distance: number;
  min_fame: number;
  preferred_genders: string[];
  required_tags: string[];
  blocked_tags: string[];

  // Lifestyle preferences (optional in requests)
  smoking_preference?: string;
  alcohol_preference?: string;
  drugs_preference?: string;
  cannabis_preference?: string;

  // Religious preferences (optional in requests)
  religion_preference?: string;
  blocked_religions?: string[];
}

export interface UpdatePreferencesResponse {
  message: string;
  preferences: UserMatchingPreferences;
}