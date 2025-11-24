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
          <div className="logo-text">
            <span className="logo-main">BYD</span>
            <span className="logo-subtitle-small">MOTOR-EAST</span>
          </div>
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
            <strong>Error:</strong> {error}
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
            <>Sign in with Google</>
          )}
        </button>

        <div className="login-features">
          <h3>Features</h3>
          <ul>
            <li>Secure customer data management</li>
            <li>Google Drive integration for documents</li>
            <li>Form templates with auto-fill</li>
            <li>Excel template generation</li>
            <li>Progress tracking checklist</li>
            <li>Works offline</li>
          </ul>
        </div>

        <p className="login-footer">
          Built for BYD MotorEast Sales Consultants
        </p>
      </div>
    </div>
  );
}
