import { Platform } from 'react-native';

// App Check Service for advanced security
class AppCheckService {
  private static instance: AppCheckService;
  private isInitialized = false;

  static getInstance() {
    if (!AppCheckService.instance) {
      AppCheckService.instance = new AppCheckService();
    }
    return AppCheckService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('[AppCheck] Initialized (stub in Expo Go)');
      this.isInitialized = true;
    } catch (error) {
      console.error('[AppCheck] Initialization failed:', error);
    }
  }

  async getToken(forceRefresh = false): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      console.log('[AppCheck] Token stub (Expo Go)');
      return null;
    } catch (error) {
      console.error('[AppCheck] Failed to get token:', error);
      return null;
    }
  }

  async getLimitedUseToken(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      console.log('[AppCheck] Limited use token stub (Expo Go)');
      return null;
    } catch (error) {
      console.error('[AppCheck] Failed to get limited use token:', error);
      return null;
    }
  }

  // Configure for development/testing
  async enableDebugMode(debugToken?: string) {
    if (__DEV__ && debugToken) {
      try {
        // This would typically be configured at initialization
        console.log('[AppCheck] Debug mode enabled');
      } catch (error) {
        console.error('[AppCheck] Failed to enable debug mode:', error);
      }
    }
  }

  // Check if App Check is properly configured
  isConfigured(): boolean {
    return this.isInitialized;
  }

  // Add App Check token to API requests
  async addTokenToHeaders(headers: Record<string, string>): Promise<Record<string, string>> {
    try {
      const token = await this.getToken();
      if (token) {
        return {
          ...headers,
          'X-Firebase-AppCheck': token,
        };
      }
      return headers;
    } catch (error) {
      console.error('[AppCheck] Failed to add token to headers:', error);
      return headers;
    }
  }

  // Enhanced API call wrapper with App Check
  async secureApiCall<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await this.getToken();
      
      const enhancedOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          ...(token && { 'X-Firebase-AppCheck': token }),
        },
      };

      const response = await fetch(url, enhancedOptions);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[AppCheck] Secure API call failed:', error);
      throw error;
    }
  }
}

export const appCheckService = AppCheckService.getInstance();
export default appCheckService;