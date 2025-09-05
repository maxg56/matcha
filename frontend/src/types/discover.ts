export interface ProfileImage {
  id?: number;
  url: string;
  is_primary: boolean;
  order_index: number;
}

export interface DiscoverProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  bio?: string;
  location?: string;
  occupation?: string;
  interests: string[];
  images: ProfileImage[];
  distance?: number;
  fame_rating: number;
  is_online: boolean;
  last_seen: string;
  compatibility_score?: number;
}

export interface Match {
  id: number;
  user: DiscoverProfile;
  matched_at: string;
  is_mutual: boolean;
}

export interface LikeResponse {
  success: boolean;
  is_match: boolean;
  match_id?: number;
  message?: string;
}

export interface DiscoverFilters {
  age_min?: number;
  age_max?: number;
  distance_max?: number;
  fame_min?: number;
  fame_max?: number;
  interests?: string[];
  location?: string;
}

export interface DiscoverState {
  profiles: DiscoverProfile[];
  currentIndex: number;
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  hasMoreProfiles: boolean;
  filters: DiscoverFilters;
}

export interface DiscoverActions {
  // Profile discovery
  fetchProfiles: (filters?: DiscoverFilters) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  
  // Matches management
  fetchMatches: () => Promise<void>;
  
  // User interactions
  likeProfile: (profileId: number) => Promise<void>;
  dislikeProfile: (profileId: number) => Promise<void>;
  superLikeProfile: (profileId: number) => Promise<void>;
  reportProfile: (profileId: number, reason: string) => Promise<void>;
  blockProfile: (profileId: number) => Promise<void>;
  
  // Navigation
  nextProfile: () => void;
  goToProfile: (index: number) => void;
  
  // Filters
  updateFilters: (filters: Partial<DiscoverFilters>) => void;
  clearFilters: () => void;
  
  // State management
  resetProfiles: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export type DiscoverStore = DiscoverState & DiscoverActions;

// UI types for compatibility with existing components
export interface UIProfile {
  id: string;
  name: string;
  age: number;
  images: string[];
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  distance: number;
}

// Transform function to convert API profile to UI profile
export const transformToUIProfile = (profile: DiscoverProfile): UIProfile => ({
  id: profile.id.toString(),
  name: profile.first_name,
  age: profile.age,
  images: profile.images
    .sort((a, b) => a.order_index - b.order_index)
    .map(img => img.url),
  bio: profile.bio || '',
  location: profile.location || '',
  occupation: profile.occupation || '',
  interests: profile.interests,
  distance: profile.distance || 0,
});