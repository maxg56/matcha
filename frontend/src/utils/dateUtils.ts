/**
 * Utilitaires pour gérer les dates et l'âge
 */

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export function calculateAge(birthDate: string | null | undefined): number {
  if (!birthDate) return 0;
  
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    
    // Vérifier si la date est valide
    if (isNaN(birth.getTime())) return 0;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
}

/**
 * Formate une date de naissance de manière sûre
 */
export function formatBirthDate(birthDate: string | null | undefined): string {
  if (!birthDate) return 'Date non définie';
  
  try {
    const date = new Date(birthDate);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) return 'Date invalide';
    
    return date.toLocaleDateString('fr-FR');
  } catch (error) {
    console.error('Error formatting birth date:', error);
    return 'Date invalide';
  }
}

/**
 * Affiche l'âge de manière sûre
 */
export function formatAge(age: number | null | undefined): string {
  if (!age || age === 0) return 'Age non défini';
  return `${age} ans`;
}

/**
 * Formate la dernière connexion d'un utilisateur de manière humaine
 */
export function formatLastSeen(lastSeenString?: string): string {
  if (!lastSeenString) {
    return 'Jamais connecté';
  }

  try {
    const lastSeen = new Date(lastSeenString);
    const now = new Date();
    const diffInMs = now.getTime() - lastSeen.getTime();

    // Convertir en secondes, minutes, heures, jours
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // Si la différence est négative (date future), considérer comme en ligne
    if (diffInMs < 0 || seconds < 60) {
      return 'En ligne';
    }

    // Moins d'une heure
    if (minutes < 60) {
      return `Actif il y a ${minutes} min`;
    }

    // Moins de 24 heures
    if (hours < 24) {
      return `Actif il y a ${hours}h`;
    }

    // Moins d'une semaine
    if (days < 7) {
      return `Actif il y a ${days} jour${days > 1 ? 's' : ''}`;
    }

    // Moins d'un mois
    if (weeks < 4) {
      return `Actif il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }

    // Moins d'un an
    if (months < 12) {
      return `Actif il y a ${months} mois`;
    }

    // Plus d'un an
    return `Actif il y a ${years} an${years > 1 ? 's' : ''}`;

  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date inconnue';
  }
}

/**
 * Retourne une couleur CSS basée sur la récence de la dernière connexion
 */
export function getLastSeenColor(lastSeenString?: string): string {
  if (!lastSeenString) {
    return 'text-gray-400'; // Jamais connecté
  }

  try {
    const lastSeen = new Date(lastSeenString);
    const now = new Date();
    const diffInMs = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // En ligne ou très récent (moins de 5 minutes)
    if (diffInMs < 0 || minutes < 5) {
      return 'text-green-500'; // Vert pour en ligne
    }

    // Moins d'une heure
    if (minutes < 60) {
      return 'text-green-400'; // Vert clair
    }

    // Moins de 24 heures
    if (hours < 24) {
      return 'text-yellow-500'; // Jaune pour récent
    }

    // Moins d'une semaine
    if (days < 7) {
      return 'text-orange-500'; // Orange pour modérément récent
    }

    // Plus d'une semaine
    return 'text-gray-400'; // Gris pour ancien

  } catch (error) {
    console.error('Erreur lors du calcul de la couleur:', error);
    return 'text-gray-400';
  }
}

/**
 * Détermine si l'utilisateur est considéré comme "en ligne"
 */
export function isUserOnline(lastSeenString?: string): boolean {
  if (!lastSeenString) {
    return false;
  }

  try {
    const lastSeen = new Date(lastSeenString);
    const now = new Date();
    const diffInMs = now.getTime() - lastSeen.getTime();

    // Considéré comme en ligne si dernière activité il y a moins de 5 minutes
    return diffInMs < 5 * 60 * 1000;
  } catch (error) {
    return false;
  }
}
