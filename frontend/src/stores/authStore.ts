import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService, type RegisterRequest } from '@/services/auth';
import { useNotificationStore } from './notificationStore';
import { useUserStore } from './userStore';
import { useChatStore } from './chatStore';
import { webSocketService } from '@/services/websocket';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  latitude?: number;
  longitude?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (login: string, password: string) => Promise<void>;
  register: (userData: RegisterData | RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  sex_pref: string;
}

interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setError: (error) => set({ error }),
        setLoading: (isLoading) => set({ isLoading }),
        clearError: () => set({ error: null }),

        login: async (login: string, password: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response: AuthResponse = await authService.login({ login, password });
            
            authService.setTokens(response.access_token, response.refresh_token);
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        register: async (userData: RegisterData | RegisterRequest) => {
          set({ isLoading: true, error: null });
          
          try {
            const response: AuthResponse = await authService.register(userData);
            
            authService.setTokens(response.access_token, response.refresh_token);
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            if (authService.isAuthenticated()) {
              await authService.logout();
            }
          } catch (error) {
            console.error('Logout API call failed:', error);
            set({ error: error instanceof Error ? error.message : 'Logout failed' });
          } finally {
            authService.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });

            // Disconnect WebSocket connections
            webSocketService.disconnect();

            // Clear all user-specific stores
            useNotificationStore.getState().reset();
            useUserStore.getState().reset();
            useChatStore.getState().reset();
            // Note: We don't reset filters as users may want to keep their filter preferences
          }
        },

        checkAuth: async () => {
          const accessToken = authService.getAccessToken();
          const refreshToken = authService.getRefreshToken();

          if (!accessToken || !refreshToken) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          set({ isLoading: true });

          try {
            const verifyResponse = await authService.verifyToken();
            
            if (verifyResponse.valid) {
              const user: User = {
                id: parseInt(verifyResponse.user_id),
                username: '',
                email: '',
              };
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              throw new Error('Token invalid');
            }
          } catch {
            try {
              const tokenResponse = await authService.refreshToken(refreshToken);
              authService.setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
              
              const verifyResponse = await authService.verifyToken();
              if (verifyResponse.valid) {
                const user: User = {
                  id: parseInt(verifyResponse.user_id),
                  username: '',
                  email: '',
                };
                set({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
              } else {
                throw new Error('New token invalid');
              }
            } catch {
              authService.clearTokens();

              // Disconnect WebSocket connections
              webSocketService.disconnect();

              // Clear all user-specific stores
              useNotificationStore.getState().reset();
              useUserStore.getState().reset();
              useChatStore.getState().reset();

              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: 'AuthStore' }
  )
);

export type { User, RegisterData, AuthResponse };