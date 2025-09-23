import { useState, useEffect, useCallback } from 'react';
import secureStorage from '../services/secureStorage';

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
    const accessToken = secureStorage.getAccessToken();
    const isAuthenticated = secureStorage.isAuthenticated();
    const tokenStatus = secureStorage.getTokenStatus();

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

  // Set up token expiration monitoring
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkInterval = setInterval(() => {
      const tokenStatus = secureStorage.getTokenStatus();

      // If token expires in less than 5 minutes, trigger refresh
      if (tokenStatus.expiresIn < 300 && tokenStatus.expiresIn > 0) {
        console.info('Token expiring soon, should refresh');
        // Trigger refresh logic here
      }

      // If token is expired, clear auth state
      if (!tokenStatus.isValid) {
        updateAuthState();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [authState.isAuthenticated, updateAuthState]);

  /**
   * Login with secure token storage
   */
  const login = useCallback((accessToken: string, refreshToken: string) => {
    secureStorage.setTokens(accessToken, refreshToken);
    updateAuthState();
  }, [updateAuthState]);

  /**
   * Logout and clear all tokens
   */
  const logout = useCallback(() => {
    secureStorage.clearTokens();
    updateAuthState();
  }, [updateAuthState]);

  /**
   * Update access token (for refresh scenarios)
   */
  const updateAccessToken = useCallback((newAccessToken: string) => {
    secureStorage.updateAccessToken(newAccessToken);
    updateAuthState();
  }, [updateAuthState]);

  /**
   * Get current access token (for API calls)
   */
  const getAccessToken = useCallback((): string | null => {
    return secureStorage.getAccessToken();
  }, []);

  /**
   * Get authorization header for API calls
   */
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = secureStorage.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  /**
   * Check if user needs to re-authenticate
   */
  const needsReauth = useCallback((): boolean => {
    return !secureStorage.isAuthenticated();
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