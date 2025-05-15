// src/utils/cookieManager.ts

import CryptoJS from 'crypto-js';

class CookieManager {
  private static readonly PREFIX = 'auth_';
  private static readonly SK_KEY = 'sk_auth';
  private static readonly defaultOptions = {
    path: '/',
    // Only set secure:true when in production or HTTPS
    secure: window.location.protocol === 'https:',
    sameSite: 'lax' as const, // Changed from 'strict' to 'lax' for better compatibility
    maxAge: 86400 // 24 hours
  };
  private static readonly AUTH_TOKEN = 'AUTH-TOKEN';

  /**
   * Tạo secret key mới và lưu vào localStorage
   */
  private static generateSecretKey(): string {
    const secretKey = CryptoJS.lib.WordArray.random(16).toString();
    localStorage.setItem(this.SK_KEY, secretKey);
    return secretKey;
  }

  /**
   * Lấy secret key từ localStorage
   */
  private static getSecretKey(): string | null {
    return localStorage.getItem(this.SK_KEY);
  }

  /**
   * Mã hóa key name
   */
  private static encryptKeyName(keyName: string): string {
    const secretKey = this.getSecretKey() || this.generateSecretKey();
    const timestamp = new Date().getTime();
    const dataToEncrypt = `${this.PREFIX}${keyName}_${timestamp}`;
    return CryptoJS.AES.encrypt(dataToEncrypt, secretKey).toString();
  }

  /**
   * Giải mã key name
   */
  private static decryptKeyName(encryptedKey: string): string | null {
    const secretKey = this.getSecretKey();
    if (!secretKey) return null;

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, secretKey).toString(CryptoJS.enc.Utf8);
      if (decrypted.startsWith(this.PREFIX)) {
        return decrypted.split('_')[1]; // Trả về tên key gốc
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Set cookie với key được mã hóa
   */
  public static set(key: string, value: string, options: Partial<typeof this.defaultOptions> = {}): void {
    const encryptedKey = this.encryptKeyName(key);
    const mergedOptions = { ...this.defaultOptions, ...options };

    const cookieOptions = Object.entries(mergedOptions)
      .map(([key, value]) => {
        if (key === 'maxAge') return `max-age=${value}`;
        return `${key.toLowerCase()}=${value}`;
      })
      .join('; ');

    document.cookie = `${encryptedKey}=${value}; ${cookieOptions}`;
  }

  /**
   * Set giá trị cookie auth theo key gốc
   */
  public static setAuthToken(token: string): void {
    // Đặc biệt cho auth token - không mã hóa key name
    const cookieOptions = Object.entries(this.defaultOptions)
      .map(([key, value]) => {
        if (key === 'maxAge') return `max-age=${value}`;
        return `${key.toLowerCase()}=${value}`;
      })
      .join('; ');
    
    // Debug information
    console.log('Setting auth token with protocol:', window.location.protocol);
    console.log('Cookie options:', cookieOptions);
    console.log('Current cookies:', document.cookie);
    
    try {
      document.cookie = `${this.AUTH_TOKEN}=${token}; ${cookieOptions}`;
      // Verify the cookie was set successfully
      const savedToken = this.getAuthToken();
      console.log('Cookie set attempt completed, verification result:', !!savedToken);
      if (!savedToken) {
        console.warn('Auth token cookie could not be verified after setting');
      }
    } catch (error) {
      console.error('Error setting auth token cookie:', error);
    }
  }

  /**
   * Lấy giá trị cookie auth theo key gốc
   */
  public static getAuthToken(): string | null {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith(`${this.AUTH_TOKEN}=`));
    return authCookie ? authCookie.split('=')[1] : null;
  }

  /**
   * Lấy giá trị cookie theo key gốc
   */
  public static get(originalKey: string): string | null {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      const decryptedKey = this.decryptKeyName(key);

      if (decryptedKey === originalKey) {
        return value;
      }
    }
    return null;
  }

  /**
   * Xóa cookie theo key gốc
   */
  public static remove(originalKey: string): void {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [key] = cookie.trim().split('=');
      const decryptedKey = this.decryptKeyName(key);

      if (decryptedKey === originalKey) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  }

  /**
   * Xóa cookie auth
   */
  public static removeAuthToken(): void {
    document.cookie = `${this.AUTH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  /**
   * Xóa tất cả cookies được tạo bởi CookieManager
   */
  public static clearAll(): void {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [key] = cookie.trim().split('=');
      if (this.decryptKeyName(key)) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
    localStorage.removeItem(this.SK_KEY);
  }
}

export default CookieManager;