import { authService } from '@/features/auth/services/authService';
import { CONFIG } from '@/shared/constants/config';

/**
 * Drive file/folder interface
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  thumbnailLink?: string;
}

/**
 * Google Drive API Client
 * Handles all Google Drive operations
 */
class DriveClient {
  private baseUrl = 'https://www.googleapis.com/drive/v3';
  private uploadUrl = 'https://www.googleapis.com/upload/drive/v3';

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search for files/folders
   */
  async search(query: string, pageSize = 100): Promise<DriveFile[]> {
    const params = new URLSearchParams({
      q: query,
      pageSize: String(pageSize),
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,parents,createdTime,modifiedTime,size,thumbnailLink)',
    });

    const response = await this.request<{ files: DriveFile[] }>(
      `${this.baseUrl}/files?${params}`
    );

    return response.files || [];
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<DriveFile> {
    const params = new URLSearchParams({
      fields: 'id,name,mimeType,webViewLink,webContentLink,parents,createdTime,modifiedTime,size,thumbnailLink',
    });

    return this.request<DriveFile>(`${this.baseUrl}/files/${fileId}?${params}`);
  }

  /**
   * Create a folder
   */
  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    const metadata: Record<string, unknown> = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    return this.request<DriveFile>(`${this.baseUrl}/files`, {
      method: 'POST',
      body: JSON.stringify(metadata),
    });
  }

  /**
   * Find or create a folder by name within a parent
   */
  async findOrCreateFolder(name: string, parentId?: string): Promise<DriveFile> {
    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const existing = await this.search(query, 1);
    if (existing.length > 0) {
      return existing[0];
    }

    return this.createFolder(name, parentId);
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: File | Blob,
    name: string,
    parentId?: string,
    mimeType?: string
  ): Promise<DriveFile> {
    const metadata: Record<string, unknown> = {
      name,
      mimeType: mimeType || file.type || 'application/octet-stream',
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    // Create multipart request
    const boundary = '-------' + Date.now().toString(16);
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const metadataString = JSON.stringify(metadata);
    
    // Read file as array buffer
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Build multipart body
    const body = new Blob([
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      metadataString,
      delimiter,
      `Content-Type: ${metadata.mimeType}\r\n`,
      'Content-Transfer-Encoding: base64\r\n\r\n',
      this.arrayBufferToBase64(fileBytes),
      closeDelimiter,
    ]);

    const response = await fetch(
      `${this.uploadUrl}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,parents`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Upload failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete a file/folder
   */
  async deleteFile(fileId: string): Promise<void> {
    await fetch(`${this.baseUrl}/files/${fileId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  /**
   * Move file to different folder
   */
  async moveFile(fileId: string, newParentId: string, removeFromParentId?: string): Promise<DriveFile> {
    const params = new URLSearchParams({
      addParents: newParentId,
      fields: 'id,name,mimeType,webViewLink,parents',
    });

    if (removeFromParentId) {
      params.append('removeParents', removeFromParentId);
    }

    return this.request<DriveFile>(`${this.baseUrl}/files/${fileId}?${params}`, {
      method: 'PATCH',
    });
  }

  /**
   * Rename a file/folder
   */
  async renameFile(fileId: string, newName: string): Promise<DriveFile> {
    return this.request<DriveFile>(`${this.baseUrl}/files/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
  }

  /**
   * List files in a folder
   */
  async listFolder(folderId: string): Promise<DriveFile[]> {
    return this.search(`'${folderId}' in parents and trashed=false`);
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Create customer folder structure
   */
  async createCustomerFolderStructure(
    customerName: string,
    customerId: string
  ): Promise<{
    rootId: string;
    rootLink: string;
    subfolders: Record<string, string>;
  }> {
    // Find or create main CRM folder
    const crmFolder = await this.findOrCreateFolder(CONFIG.DRIVE_FOLDERS.ROOT);

    // Find or create customers data folder
    const customersFolder = await this.findOrCreateFolder(
      CONFIG.DRIVE_FOLDERS.CUSTOMERS_DATA,
      crmFolder.id
    );

    // Create customer's personal folder
    const customerFolderName = `${customerName} (${customerId.slice(0, 8)})`;
    const customerFolder = await this.createFolder(customerFolderName, customersFolder.id);

    // Create subfolders
    const subfolders: Record<string, string> = {};
    for (const subfolderName of CONFIG.DRIVE_FOLDERS.CUSTOMER_SUBFOLDERS) {
      const subfolder = await this.createFolder(subfolderName, customerFolder.id);
      subfolders[subfolderName] = subfolder.id;
    }

    return {
      rootId: customerFolder.id,
      rootLink: customerFolder.webViewLink || `https://drive.google.com/drive/folders/${customerFolder.id}`,
      subfolders,
    };
  }

  /**
   * Helper: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }
}

// Export singleton instance
export const driveClient = new DriveClient();
