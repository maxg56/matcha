import { apiService } from './api';

export interface LoginRequest {
  login: string; // username or email
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  birth_date: string; // ISO date string
  gender: string;
  sex_pref: string;
}

export interface CheckAvailabilityRequest {
  username?: string;
  email?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AvailabilityResponse {
  status: string;
  available: boolean;
  message?: string;
  suggestions?: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user_id: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/api/v1/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/api/v1/auth/register', userData);
  }

  async logout(): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/v1/auth/logout');
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiService.post<TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
  }

  async verifyToken(): Promise<VerifyTokenResponse> {
    return apiService.get<VerifyTokenResponse>('/api/v1/auth/verify');
  }

  async checkAvailability(data: CheckAvailabilityRequest): Promise<AvailabilityResponse> {
    return apiService.post<AvailabilityResponse>('/api/v1/auth/check-availability', data);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/v1/auth/forgot-password', { email });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/v1/auth/reset-password', data);
  }

  // Token management helpers
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();