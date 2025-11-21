import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useCustomerStore from '../../stores/useCustomerStore';
import './Header.css';

function Header() {
  const { isSignedIn, initialize, signIn, signOut } = useAuthStore();
  const {
    initializeDriveSync,
    syncFromDrive,
    syncToDrive,
    getSyncStatus
  } = useCustomerStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ isSyncing: false, lastSyncTime: null });

  // Initialize authentication on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize Drive sync and perform initial sync when signed in
  useEffect(() => {
    if (isSignedIn) {
      const initSync = async () => {
        try {
          await initializeDriveSync();
          // Perform initial sync from Drive when signing in
          await syncFromDrive('merge');
        } catch (error) {
          console.error('Failed to initialize sync:', error);
        }
      };
      initSync();
    }
  }, [isSignedIn, initializeDriveSync, syncFromDrive]);

  // Poll sync status for UI updates
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getSyncStatus();
      setSyncStatus(status);
    }, 1000);

    return () => clearInterval(interval);
  }, [getSyncStatus]);

  // Auto-sync every 5 minutes when signed in
  useEffect(() => {
    if (!isSignedIn) return;

    const autoSyncInterval = setInterval(async () => {
      console.log('Auto-syncing to Drive...');
      await syncToDrive();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoSyncInterval);
  }, [isSignedIn, syncToDrive]);

  const handleAuth = () => {
    if (isSignedIn) {
      // If signed in, sign out
      if (window.confirm('Are you sure you want to disconnect from Google Drive?')) {
        signOut();
      }
    } else {
      // If not signed in, sign in
      signIn();
    }
  };

  const handleForceSync = async () => {
    setShowDropdown(false);
    try {
      console.log('Forcing sync from Drive...');
      await syncFromDrive('merge');
      alert('Sync completed successfully!');
    } catch (error) {
      console.error('Force sync failed:', error);
      alert('Sync failed: ' + error.message);
    }
  };

  const formatSyncTime = (time) => {
    if (!time) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - new Date(time)) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">
            BYD MotorEast CRM
            <span className="version-badge">React</span>
          </h1>
        </div>

        <div className="header-actions">
          {isSignedIn && syncStatus.isSyncing && (
            <div className="sync-indicator" title="Syncing with Google Drive...">
              <span className="sync-spinner"></span>
              <span className="sync-text">Syncing...</span>
            </div>
          )}
          {isSignedIn && !syncStatus.isSyncing && syncStatus.lastSyncTime && (
            <div className="sync-status" title={`Last synced: ${new Date(syncStatus.lastSyncTime).toLocaleString()}`}>
              <span className="sync-checkmark">✓</span>
              <span className="sync-text">Synced {formatSyncTime(syncStatus.lastSyncTime)}</span>
            </div>
          )}
          <button
            className={`auth-button ${isSignedIn ? 'connected' : ''}`}
            onClick={handleAuth}
            title={isSignedIn ? 'Connected to Google Drive - Click to disconnect' : 'Click to connect to Google Drive'}
          >
            <span className="status-dot"></span>
            <span>{isSignedIn ? 'Connected' : 'Connect Drive'}</span>
          </button>

          <div className="dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
              title="More Options"
            >
              ⋮
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <a className="dropdown-item" onClick={() => console.log('Statistics')}>
                  View Statistics
                </a>
                <a className="dropdown-item" onClick={() => console.log('Forms')}>
                  Manage Forms
                </a>
                <a className="dropdown-item" onClick={() => console.log('Excel')}>
                  Manage Excel
                </a>
                <a className="dropdown-item" onClick={handleForceSync}>
                  Force Sync
                </a>
                <a className="dropdown-item" onClick={() => console.log('Export')}>
                  Export Data
                </a>
                <a className="dropdown-item" onClick={() => console.log('Import')}>
                  Import Data
                </a>
                <div className="dropdown-divider"></div>
                <a
                  className="dropdown-item"
                  href="/classic/"
                  rel="noopener noreferrer"
                >
                  Switch to Classic Version
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
