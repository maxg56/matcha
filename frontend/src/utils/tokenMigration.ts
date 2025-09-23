/**
 * Utility functions to help migrate from localStorage to secure storage
 * This file provides helpers for components that need to transition
 */

import secureStorage from '../services/secureStorage';

/**
 * Get access token securely (replaces localStorage.getItem('accessToken'))
 */
export const getAccessToken = (): string | null => {
  return secureStorage.getAccessToken();
};

/**
 * Get refresh token securely (replaces localStorage.getItem('refreshToken'))
 */
export const getRefreshToken = (): string | null => {
  return secureStorage.getRefreshToken();
};

/**
 * Check if user is authenticated (replaces !!localStorage.getItem('accessToken'))
 */
export const isAuthenticated = (): boolean => {
  return secureStorage.isAuthenticated();
};

/**
 * Set tokens securely (replaces localStorage.setItem for tokens)
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  secureStorage.setTokens(accessToken, refreshToken);
};

/**
 * Clear all tokens (replaces localStorage.removeItem for tokens)
 */
export const clearTokens = (): void => {
  secureStorage.clearTokens();
};

/**
 * Get authorization header for API calls
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = secureStorage.getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Migration helper - automatically migrates from localStorage if found
 * Call this once in your app initialization
 */
export const migrateFromLocalStorage = (): void => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      console.info('Migrating tokens from localStorage to secure storage...');
      secureStorage.setTokens(accessToken, refreshToken);

      // Clear localStorage after migration
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.info('Token migration completed successfully');
    }
  } catch (error) {
    console.error('Error during token migration:', error);
  }
};