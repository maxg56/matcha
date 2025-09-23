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
