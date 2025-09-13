import { apiService } from './api';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export class PasswordService {
  /**
   * Demande de réinitialisation de mot de passe
   * Envoie un email avec un token de réinitialisation
   */
  static async requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
    const payload: ForgotPasswordRequest = { email };
    return await apiService.post<ForgotPasswordResponse>('/api/v1/auth/forgot-password', payload);
  }

  /**
   * Réinitialisation du mot de passe avec le token
   */
  static async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    const payload: ResetPasswordRequest = {
      token,
      new_password: newPassword
    };
    return await apiService.post<ResetPasswordResponse>('/api/v1/auth/reset-password', payload);
  }
}