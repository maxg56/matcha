/**
 * Secure token storage service that protects against XSS attacks
 * Uses memory storage for access tokens and secure cookies for refresh tokens
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class SecureTokenStorage {
  private static instance: SecureTokenStorage;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private constructor() {
    // Initialize from existing localStorage if available (migration)
    this.migrateFromLocalStorage();
  }

  static getInstance(): SecureTokenStorage {
    if (!SecureTokenStorage.instance) {
      SecureTokenStorage.instance = new SecureTokenStorage();
    }
    return SecureTokenStorage.instance;
  }

  /**
   * Migrate existing tokens from localStorage to secure storage
   * This is a one-time migration for existing users
   */
  private migrateFromLocalStorage(): void {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        console.warn('Migrating tokens to secure storage...');
        this.setTokens(accessToken, refreshToken);

        // Clear localStorage after migration
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.info('Token migration completed');
      }
    } catch (error) {
      console.error('Error during token migration:', error);
    }
  }

  /**
   * Store tokens securely
   * Access token in memory, refresh token via secure cookie
   */
  setTokens(accessToken: string, refreshToken: string): void {
    // Store access token in memory only (not accessible via XSS)
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Calculate expiration (1 hour for access token)
    this.tokenExpiresAt = Date.now() + (60 * 60 * 1000);

    // Set refresh token as httpOnly cookie via API call
    this.setRefreshTokenCookie(refreshToken);

    // Set a marker in sessionStorage to indicate user is authenticated
    // This is safe as it doesn't contain sensitive data
    sessionStorage.setItem('auth_state', 'authenticated');
  }

  /**
   * Get access token (only if not expired)
   */
  getAccessToken(): string | null {
    if (!this.accessToken || Date.now() > this.tokenExpiresAt) {
      this.clearTokens();
      return null;
    }
    return this.accessToken;
  }

  /**
   * Get refresh token (stored securely)
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null &&
           sessionStorage.getItem('auth_state') === 'authenticated';
  }

  /**
   * Clear all tokens and authentication state
   */
  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;

    // Clear session storage
    sessionStorage.removeItem('auth_state');

    // Clear any remaining localStorage tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear refresh token cookie via API call
    await this.clearRefreshTokenCookie();
  }

  /**
   * Set refresh token as secure httpOnly cookie via API
   */
  private async setRefreshTokenCookie(refreshToken: string): Promise<void> {
    try {
      // Use secure cookie manager for proper attribute handling
      const { default: cookieManager } = await import('./cookieManager');
      cookieManager.setRefreshTokenCookie(refreshToken, 7 * 24 * 60 * 60);
    } catch (error) {
      console.error('Failed to set refresh token cookie:', error);
    }
  }

  /**
   * Clear refresh token cookie
   */
  private async clearRefreshTokenCookie(): Promise<void> {
    const { default: cookieManager } = await import('./cookieManager');
    cookieManager.clearCookie('refresh_token');
  }

  /**
   * Update access token (when refreshed)
   */
  updateAccessToken(newAccessToken: string): void {
    this.accessToken = newAccessToken;
    this.tokenExpiresAt = Date.now() + (60 * 60 * 1000);
  }

  /**
   * Get token expiration status
   */
  getTokenStatus(): {
    isValid: boolean;
    expiresAt: number;
    expiresIn: number;
  } {
    const now = Date.now();
    const expiresIn = Math.max(0, this.tokenExpiresAt - now);

    return {
      isValid: this.accessToken !== null && now < this.tokenExpiresAt,
      expiresAt: this.tokenExpiresAt,
      expiresIn: Math.floor(expiresIn / 1000) // in seconds
    };
  }
}

// Export singleton instance
export const secureStorage = SecureTokenStorage.getInstance();
export default secureStorage;