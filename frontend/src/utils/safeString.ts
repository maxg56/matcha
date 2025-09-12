/**
 * Utilitaires pour manipuler les chaînes de caractères de manière sécurisée
 * Évite les erreurs TypeError quand les chaînes sont undefined ou vides
 */

/**
 * Récupère la première lettre d'une chaîne de manière sécurisée
 * @param str - La chaîne à traiter (peut être undefined/null/vide)
 * @param fallback - Valeur de fallback (par défaut: 'U')
 * @returns La première lettre en majuscule
 */
export function getInitial(str?: string | null, fallback = 'U'): string {
  if (!str || typeof str !== 'string' || str.length === 0) {
    return fallback.charAt(0).toUpperCase();
  }
  return str.charAt(0).toUpperCase();
}

/**
 * Récupère les initiales d'un nom complet de manière sécurisée
 * @param firstName - Prénom (peut être undefined/null/vide)  
 * @param lastName - Nom (peut être undefined/null/vide)
 * @param fallback - Valeur de fallback pour chaque initial (par défaut: 'U')
 * @returns Les initiales en majuscules (ex: "AB")
 */
export function getInitials(firstName?: string | null, lastName?: string | null, fallback = 'U'): string {
  const firstInitial = getInitial(firstName, fallback);
  const lastInitial = getInitial(lastName, fallback);
  return firstInitial + lastInitial;
}

/**
 * Construit un nom d'affichage de manière sécurisée
 * @param profile - Objet profil pouvant contenir name, first_name, last_name
 * @param fallback - Nom de fallback (par défaut: 'Utilisateur')
 * @returns Nom d'affichage sécurisé
 */
export function getDisplayName(
  profile: {
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  },
  fallback = 'Utilisateur'
): string {
  if (profile.name && profile.name.length > 0) {
    return profile.name;
  }
  
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  
  if (profile.first_name && profile.first_name.length > 0) {
    return profile.first_name;
  }
  
  return fallback;
}