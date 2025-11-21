import { CONFIG } from '../../../shared/config.js';

/**
 * Google Drive Service
 * Handles all Google Drive API interactions for BYD CRM
 */
class DriveService {
  constructor() {
    this.rootFolderId = localStorage.getItem(CONFIG.STORAGE_KEYS.ROOT_FOLDER_ID);
    this.formsFolderId = localStorage.getItem(CONFIG.STORAGE_KEYS.FORMS_FOLDER_ID);
    this.excelTemplatesFolderId = localStorage.getItem(CONFIG.STORAGE_KEYS.EXCEL_FOLDER_ID);
    this.dataFileId = localStorage.getItem(CONFIG.STORAGE_KEYS.DATA_FILE_ID);
    this.formsDataFileId = localStorage.getItem(CONFIG.STORAGE_KEYS.FORMS_DATA_FILE_ID);
    this.excelDataFileId = localStorage.getItem(CONFIG.STORAGE_KEYS.EXCEL_DATA_FILE_ID);

    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.syncCallbacks = [];
  }

  /**
   * Initialize Drive service and folder structure
   */
  async initialize() {
    try {
      console.log('Initializing Google Drive service...');

      // Ensure root folder exists
      if (!this.rootFolderId) {
        this.rootFolderId = await this.findOrCreateFolder(CONFIG.ROOT_FOLDER_NAME, null);
        localStorage.setItem(CONFIG.STORAGE_KEYS.ROOT_FOLDER_ID, this.rootFolderId);
      }

      // Ensure Forms folder exists
      if (!this.formsFolderId) {
        this.formsFolderId = await this.findOrCreateFolder(
          CONFIG.FORMS_FOLDER_NAME,
          this.rootFolderId
        );
        localStorage.setItem(CONFIG.STORAGE_KEYS.FORMS_FOLDER_ID, this.formsFolderId);
      }

      // Ensure Excel Templates folder exists
      if (!this.excelTemplatesFolderId) {
        this.excelTemplatesFolderId = await this.findOrCreateFolder(
          CONFIG.EXCEL_FOLDER_NAME,
          this.rootFolderId
        );
        localStorage.setItem(CONFIG.STORAGE_KEYS.EXCEL_FOLDER_ID, this.excelTemplatesFolderId);
      }

      console.log('Drive service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Drive service:', error);
      throw error;
    }
  }

  /**
   * Find or create a folder in Google Drive
   */
  async findOrCreateFolder(folderName, parentId = null) {
    try {
      // First, try to find existing folder
      const query = parentId
        ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        console.log(`Found existing folder: ${folderName}`);
        return response.result.files[0].id;
      }

      // Folder doesn't exist, create it
      console.log(`Creating folder: ${folderName}`);
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : []
      };

