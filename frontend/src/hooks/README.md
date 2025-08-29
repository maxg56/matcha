# Hooks Organization

Ce dossier contient tous les hooks React personnalisés organisés par catégorie :

## 📁 Structure

```
hooks/
├── auth/           # Hooks d'authentification
├── api/            # Hooks d'appels API
├── registration/   # Hooks spécifiques à l'inscription
├── ui/             # Hooks d'interface utilisateur
└── index.ts        # Point d'entrée principal
```

## 🔐 Auth (`/auth`)
- `useAuth.ts` - Gestion globale de l'authentification
- `useLogin.ts` - Logique de connexion
- `useTokenRefresh.ts` - Gestion des tokens expirés

## 🌐 API (`/api`) 
- `useDiscoverProfiles.ts` - Récupération des profils à découvrir
- `useEditProfile.ts` - Modification de profil
- `useFilters.ts` - Gestion des filtres de recherche

## 📝 Registration (`/registration`)
- `useAvailabilityCheck.ts` - Vérification disponibilité username/email
- `useEmailVerification.ts` - Gestion de la vérification email
- `useImageUpload.ts` - Upload d'images avec retry
- `useRegistration.ts` - Logique globale d'inscription
- `useRegistrationSubmission.ts` - Soumission et finalisation

## 🎨 UI (`/ui`)
- `useNotifications.ts` - Dispatch d'événements de notification
- `useProfileNotifications.ts` - Notifications spécifiques au profil
- `useTheme.ts` - Gestion des thèmes
- `useToast.ts` - Système de toasts

## 📦 Usage

```typescript
// Import depuis l'index principal
import { useAuth, useImageUpload, useToast } from '@/hooks';

// Ou import direct si nécessaire
import { useTokenRefresh } from '@/hooks/auth/useTokenRefresh';
```

## 🎯 Principes

- **Séparation des responsabilités** : Chaque hook a une responsabilité claire
- **Réutilisabilité** : Les hooks sont découplés et réutilisables
- **Logique métier externalisée** : Toute la logique complexe est sortie des stores
- **Types stricts** : Tous les hooks sont typés avec TypeScript