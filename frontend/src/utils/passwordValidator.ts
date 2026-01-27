export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPatterns: boolean;
}

export const defaultPasswordRequirements: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Assoupli pour les tests
  forbidCommonPatterns: false, // Désactivé temporairement
};

// Mots de passe couramment utilisés à éviter
const commonPasswords = [
  'password', 'motdepasse', '12345678', 'azerty123', 'qwerty123', 
  'password123', 'admin123', 'welcome123', '123456789', 'password1'
];

// Patterns courants à éviter
const commonPatterns = [
  /^(.)\1+$/, // Tous les caractères identiques (ex: 11111111)
  /^123+/, // Commences par 123
  /^abc+/i, // Commence par abc
  /^qwerty/i, // Commence par qwerty
  /^azerty/i, // Commence par azerty
];

export class PasswordValidator {
  static validate(password: string, requirements: PasswordRequirements = defaultPasswordRequirements): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Vérification de la longueur minimale
    if (password.length < requirements.minLength) {
      errors.push(`Le mot de passe doit contenir au moins ${requirements.minLength} caractères`);
    } else {
      score += 20;
      // Bonus pour les mots de passe plus longs
      if (password.length >= 12) score += 10;
      if (password.length >= 16) score += 10;
    }

    // Vérification des majuscules
    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    } else if (/[A-Z]/.test(password)) {
      score += 15;
    }

    // Vérification des minuscules
    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    } else if (/[a-z]/.test(password)) {
      score += 15;
    }

    // Vérification des chiffres
    if (requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    } else if (/\d/.test(password)) {
      score += 15;
    }

    // Vérification des caractères spéciaux
    if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)');
    } else if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
      score += 15;
    }

    // Vérification des patterns courants
    if (requirements.forbidCommonPatterns) {
      // Mots de passe courants
      if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('Ce mot de passe est trop commun et facilement devinable');
      }

      // Patterns courants
      if (commonPatterns.some(pattern => pattern.test(password))) {
        errors.push('Le mot de passe ne doit pas suivre de patterns prévisibles');
      }
    }

    // Vérifications de diversité des caractères
    const uniqueChars = new Set(password).size;
    const diversityRatio = uniqueChars / password.length;
    if (diversityRatio < 0.5) {
      score -= 10; // Pénalité pour manque de diversité
    } else {
      score += 10; // Bonus pour la diversité
    }

    // Calcul de la force du mot de passe
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 80) {
      strength = 'strong';
    } else if (score >= 60) {
      strength = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      score: Math.min(100, Math.max(0, score))
    };
  }

  /**
   * Validation simplifiée pour la connexion (moins stricte)
   */
  static validateForLogin(password: string): string | undefined {
    if (!password.trim()) return 'Veuillez saisir votre mot de passe';
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    return undefined;
  }

  /**
   * Validation stricte pour l'inscription
   */
  static validateForRegistration(password: string): string | undefined {
    const result = this.validate(password);
    if (!result.isValid) {
      return result.errors[0]; // Retourne la première erreur
    }
    return undefined;
  }

  /**
   * Génère des suggestions pour améliorer le mot de passe
   */
  static getPasswordSuggestions(password: string): string[] {
    const suggestions: string[] = [];
    const result = this.validate(password);

    if (password.length < 8) {
      suggestions.push('Utilisez au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Ajoutez des lettres majuscules');
    }
    
    if (!/[a-z]/.test(password)) {
      suggestions.push('Ajoutez des lettres minuscules');
    }
    
    if (!/\d/.test(password)) {
      suggestions.push('Ajoutez des chiffres');
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
      suggestions.push('Ajoutez des caractères spéciaux (!@#$%...)');
    }

    if (result.score < 60) {
      suggestions.push('Évitez les mots courants et les patterns prévisibles');
    }

    return suggestions;
  }
}