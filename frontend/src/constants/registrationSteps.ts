import {
  User,
  Calendar,
  Palette,
  Wine,
  Activity,
  Heart,
  Star
} from 'lucide-react';

interface RegistrationStep {
  id: number;
  title: string;
  icon: any;
}

export const registrationSteps: RegistrationStep[] = [
  { id: 1, title: 'Compte', icon: User },
  { id: 2, title: 'Infos de base', icon: Calendar },
  { id: 3, title: 'Apparence', icon: Palette },
  { id: 4, title: 'Style de vie', icon: Wine },
  { id: 5, title: 'Activité', icon: Activity },
  { id: 6, title: 'Personnel', icon: Heart },
  { id: 7, title: 'Intérêts', icon: Star }
];

export const stepDescriptions = {
  1: "Créez votre compte avec vos informations de base",
  2: "Renseignez vos informations personnelles",
  3: "Décrivez votre apparence physique",
  4: "Partagez votre style de vie",
  5: "Indiquez votre niveau d'activité et d'éducation",
  6: "Complétez votre profil personnel",
  7: "Sélectionnez vos centres d'intérêt"
};
