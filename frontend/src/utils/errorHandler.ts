export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export interface FieldErrors {
  [key: string]: string;
}

export interface ParsedError {
  fieldErrors: FieldErrors;
  globalError: string;
}

interface APIError {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
}

export class ErrorHandler {
  static createError(code: string, message: string, details?: unknown): AppError {
    return {
      code,
      message,
      details
    };
  }

  // Mapping intelligent des erreurs API vers les champs appropriés
  static parseAPIError(errorMessage: string, context: 'login' | 'registration' | 'profile' | 'general' = 'general'): ParsedError {
    const lowerError = errorMessage.toLowerCase();
    const fieldErrors: FieldErrors = {};
    let globalError = '';

    // Erreurs communes à tous les contextes
    if (lowerError.includes('network') || lowerError.includes('réseau')) {
      globalError = '🔌 Problème de connexion réseau. Vérifiez votre connexion.';
    }
    else if (lowerError.includes('server error') || lowerError.includes('erreur serveur') || lowerError.includes('500')) {
      globalError = '⚠️ Erreur serveur temporaire. Veuillez réessayer dans quelques instants.';
    }
    else if (lowerError.includes('too many attempts') || lowerError.includes('trop de tentatives')) {
      globalError = '🔒 Trop de tentatives. Attendez quelques minutes avant de réessayer.';
    }
    else if (lowerError.includes('account suspended') || lowerError.includes('compte suspendu')) {
      globalError = '⚠️ Votre compte a été suspendu. Contactez le support.';
    }
    
    // Erreurs spécifiques au contexte de connexion
    else if (context === 'login') {
      if (lowerError.includes('user not found') || lowerError.includes('utilisateur introuvable')) {
        fieldErrors.login = 'Cet utilisateur n\'existe pas';
      }
      else if (lowerError.includes('invalid password') || lowerError.includes('mot de passe incorrect')) {
        fieldErrors.password = 'Mot de passe incorrect';
      }
      else if (lowerError.includes('invalid email format') || lowerError.includes('format email invalide')) {
        fieldErrors.login = 'Format d\'email invalide';
      }
      else {
        globalError = 'Identifiants incorrects. Vérifiez votre pseudo/email et mot de passe.';
      }
    }
    
    // Erreurs spécifiques au contexte d'inscription
    else if (context === 'registration') {
      // Erreurs de champs spécifiques
      if (lowerError.includes('username') && (lowerError.includes('exists') || lowerError.includes('taken') || lowerError.includes('déjà pris'))) {
        fieldErrors.username = '❌ Ce pseudo est déjà pris. Essayez-en un autre.';
      }
      else if (lowerError.includes('username') && lowerError.includes('invalid')) {
        fieldErrors.username = '❌ Le pseudo doit contenir entre 3 et 20 caractères, lettres, chiffres et tirets uniquement.';
      }
      else if (lowerError.includes('email') && (lowerError.includes('exists') || lowerError.includes('taken') || lowerError.includes('déjà utilisé'))) {
        fieldErrors.email = '📧 Cet email est déjà utilisé. Avez-vous déjà un compte ?';
      }
      else if (lowerError.includes('email') && (lowerError.includes('invalid') || lowerError.includes('format'))) {
        fieldErrors.email = '❌ Format d\'email invalide. Exemple : nom@domaine.com';
      }
      else if (lowerError.includes('password') && lowerError.includes('weak')) {
        fieldErrors.password = '🔒 Mot de passe trop faible. Min. 8 caractères : majuscules, minuscules, chiffres.';
      }
      else if (lowerError.includes('password') && lowerError.includes('short')) {
        fieldErrors.password = '📏 Le mot de passe doit contenir au moins 8 caractères.';
      }
      else if (lowerError.includes('password') && lowerError.includes('match')) {
        fieldErrors.confirmPassword = '🔄 Les mots de passe ne correspondent pas.';
      }
      else if (lowerError.includes('firstname') || lowerError.includes('prénom')) {
        fieldErrors.firstName = '👤 Le prénom est requis et doit contenir au moins 2 caractères.';
      }
      else if (lowerError.includes('lastname') || lowerError.includes('nom')) {
        fieldErrors.lastName = '👤 Le nom est requis et doit contenir au moins 2 caractères.';
      }
      else if (lowerError.includes('birth') && (lowerError.includes('invalid') || lowerError.includes('age'))) {
        fieldErrors.birthDate = '🎂 Vous devez avoir au moins 18 ans pour vous inscrire.';
      }
      else if (lowerError.includes('birth') && lowerError.includes('required')) {
        fieldErrors.birthDate = '📅 La date de naissance est requise.';
      }
      else if (lowerError.includes('gender') && lowerError.includes('required')) {
        fieldErrors.gender = '⚧ Veuillez sélectionner votre genre.';
      }
      else if (lowerError.includes('sex_pref') || lowerError.includes('préférence')) {
        fieldErrors.sexPref = '💝 Veuillez indiquer vos préférences de rencontre.';
      }
      else if (lowerError.includes('verification') && lowerError.includes('code')) {
        fieldErrors.emailVerificationCode = '🔢 Code de vérification invalide. Vérifiez le code reçu par email.';
      }
      else if (lowerError.includes('verification') && lowerError.includes('expired')) {
        globalError = '⏰ Le code de vérification a expiré. Un nouveau code a été envoyé.';
      }
      else if (lowerError.includes('email') && lowerError.includes('not verified')) {
        globalError = '📧 Veuillez vérifier votre email avant de continuer.';
      }
      // Erreurs de connexion/système
      else if (lowerError.includes('network') || lowerError.includes('connexion')) {
        globalError = '🌐 Problème de connexion. Vérifiez votre réseau et réessayez.';
      }
      else if (lowerError.includes('timeout') || lowerError.includes('délai')) {
        globalError = '⏳ La requête a pris trop de temps. Veuillez réessayer.';
      }
      else if (lowerError.includes('required field') || lowerError.includes('champ requis')) {
        globalError = '📝 Veuillez remplir tous les champs obligatoires pour continuer.';
      }
      else if (lowerError.includes('rate limit') || lowerError.includes('trop de tentatives')) {
        globalError = '🚫 Trop de tentatives. Attendez quelques minutes avant de réessayer.';
      }
      // Erreur générique améliorée
      else {
        globalError = '❌ Erreur lors de la création du compte. Vérifiez vos informations et réessayez.';
      }
    }
    
    // Erreurs spécifiques au profil
    else if (context === 'profile') {
      if (lowerError.includes('bio') && lowerError.includes('short')) {
        fieldErrors.bio = 'La biographie doit contenir au moins 50 caractères';
      }
      else if (lowerError.includes('image') || lowerError.includes('photo')) {
        fieldErrors.images = 'Erreur lors du téléchargement des photos';
      }
      else if (lowerError.includes('location') || lowerError.includes('city')) {
        fieldErrors.currentCity = 'Ville invalide';
      }
      else {
        globalError = 'Erreur lors de la mise à jour du profil';
      }
    }
    
    // Erreur par défaut
    else {
      globalError = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
    }

    return { fieldErrors, globalError };
  }

  static handleRegistrationError(error: APIError): AppError {
    const errorMessage = error.message || 'Erreur inconnue';
    
    if (error.response?.status === 400) {
      return this.createError('VALIDATION_ERROR', errorMessage, error.response.data);
    }
    
    if (error.response?.status === 409) {
      return this.createError('USER_EXISTS', errorMessage);
    }

    if (error.response?.status && error.response.status >= 500) {
      return this.createError('SERVER_ERROR', 'Erreur serveur, veuillez réessayer plus tard');
    }

    return this.createError('UNKNOWN_ERROR', errorMessage);
  }

  static handleNetworkError(): AppError {
    return this.createError('NETWORK_ERROR', 'Problème de connexion réseau');
  }

  static formatErrorMessage(error: AppError): string {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return error.message;
      case 'USER_EXISTS':
        return error.message;
      case 'SERVER_ERROR':
        return error.message;
      case 'NETWORK_ERROR':
        return error.message;
      default:
        return error.message || 'Une erreur inattendue s\'est produite';
    }
  }
}