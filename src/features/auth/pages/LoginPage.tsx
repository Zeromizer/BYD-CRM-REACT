import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loading } from '@/shared/components/ui';
import './LoginPage.css';

export function LoginPage() {
  const { signIn, isLoading, error, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="login-page">
        <Loading size="lg" text="Initializing..." />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">🚗</span>
          <h1>BYD CRM</h1>
        </div>
        
        <p className="login-subtitle">
          Customer Relationship Management System
        </p>
        <p className="login-description">
          Sign in with your Google account to access your customer portfolio, 
          manage documents, and streamline your sales process.
        </p>

        {error && (
          <div className="login-error">
            <strong>⚠️ Error:</strong> {error}
            {(error.includes('credentials') ||
              error.includes('Client ID') ||
              error.includes('API Key') ||
              error.includes('OAuth')) && (
              <div className="error-help">
                <p>This usually means Google OAuth is not configured correctly.</p>
                <p>
                  <strong>To fix this:</strong>
                </p>
                <ol style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                  <li>Add your domain to "Authorized JavaScript origins"</li>
                  <li>Add your domain to "Authorized redirect URIs"</li>
                  <li>Enable Google Drive API for your project</li>
                </ol>
                <p style={{ marginTop: '0.5rem' }}>
                  See <a href="https://github.com/Zeromizer/BYD-CRM-REACT/blob/main/GOOGLE_SETUP_GUIDE.md" target="_blank" rel="noopener noreferrer">Setup Guide</a> for detailed instructions.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          className="btn-google-signin"
          onClick={signIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="btn-loading-text">Signing in...</span>
          ) : (
            <>
              <svg
                className="google-icon"
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
            </>
          )}
        </button>

        <div className="login-features">
          <h3>Features</h3>
          <ul>
            <li>✅ Secure customer data management</li>
            <li>✅ Google Drive integration for documents</li>
            <li>✅ Form templates with auto-fill</li>
            <li>✅ Excel template generation</li>
            <li>✅ Progress tracking checklist</li>
            <li>✅ Works offline</li>
          </ul>
        </div>

        <p className="login-footer">
          Built for BYD MotorEast Sales Consultants
        </p>
      </div>
    </div>
  );
}
