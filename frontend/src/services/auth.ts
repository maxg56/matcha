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
  // Additional required fields based on backend validation
  relationship_type?: string;
  height?: number;
  hair_color?: string;
  eye_color?: string;
  skin_color?: string;
  alcohol_consumption?: string;
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
  social_activity_level?: string;
  sport_activity?: string;
  education_level?: string;
  bio?: string;
  birth_city?: string;
  current_city?: string;
  job?: string;
  religion?: string;
  children_status?: string;
  political_view?: string;
  tags?: string[];
  images?: string[];
}

// Remove ExtendedRegisterRequest - all fields now in RegisterRequest

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

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
  verification_code: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/api/v1/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Send all data in a single request to the backend
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

  async checkUsernameAvailability(username: string): Promise<AvailabilityResponse> {
    return this.checkAvailability({ username });
  }

  async checkEmailAvailability(email: string): Promise<AvailabilityResponse> {
    return this.checkAvailability({ email });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/v1/auth/forgot-password', { email });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/v1/auth/reset-password', data);
  }

  async sendEmailVerification(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/v1/auth/send-email-verification', { email });
  }

  async verifyEmail(email: string, verification_code: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/v1/auth/verify-email', { 
      email, 
      verification_code 
    });
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