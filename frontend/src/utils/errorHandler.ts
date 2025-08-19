export interface AppError {
  code: string;
  message: string;
  details?: unknown;
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

  static handleRegistrationError(error: APIError): AppError {
    if (error.response?.status === 400) {
      return this.createError('VALIDATION_ERROR', 'Données invalides', error.response.data);
    }
    
    if (error.response?.status === 409) {
      return this.createError('USER_EXISTS', 'Un utilisateur avec cet email existe déjà');
    }

    if (error.response?.status && error.response.status >= 500) {
      return this.createError('SERVER_ERROR', 'Erreur serveur, veuillez réessayer plus tard');
    }

    return this.createError('UNKNOWN_ERROR', 'Une erreur inattendue s\'est produite');
  }

  static handleNetworkError(): AppError {
    return this.createError('NETWORK_ERROR', 'Problème de connexion réseau');
  }

  static formatErrorMessage(error: AppError): string {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return `Erreur de validation: ${error.message}`;
      case 'USER_EXISTS':
        return error.message;
      case 'SERVER_ERROR':
        return error.message;
      case 'NETWORK_ERROR':
        return error.message;
      default:
        return 'Une erreur inattendue s\'est produite';
    }
  }
}