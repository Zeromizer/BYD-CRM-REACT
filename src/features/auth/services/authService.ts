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
 * Handles Google OAuth authentication using Google Identity Services (GIS)
 * and Google API Client for Drive access
 */
export class AuthService {
  private static instance: AuthService;
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;
  private accessToken: string = '';
  private isInitialized = false;
  private authStateListeners: ((isSignedIn: boolean) => void)[] = [];

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
   * Initialize Google Identity Services and API client
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Validate configuration first
      if (!CONFIG.GOOGLE.CLIENT_ID || !CONFIG.GOOGLE.API_KEY) {
        throw new Error('Google credentials are not configured. Please check your .env file.');
      }

      // Load both GIS and GAPI scripts
      await Promise.all([
        this.loadGISScript(),
        this.loadGAPIScript(),
      ]);

      // Initialize token client for OAuth 2.0
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CONFIG.GOOGLE.CLIENT_ID,
          scope: CONFIG.GOOGLE.SCOPES,
          callback: async (response) => {
            if (response.error) {
              console.error('❌ OAuth error:', response.error);
              return;
            }

            if (response.access_token) {
              this.accessToken = response.access_token;
              gapi.client.setToken({ access_token: response.access_token });
              localStorage.setItem('access_token', response.access_token);

              // Get user info and store consultant data
              try {
                const userInfo = await this.getUserInfo();
                const consultant = {
                  id: userInfo.id,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                };
                localStorage.setItem('consultant', JSON.stringify(consultant));
                this.notifyAuthStateChange(true);
                console.log('✅ Signed in as:', consultant.email);
              } catch (error) {
                console.error('❌ Failed to get user info:', error);
              }
            }
          },
        });
      } catch (error) {
        console.error('❌ Failed to initialize OAuth token client:', error);
        throw new Error(
          'Failed to initialize Google OAuth. Please verify your Client ID is correct and configured for this domain in Google Cloud Console.'
        );
      }

      // Initialize GAPI client for Drive API
      await new Promise<void>((resolve, reject) => {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: CONFIG.GOOGLE.API_KEY,
              discoveryDocs: [...CONFIG.GOOGLE.DISCOVERY_DOCS],
            });
            resolve();
          } catch (error: any) {
            console.error('❌ GAPI client initialization error:', error);
            const errorMsg = error?.result?.error?.message || error?.message || 'Unknown error';
            reject(new Error(
              `Failed to initialize Google API client: ${errorMsg}. Please verify your API Key is correct and enabled for Google Drive API.`
            ));
          }
        });
      });

      // Check if we have a stored session
      const stored = localStorage.getItem('consultant');
      const storedToken = localStorage.getItem('access_token');
      if (stored && storedToken) {
        this.accessToken = storedToken;
        gapi.client.setToken({ access_token: storedToken });
      }

      this.isInitialized = true;
      console.log('✅ Google API initialized with GIS');
    } catch (error) {
      console.error('❌ Failed to initialize Google API:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to initialize Google API');
    }
  }

  /**
   * Load Google Identity Services script
   */
  private loadGISScript(): Promise<void> {
    if (window.google?.accounts) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load GIS script'));
      document.body.appendChild(script);
    });
  }

  /**
   * Load Google API script
   */
  private loadGAPIScript(): Promise<void> {
    if (window.gapi) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load GAPI script'));
      document.body.appendChild(script);
    });
  }

  /**
   * Sign in with Google using OAuth 2.0 token flow
   */
  async signIn(): Promise<Consultant> {
    if (!this.tokenClient) {
      throw new Error('Google Auth not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      try {
        // Store the original callback
        const originalCallback = this.tokenClient!.callback;

        // Set a one-time callback that resolves the promise
        this.tokenClient!.callback = async (response) => {
          // Also call the original callback to maintain functionality
          if (originalCallback) {
            await originalCallback(response);
          }

          if (response.error) {
            reject(new Error('Failed to sign in with Google'));
            return;
          }

          // Get the consultant data that was stored by the callback
          const consultant = this.getCurrentConsultant();
          if (consultant) {
            resolve(consultant);
          } else {
            reject(new Error('Failed to retrieve consultant data after sign in'));
          }
        };

        // Trigger sign-in flow
        this.tokenClient!.requestAccessToken({ prompt: 'consent' });
      } catch (error) {
        console.error('❌ Sign in failed:', error);
        reject(new Error('Failed to sign in with Google'));
      }
    });
  }

  /**
   * Get user info from Google
   */
  private async getUserInfo(): Promise<{
    id: string;
    email: string;
    name: string;
    picture: string;
  }> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      if (this.accessToken) {
        // Revoke token
        google.accounts.oauth2.revoke(this.accessToken, () => {
          console.log('✅ Token revoked');
        });
      }

      this.accessToken = '';
      gapi.client.setToken(null);
      localStorage.removeItem('consultant');
      localStorage.removeItem('access_token');
      this.notifyAuthStateChange(false);

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
    return !!this.accessToken && !!localStorage.getItem('consultant');
  }

  /**
   * Get current consultant from localStorage
   */
  getCurrentConsultant(): Consultant | null {
    const stored = localStorage.getItem('consultant');
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
    return this.accessToken;
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (isSignedIn: boolean) => void): () => void {
    this.authStateListeners.push(callback);

    // Return cleanup function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyAuthStateChange(isSignedIn: boolean): void {
    this.authStateListeners.forEach((callback) => callback(isSignedIn));
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
