import { CONFIG } from '@/shared/constants/config';

/**
 * Consultant/User interface
 */
export interface Consultant {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * Authentication Service
 * Handles Google OAuth authentication and session management
 */
export class AuthService {
  private static instance: AuthService;
  private auth: gapi.auth2.GoogleAuth | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize Google API client
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Check if script already loaded
      if (window.gapi) {
        this.loadAuth(resolve, reject);
        return;
      }

      // Load GAPI script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.loadAuth(resolve, reject);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google API script'));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Load Google Auth
   */
  private loadAuth(resolve: () => void, reject: (error: Error) => void): void {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: CONFIG.GOOGLE.API_KEY,
          clientId: CONFIG.GOOGLE.CLIENT_ID,
          discoveryDocs: [...CONFIG.GOOGLE.DISCOVERY_DOCS],
          scope: CONFIG.GOOGLE.SCOPES,
        });

        this.auth = gapi.auth2.getAuthInstance();
        this.isInitialized = true;

        console.log('✅ Google API initialized');
        resolve();
      } catch (error) {
        console.error('❌ Failed to initialize Google API:', error);
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to initialize Google API')
        );
      }
    });
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<Consultant> {
    if (!this.auth) {
      throw new Error('Google Auth not initialized. Call init() first.');
    }

    try {
      const googleUser = await this.auth.signIn();
      const profile = googleUser.getBasicProfile();

      const consultant: Consultant = {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
      };

      // Store in sessionStorage
      sessionStorage.setItem('consultant', JSON.stringify(consultant));

      console.log('✅ Signed in as:', consultant.email);
      return consultant;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.auth) {
      throw new Error('Google Auth not initialized');
    }

    try {
      await this.auth.signOut();
      sessionStorage.removeItem('consultant');
      console.log('✅ Signed out');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.auth?.isSignedIn.get() ?? false;
  }

  /**
   * Get current consultant from session
   */
  getCurrentConsultant(): Consultant | null {
    const stored = sessionStorage.getItem('consultant');
    if (!stored) return null;

    try {
      return JSON.parse(stored) as Consultant;
    } catch {
      return null;
    }
  }

  /**
   * Get access token for API calls
   */
  getAccessToken(): string {
    const user = this.auth?.currentUser.get();
    return user?.getAuthResponse().access_token ?? '';
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (isSignedIn: boolean) => void): () => void {
    if (!this.auth) {
      console.warn('Auth not initialized, cannot listen to state changes');
      return () => {};
    }

    const listenerId = this.auth.isSignedIn.listen(callback);

    // Return cleanup function
    return () => {
      // Cleanup if needed (gapi doesn't provide direct unlisten)
      console.log('Cleaned up auth listener:', listenerId);
    };
  }

  /**
   * Check if auth is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

/**
 * Export singleton instance
 */
export const authService = AuthService.getInstance();
