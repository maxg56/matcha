export { useAuthStore } from './authStore';
export { useUserStore } from './userStore';
export { useDiscoverStore } from './discoverStore';
export { useChatStore } from './chatStore';
export { useFiltersStore, defaultFilters } from './filtersStore';
export { useRegistrationStore } from './registrationStore';
// export { useNewRegistrationStore } from './newRegistrationStore';
// export { useImageUploadStore } from './imageUploadStore';

export type { User, RegisterData, AuthResponse } from './authStore';
export type { UserProfile } from './userStore';
export type { Profile, Match, LikeAction } from './discoverStore';
export type { Message, Conversation } from './chatStore';
export type { FilterState } from './filtersStore';
export type { RegistrationData, FieldValidationErrors } from './registrationStore';
export type { UploadedImage } from './imageUploadStore';