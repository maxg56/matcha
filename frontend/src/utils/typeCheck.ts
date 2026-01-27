// Fichier de vérification des imports/exports - peut être supprimé après test

// Test des imports de services
import { preferencesService } from '@/services/preferencesService';

// Test des imports de hooks
import { usePreferences, useMatchingFilter } from '@/hooks';

// Vérifications de compilation TypeScript 
// Les types sont vérifiés lors de l'utilisation réelle des interfaces

// Export unused imports to satisfy linter
export { preferencesService, usePreferences, useMatchingFilter };