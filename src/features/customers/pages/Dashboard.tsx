import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import './Dashboard.css';

/**
 * Dashboard Page
 * Main page of the application - shows customer list and details
 */
export function Dashboard() {
  const { isSignedIn, isInitialized, isLoading, signIn, consultant } = useAuth();

  useEffect(() => {
    console.log('Dashboard mounted');
    console.log('Auth state:', { isSignedIn, isInitialized, isLoading });
  }, [isSignedIn, isInitialized, isLoading]);

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading BYD CRM...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="dashboard">
        <div className="dashboard-signin">
          <div className="signin-card">
            <h1>BYD CRM</h1>
            <p>Customer Relationship Management System</p>
            <p className="signin-subtitle">
              Sign in with your Google account to access your customer data
            </p>
            <button className="btn-signin" onClick={signIn}>
              <svg
                width="18"
                height="18"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in - show dashboard
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>BYD CRM</h1>
          <div className="header-user">
            <img
              src={consultant?.picture}
              alt={consultant?.name}
              className="user-avatar"
            />
            <span>{consultant?.name}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="welcome-message">
            <h2>Welcome back, {consultant?.name?.split(' ')[0]}!</h2>
            <p>Your customer data is loading...</p>
            <p className="info-text">
              ℹ️ This is the initial setup. Continue building with Claude Code to add
              customer list, forms, and Excel features.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
