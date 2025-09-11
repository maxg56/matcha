// Auth hooks
export { useAuth } from './auth/useAuth';
export { useLogin } from './auth/useLogin';
export { useTokenRefresh } from './auth/useTokenRefresh';

// API hooks
export { useDiscoverProfiles } from './api/useDiscoverProfiles';
export { useEditProfile } from './api/useEditProfile';
export { useFilters } from './api/useFilters';
export { useMatches } from './useMatches';

// Registration hooks
export { useAvailabilityCheck } from './registration/useAvailabilityCheck';
export { useEmailVerification } from './registration/useEmailVerification';
export { useImageUpload } from './registration/useImageUpload';
export { useRegistration } from './registration/useRegistration';
export { useRegistrationLogic } from './registration/useRegistrationLogic';
export { useRegistrationSubmission } from './registration/useRegistrationSubmission';
export { useProfileUpdate } from './registration/useProfileUpdate';

// UI hooks
export { useNotifications } from './ui/useNotifications';
export { useProfileNotifications } from './ui/useProfileNotifications';
export { useTheme } from './ui/useTheme';
export { useToast } from './ui/useToast';

// NOTE: NotifImage.ts is not exported as it's an internal utility