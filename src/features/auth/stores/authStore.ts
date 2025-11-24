import { create } from 'zustand';
import { authService, type Consultant } from '../services/authService';
import { db } from '@/shared/lib/db';

interface AuthState {
  consultant: Consultant | null;
  isInitialized: boolean;
  isSignedIn: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  init: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authentication Store
 * Manages authentication state and actions
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  consultant: null,
  isInitialized: false,
  isSignedIn: false,
  isLoading: false,
  error: null,

  /**
   * Initialize authentication
   */
  init: async () => {
    try {
      set({ isLoading: true, error: null });

      // Initialize Google Auth
      await authService.init();

      // Check if already signed in
      const isSignedIn = authService.isSignedIn();
      const consultant = isSignedIn ? authService.getCurrentConsultant() : null;

      set({
        isInitialized: true,
        isSignedIn,
        consultant,
        isLoading: false,
      });

      console.log('✅ Auth initialized, signed in:', isSignedIn);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialize auth';

      set({
        isInitialized: true,
        isLoading: false,
        error: errorMessage,
      });

      console.error('❌ Auth initialization failed:', errorMessage);
    }
  },

  /**
   * Sign in with Google
   */
  signIn: async () => {
    try {
      set({ isLoading: true, error: null });

      const consultant = await authService.signIn();

      set({
        consultant,
        isSignedIn: true,
        isLoading: false,
      });

      console.log('✅ Signed in successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign in';

      set({
        isLoading: false,
        error: errorMessage,
      });

      console.error('❌ Sign in failed:', errorMessage);
      throw error;
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const consultant = get().consultant;

      // Sign out from Google
      await authService.signOut();

      // Clear local database for this consultant
      if (consultant) {
        await db.clearConsultantData(consultant.id);
        console.log('✅ Cleared local data for consultant:', consultant.id);
      }

      set({
        consultant: null,
        isSignedIn: false,
        isLoading: false,
      });

      console.log('✅ Signed out successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign out';

      set({
        isLoading: false,
        error: errorMessage,
      });

      console.error('❌ Sign out failed:', errorMessage);
      throw error;
    }
  },

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),
}));
