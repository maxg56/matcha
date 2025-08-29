import { 
  User, 
  Calendar, 
  Palette, 
  Wine, 
  Activity, 
  Heart, 
  Star,
  Mail,
  Image,
  type LucideIcon
} from 'lucide-react';

interface RegistrationStep {
  id: number;
  title: string;
  icon: LucideIcon;
}

export const registrationSteps: RegistrationStep[] = [
  { id: 1, title: 'Compte', icon: User },
  { id: 2, title: 'Vérification email', icon: Mail },
  { id: 3, title: 'Infos de base', icon: Calendar },
  { id: 4, title: 'Apparence', icon: Palette },
  { id: 5, title: 'Style de vie', icon: Wine },
  { id: 6, title: 'Activité', icon: Activity },
  { id: 7, title: 'Personnel', icon: Heart },
  { id: 8, title: 'Intérêts', icon: Star },
  { id: 9, title: 'Upload', icon: Image }
];

export const stepDescriptions = {
  1: "Créez votre compte avec vos informations de base",
  2: "Vérifiez votre email avec le code de vérification",
  3: "Renseignez vos informations personnelles",
  4: "Décrivez votre apparence physique",
  5: "Partagez votre style de vie",
  6: "Indiquez votre niveau d'activité et d'éducation",
  7: "Complétez votre profil personnel",
  8: "Sélectionnez vos centres d'intérêt",
  9: "Téléchargez vos photos"
};