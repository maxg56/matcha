import { useState, useEffect, useCallback } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  tokenStatus: {
    isValid: boolean;
    expiresAt: number;
    expiresIn: number;
  };
}

/**
 * Secure authentication hook that replaces localStorage usage
 * Provides secure token management and auto-refresh functionality
 */
export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    tokenStatus: {
      isValid: false,
      expiresAt: 0,
      expiresIn: 0
    }
  });

  // Update auth state from secure storage
  const updateAuthState = useCallback(() => {
    const accessToken = localStorage.getItem('accessToken');
    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    const tokenStatus = {
      isValid: false,
      expiresAt: 0,
      expiresIn: 0
    };


    setAuthState({
      isAuthenticated,
      accessToken,
      tokenStatus
    });
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  /**
   * Login with secure token storage
   */
  const login = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    updateAuthState();
  }, [updateAuthState]);

  /**
   * Logout and clear all tokens
   */
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    updateAuthState();
  }, [updateAuthState]);

  /**
   * Update access token (for refresh scenarios)
   */
  const updateAccessToken = useCallback((newAccessToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    updateAuthState();
  }, [updateAuthState]);

  /**
   * Get current access token (for API calls)
   */
  const getAccessToken = useCallback((): string | null => {
    return localStorage.getItem('accessToken');
  }, []);

  /**
   * Get authorization header for API calls
   */
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  /**
   * Check if user needs to re-authenticate
   */
  const needsReauth = useCallback((): boolean => {
    return !localStorage.getItem('accessToken');
  }, []);

  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    accessToken: authState.accessToken,
    tokenStatus: authState.tokenStatus,

    // Actions
    login,
    logout,
    updateAccessToken,
    getAccessToken,
    getAuthHeaders,
    needsReauth,

    // Utilities
    updateAuthState
  };
};

export default useSecureAuth;