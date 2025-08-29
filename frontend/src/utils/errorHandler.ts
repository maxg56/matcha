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
      if (lowerError.includes('username') && (lowerError.includes('exists') || lowerError.includes('taken') || lowerError.includes('déjà pris'))) {
        fieldErrors.username = 'Ce pseudo est déjà pris';
      }
      else if (lowerError.includes('email') && (lowerError.includes('exists') || lowerError.includes('taken') || lowerError.includes('déjà utilisé'))) {
        fieldErrors.email = 'Cet email est déjà utilisé';
      }
      else if (lowerError.includes('password') && lowerError.includes('weak')) {
        fieldErrors.password = 'Le mot de passe est trop faible. Utilisez au moins 8 caractères avec majuscules, minuscules et chiffres.';
      }
      else if (lowerError.includes('invalid birth') || lowerError.includes('age')) {
        fieldErrors.birthDate = 'Vous devez avoir au moins 18 ans';
      }
      else if (lowerError.includes('invalid email')) {
        fieldErrors.email = 'Format d\'email invalide';
      }
      else if (lowerError.includes('required field') || lowerError.includes('champ requis')) {
        globalError = 'Veuillez remplir tous les champs obligatoires';
      }
      else {
        globalError = 'Erreur lors de la création du compte. Vérifiez vos informations.';
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