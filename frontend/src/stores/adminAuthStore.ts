import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { adminService } from '@/services/admin';

interface AdminUser {
  id: number;
  email: string;
  role: string;
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AdminAuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setAdminUser: (user: AdminUser | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

interface AdminAuthResponse {
  message: string;
  admin: AdminUser;
  access_token: string;
  token_type: string;
  expires_in: number;
}

const useAdminAuthStore = create<AdminAuthState & AdminAuthActions>()(
  devtools(
    persist(
      (set) => ({
        // State
        adminUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });

            // For now, we'll use the regular user login and check admin status
            // In production, this should use a dedicated admin login endpoint
            const response = await fetch('/api/v1/admin/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const data: AdminAuthResponse = await response.json();

            // Store the admin token separately
            localStorage.setItem('adminToken', data.access_token);

            set({
              adminUser: data.admin,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        logout: () => {
          localStorage.removeItem('adminToken');
          set({
            adminUser: null,
            isAuthenticated: false,
            error: null,
          });
        },

        clearError: () => {
          set({ error: null });
        },

        checkAuth: async () => {
          const token = localStorage.getItem('adminToken');
          if (!token) {
            set({ isAuthenticated: false });
            return;
          }

          try {
            // Verify token is still valid by making a request
            await adminService.getAdminStats();
            set({ isAuthenticated: true });
          } catch {
            // Token is invalid, clear it
            localStorage.removeItem('adminToken');
            set({ isAuthenticated: false });
          }
        },

        setAdminUser: (user) => {
          set({ adminUser: user });
        },

        setError: (error) => {
          set({ error });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'admin-auth-storage',
        partialize: (state) => ({
          adminUser: state.adminUser,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'admin-auth-store',
    }
  )
);

export { useAdminAuthStore };
export type { AdminUser, AdminAuthState, AdminAuthActions };
