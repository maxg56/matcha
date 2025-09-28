/**
 * Secure Cookie Manager
 * Centralizes cookie management with security best practices
 * Prevents "Partitioned" warnings and ensures compliance with modern browser policies
 */

export interface CookieOptions {
  maxAge?: number;        // in seconds
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;       // Requires HTTPS
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;     // Note: Cannot be set via document.cookie
  partitioned?: boolean;  // For third-party contexts
}

export class SecureCookieManager {
  private static instance: SecureCookieManager;

  private constructor() {}

  static getInstance(): SecureCookieManager {
    if (!SecureCookieManager.instance) {
      SecureCookieManager.instance = new SecureCookieManager();
    }
    return SecureCookieManager.instance;
  }

  /**
   * Set a secure cookie with all required security attributes
   */
  setSecureCookie(name: string, value: string, options: CookieOptions = {}): void {
    const defaults: Required<CookieOptions> = {
      maxAge: 3600,           // 1 hour
      expires: new Date(Date.now() + 3600 * 1000),
      path: '/',
      domain: '',
      secure: true,           // HTTPS only
      sameSite: 'Strict',     // CSRF protection
      httpOnly: false,        // Cannot be set via JS (client-side only)
      partitioned: false      // For cross-site contexts
    };

    const finalOptions = { ...defaults, ...options };

    // Build cookie string with all security attributes
    let cookieString = `${name}=${value}`;

    // Add path
    cookieString += `; path=${finalOptions.path}`;

    // Add max-age (preferred over expires)
    cookieString += `; max-age=${finalOptions.maxAge}`;

    // Add domain if specified
    if (finalOptions.domain) {
      cookieString += `; domain=${finalOptions.domain}`;
    }

    // Security attributes
    if (finalOptions.secure) {
      cookieString += '; secure';
    }

    // SameSite attribute (critical for modern browsers)
    cookieString += `; samesite=${finalOptions.sameSite.toLowerCase()}`;

    // Partitioned attribute for third-party contexts
    if (finalOptions.partitioned) {
      cookieString += '; partitioned';
    }

    // Set the cookie
    document.cookie = cookieString;

    console.debug(`🍪 Secure cookie set: ${name} with attributes:`, {
      secure: finalOptions.secure,
      sameSite: finalOptions.sameSite,
      partitioned: finalOptions.partitioned,
      maxAge: finalOptions.maxAge
    });
  }

  /**
   * Set an authentication token cookie with optimal security
   */
  setAuthTokenCookie(name: string, token: string, maxAge: number = 3600): void {
    this.setSecureCookie(name, token, {
      maxAge,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      partitioned: false  // Auth cookies are first-party
    });
  }

  /**
   * Set a refresh token cookie with extended expiry
   */
  setRefreshTokenCookie(token: string, maxAge: number = 7 * 24 * 60 * 60): void {
    this.setSecureCookie('refresh_token', token, {
      maxAge,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      partitioned: false
    });
  }

  /**
   * Clear a cookie securely (compliant with modern browsers)
   */
  clearCookie(name: string, options: Partial<CookieOptions> = {}): void {
    const clearOptions: CookieOptions = {
      path: '/',
      secure: true,
      sameSite: 'Strict',
      maxAge: 0,
      expires: new Date(0),
      ...options
    };

    // Set cookie with empty value and past expiration
    this.setSecureCookie(name, '', clearOptions);

    console.debug(`🗑️ Cookie cleared: ${name}`);
  }

  /**
   * Clear all authentication cookies
   */
  clearAuthCookies(): void {
    const authCookies = ['access_token', 'refresh_token', 'session'];

    authCookies.forEach(cookieName => {
      this.clearCookie(cookieName);
    });

    console.info('🔐 All authentication cookies cleared');
  }

  /**
   * Get cookie value (for client-side accessible cookies only)
   */
  getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }

    return null;
  }

  /**
   * Check if running in secure context (HTTPS)
   */
  isSecureContext(): boolean {
    return window.location.protocol === 'https:' ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Validate cookie options for security compliance
   */
  private validateOptions(options: CookieOptions): void {
    // Warn if setting secure cookies in non-secure context
    if (options.secure && !this.isSecureContext()) {
      console.warn('⚠️ Secure cookies require HTTPS. Cookie may not be set properly.');
    }

    // Warn about SameSite=None without Secure
    if (options.sameSite === 'None' && !options.secure) {
      console.error('❌ SameSite=None requires Secure attribute');
      throw new Error('SameSite=None requires Secure attribute');
    }
  }

  /**
   * Set a third-party cookie with Partitioned attribute (future-proof)
   */
  setThirdPartyCookie(name: string, value: string, options: CookieOptions = {}): void {
    const thirdPartyOptions: CookieOptions = {
      secure: true,
      sameSite: 'None',     // Required for third-party
      partitioned: true,    // Future compliance
      ...options
    };

    this.validateOptions(thirdPartyOptions);
    this.setSecureCookie(name, value, thirdPartyOptions);
  }
}

// Export singleton instance
export const cookieManager = SecureCookieManager.getInstance();
export default cookieManager;