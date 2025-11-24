/**
 * Application Configuration
 * Centralized configuration for the BYD CRM application
 */

export const CONFIG = {
  /**
   * Google OAuth and Drive API Configuration
   */
  GOOGLE: {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
    SCOPES: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.appdata',
    ].join(' '),
    DISCOVERY_DOCS: [
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    ],
  },

  /**
   * Google Drive Folder Structure
   */
  DRIVE_FOLDERS: {
    ROOT: 'BYD CRM',
    CUSTOMERS_DATA: 'BYD Customers Data',
    FORMS: 'BYD CRM - Form Templates',
    EXCEL: 'BYD CRM - Excel Templates',
    CUSTOMER_SUBFOLDERS: [
      'NRIC',
      'Test Drive',
      'VSA',
      'Trade In',
      'Other Documents',
    ],
  },

  /**
   * Sync Configuration
   */
  SYNC: {
    BATCH_SIZE: 10,
    RETRY_LIMIT: 3,
    RETRY_DELAY: 1000, // milliseconds
    AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    TIMEOUT: 30000, // 30 seconds
  },

  /**
   * Security Configuration
   */
  ENCRYPTION: {
    SALT: import.meta.env.VITE_ENCRYPTION_SALT || 'default-salt-change-me',
    ALGORITHM: 'AES',
  },

  /**
   * UI Configuration
   */
  UI: {
    ITEMS_PER_PAGE: 20,
    DEBOUNCE_DELAY: 300, // milliseconds
    TOAST_DURATION: 3000, // milliseconds
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },

  /**
   * App Metadata
   */
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'BYD CRM',
    VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0',
    ENV: import.meta.env.VITE_APP_ENV || 'development',
  },

  /**
   * Feature Flags
   */
  FEATURES: {
    OFFLINE_MODE: true,
    AUTO_SYNC: true,
    DATA_ENCRYPTION: true,
    DEBUG_MODE: import.meta.env.DEV,
  },
} as const;

/**
 * Validate required configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!CONFIG.GOOGLE.CLIENT_ID) {
    errors.push('Missing VITE_GOOGLE_CLIENT_ID environment variable');
  }

  if (!CONFIG.GOOGLE.API_KEY) {
    errors.push('Missing VITE_GOOGLE_API_KEY environment variable');
  }

  if (
    CONFIG.ENCRYPTION.SALT === 'default-salt-change-me' &&
    CONFIG.APP.ENV === 'production'
  ) {
    errors.push('Default encryption salt is not secure for production');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