      const createResponse = await gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      console.log(`Created folder: ${folderName} with ID: ${createResponse.result.id}`);
      return createResponse.result.id;
    } catch (error) {
      console.error(`Error finding/creating folder ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Find or create a JSON data file
   */
  async findOrCreateDataFile(fileName, folderId) {
    try {
      // Try to find existing file
      const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        console.log(`Found existing file: ${fileName}`);
        return response.result.files[0].id;
      }

      // File doesn't exist, create it with empty data
      console.log(`Creating file: ${fileName}`);
      const fileMetadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId]
      };

      const initialData = fileName === CONFIG.DATA_FILE_NAME
        ? JSON.stringify([])
        : JSON.stringify({});

      const blob = new Blob([initialData], { type: 'application/json' });
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', blob);

      const token = gapi.client.getToken().access_token;
      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const result = await uploadResponse.json();
      console.log(`Created file: ${fileName} with ID: ${result.id}`);
      return result.id;
    } catch (error) {
      console.error(`Error finding/creating file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Download customer data from Google Drive
   */
  async downloadCustomerData() {
    try {
      console.log('Downloading customer data from Google Drive...');

      // Ensure we have the data file
      if (!this.dataFileId) {
        this.dataFileId = await this.findOrCreateDataFile(
          CONFIG.DATA_FILE_NAME,
          this.rootFolderId
        );
        localStorage.setItem(CONFIG.STORAGE_KEYS.DATA_FILE_ID, this.dataFileId);
      }

      // Download the file content
      const response = await gapi.client.drive.files.get({
        fileId: this.dataFileId,
        alt: 'media'
      });

      const customers = response.result || [];
      console.log(`Downloaded ${customers.length} customers from Drive`);
      return customers;
    } catch (error) {
      console.error('Error downloading customer data:', error);

      // If file not found, create a new one
      if (error.status === 404) {
        this.dataFileId = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.DATA_FILE_ID);
        return [];
      }

      throw error;
    }
  }

  /**
   * Upload customer data to Google Drive
   */
  async uploadCustomerData(customers) {
    try {
      console.log('Uploading customer data to Google Drive...');
      this.syncInProgress = true;
      this.notifySync('uploading');

      // Ensure we have the data file
      if (!this.dataFileId) {
        this.dataFileId = await this.findOrCreateDataFile(
          CONFIG.DATA_FILE_NAME,
          this.rootFolderId
        );
        localStorage.setItem(CONFIG.STORAGE_KEYS.DATA_FILE_ID, this.dataFileId);
      }

      // Upload the file content
      const blob = new Blob([JSON.stringify(customers, null, 2)], { type: 'application/json' });
      const token = gapi.client.getToken().access_token;

      const uploadResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${this.dataFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: blob
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      this.lastSyncTime = new Date();
      console.log(`Uploaded ${customers.length} customers to Drive`);

      this.syncInProgress = false;
      this.notifySync('success');

      return true;
    } catch (error) {
      console.error('Error uploading customer data:', error);
      this.syncInProgress = false;
      this.notifySync('error', error.message);
      throw error;
    }
  }

  /**
   * Sync customer data bidirectionally
   * @param {Array} localCustomers - Local customer data
   * @param {string} direction - 'upload', 'download', or 'merge'
   */
  async syncCustomerData(localCustomers, direction = 'merge') {
    try {
      console.log(`Starting ${direction} sync...`);
      this.syncInProgress = true;
      this.notifySync('syncing');

      if (direction === 'upload') {
        await this.uploadCustomerData(localCustomers);
        return localCustomers;
      }

      if (direction === 'download') {
        const driveCustomers = await this.downloadCustomerData();
        return driveCustomers;
      }

      // Merge strategy: Drive is source of truth, but merge any local-only customers
      const driveCustomers = await this.downloadCustomerData();

      if (driveCustomers.length === 0 && localCustomers.length > 0) {
        // No data in Drive, upload local data
        console.log('No data in Drive, uploading local data...');
        await this.uploadCustomerData(localCustomers);
        return localCustomers;
      }

      if (driveCustomers.length > 0 && localCustomers.length === 0) {
        // No local data, use Drive data
        console.log('No local data, using Drive data...');
        return driveCustomers;
      }

      // Merge: Use Drive as base, add any local customers not in Drive
      const mergedCustomers = [...driveCustomers];
      const driveIds = new Set(driveCustomers.map(c => String(c.id)));

      for (const localCustomer of localCustomers) {
        if (!driveIds.has(String(localCustomer.id))) {
          console.log(`Adding local-only customer to merge: ${localCustomer.name}`);
          mergedCustomers.push(localCustomer);
        }
      }

      // If we added local customers, upload the merged data
      if (mergedCustomers.length > driveCustomers.length) {
        console.log('Uploading merged data to Drive...');
        await this.uploadCustomerData(mergedCustomers);
      }

      this.lastSyncTime = new Date();
      this.syncInProgress = false;
      this.notifySync('success');

      return mergedCustomers;
    } catch (error) {
      console.error('Error syncing customer data:', error);
      this.syncInProgress = false;
      this.notifySync('error', error.message);
      throw error;
    }
  }

  /**
   * Create a customer folder in Google Drive
   */
  async createCustomerFolder(customerName, customerId) {
    try {
      const folderName = `${customerName} (${customerId})`;
      const folderId = await this.findOrCreateFolder(folderName, this.rootFolderId);

      // Generate shareable link
      const response = await gapi.client.drive.files.get({
        fileId: folderId,
        fields: 'webViewLink'
      });

      return {
        folderId,
        folderLink: response.result.webViewLink
      };
    } catch (error) {
      console.error('Error creating customer folder:', error);
      throw error;
    }
  }

  /**
   * Register a callback for sync status changes
   */
  onSyncChange(callback) {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all registered callbacks of sync status
   */
  notifySync(status, message = '') {
    this.syncCallbacks.forEach(callback => {
      callback({ status, message, lastSyncTime: this.lastSyncTime });
    });
  }

  /**
   * Get current sync status
   */
  getSyncStatus() {
    return {
      syncing: this.syncInProgress,
      lastSyncTime: this.lastSyncTime
    };
  }

  /**
   * Reset folder IDs (useful for testing or when switching accounts)
   */
  resetFolderIds() {
    this.rootFolderId = null;
    this.formsFolderId = null;
    this.excelTemplatesFolderId = null;
    this.dataFileId = null;
    this.formsDataFileId = null;
    this.excelDataFileId = null;

    localStorage.removeItem(CONFIG.STORAGE_KEYS.ROOT_FOLDER_ID);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.FORMS_FOLDER_ID);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.EXCEL_FOLDER_ID);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.DATA_FILE_ID);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.FORMS_DATA_FILE_ID);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.EXCEL_DATA_FILE_ID);
  }
}

// Export singleton instance
const driveService = new DriveService();
export default driveService;
