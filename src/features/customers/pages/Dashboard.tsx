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
              This is the initial setup. Continue building with Claude Code to add
              customer list, forms, and Excel features.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
