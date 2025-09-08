import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/auth';

interface AuthResponse {
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

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export interface AuthContextType extends AuthState {
  login: (login: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (login: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await authService.login({ login, password });
      
      // Store tokens
      authService.setTokens(response.access_token, response.refresh_token);
      
      // Update state with user data
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await authService.register(userData);
      
      // Store tokens
      authService.setTokens(response.access_token, response.refresh_token);
      
      // Update state with user data
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint if authenticated
      if (authService.isAuthenticated()) {
        await authService.logout();
      }
    } catch (error) {
      // Log error but don't prevent logout
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage and state
      authService.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuth = async (): Promise<void> => {
    const accessToken = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }

    try {
      // Verify current token
      const verifyResponse = await authService.verifyToken();
      
      if (verifyResponse.valid) {
        // Token is valid, but we need user data
        // Since verify endpoint doesn't return full user data,
        // we'll create a minimal user object from the token
        const user: User = {
          id: parseInt(verifyResponse.user_id),
          username: '', // Will be filled by user profile fetch
          email: '', // Will be filled by user profile fetch
        };
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        throw new Error('Token invalid');
      }
    } catch {
      // Token invalid, try to refresh
      try {
        const tokenResponse = await authService.refreshToken(refreshToken);
        authService.setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
        
        // Try to verify the new token
        const verifyResponse = await authService.verifyToken();
        if (verifyResponse.valid) {
          const user: User = {
            id: parseInt(verifyResponse.user_id),
            username: '',
            email: '',
          };
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          throw new Error('New token invalid');
        }
      } catch {
        // Refresh failed, logout
        authService.clearTokens();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;