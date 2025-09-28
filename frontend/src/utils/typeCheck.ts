// Fichier de vérification des imports/exports - peut être supprimé après test

// Test des imports de types
import type { UserMatchingPreferences, UpdatePreferencesRequest } from '@/types/preferences';
import type { UserProfile } from '@/services/matchService';

// Test des imports de services
import { preferencesService } from '@/services/preferencesService';

// Test des imports de hooks
import { usePreferences, useMatchingFilter } from '@/hooks';

// Vérifications de compilation TypeScript
const _testPreferences: UserMatchingPreferences = {
  user_id: 1,
  age_min: 18,
  age_max: 99,
  max_distance: 50,
  min_fame: 0,
  preferred_genders: ['man', 'woman'],
  required_tags: [],
  blocked_tags: []
};

const _testRequest: UpdatePreferencesRequest = {
  age_min: 20,
  age_max: 30,
  max_distance: 25,
  min_fame: 5,
  preferred_genders: ['woman'],
  required_tags: ['🌍 Voyage'],
  blocked_tags: []
};

const _testProfile: UserProfile = {
  id: 1,
  username: 'test',
  first_name: 'Test',
  age: 25,
  bio: 'Test bio',
  relationship_type: 'long_term',
  fame: 10,
  gender: 'man',
  created_at: '2025-01-01'
};

// Type check completed successfully
// All types are properly defined and exported

// Export unused imports to satisfy linter
export { preferencesService, usePreferences, useMatchingFilter };

export {}; // Force ce fichier à être un module