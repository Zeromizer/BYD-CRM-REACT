import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions for components
 */
export function useAuth() {
  const store = useAuthStore();

  // Initialize on mount
  useEffect(() => {
    if (!store.isInitialized) {
      store.init();
    }
  }, [store.isInitialized, store.init]);

  return {
    // State
    consultant: store.consultant,
    isSignedIn: store.isSignedIn,
    isInitialized: store.isInitialized,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    signIn: store.signIn,
    signOut: store.signOut,
    clearError: store.clearError,

    // Computed
    isReady: store.isInitialized && !store.isLoading,
  };
}
