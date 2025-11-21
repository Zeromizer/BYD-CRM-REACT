import { create } from 'zustand';
import driveService from '../services/driveService.js';

/**
 * Customer Store
 * Manages customer data, selection, and CRUD operations
 *
 * Compatible with vanilla JS app using 'bydCRM' localStorage key
 * Syncs data with Google Drive for cross-platform consistency
 */
const useCustomerStore = create((set, get) => ({
  // State
  customers: [],
  selectedCustomerId: null,
  isLoading: false,
  error: null,
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,

  // Actions
  setCustomers: (customers) => set({ customers }),

  addCustomer: async (customerData) => {
    const newCustomer = {
      id: Date.now(), // Use numeric ID to match vanilla JS
      name: customerData.name || '',
      phone: customerData.phone || '',
      email: customerData.email || '',
      nric: customerData.nric || '',
      occupation: customerData.occupation || '',
      dob: customerData.dob || '',
      salesConsultant: customerData.salesConsultant || '',
      vsaNo: customerData.vsaNo || '',
      address: customerData.address || '',
      addressContinue: customerData.addressContinue || '',
      notes: customerData.notes || '',
      dateAdded: new Date().toISOString(),
      checklist: {},
      dealClosed: false,
      driveFolderId: null,
      driveFolderLink: null,
      // Preserve any additional fields from vanilla JS
      ...customerData,
    };

    set((state) => ({
      customers: [...state.customers, newCustomer]
    }));

    // Save to localStorage immediately
    get().saveToLocalStorage();

    // Sync to Drive if authenticated
    await get().syncToDrive();

    return newCustomer;
  },

  updateCustomer: async (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) => {
        // Handle both string and numeric IDs for compatibility
        const customerId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
        const targetId = typeof id === 'string' ? parseInt(id) : id;

        if (customerId === targetId) {
          return {
            ...c,
            ...updates,
            // Preserve vanilla JS fields
            id: c.id,
            dateAdded: c.dateAdded,
            checklist: c.checklist || {},
            dealClosed: c.dealClosed || false,
            driveFolderId: c.driveFolderId || null,
            driveFolderLink: c.driveFolderLink || null,
          };
        }
        return c;
      })
    }));

    // Save to localStorage immediately
    get().saveToLocalStorage();

    // Sync to Drive if authenticated
    await get().syncToDrive();
  },

  deleteCustomer: async (id) => {
    set((state) => {
      // Handle both string and numeric IDs
      const targetId = typeof id === 'string' ? parseInt(id) : id;
      const selectedId = typeof state.selectedCustomerId === 'string'
        ? parseInt(state.selectedCustomerId)
        : state.selectedCustomerId;

      return {
        customers: state.customers.filter((c) => {
          const customerId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
          return customerId !== targetId;
        }),
        selectedCustomerId: selectedId === targetId ? null : state.selectedCustomerId
      };
    });

    // Save to localStorage immediately
    get().saveToLocalStorage();

    // Sync to Drive if authenticated
    await get().syncToDrive();
  },

  selectCustomer: (id) => set({ selectedCustomerId: id }),

  getSelectedCustomer: () => {
    const { customers, selectedCustomerId } = get();
    if (!selectedCustomerId) return null;

    // Handle both string and numeric IDs
    const targetId = typeof selectedCustomerId === 'string'
      ? parseInt(selectedCustomerId)
      : selectedCustomerId;

    return customers.find((c) => {
      const customerId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
      return customerId === targetId;
    }) || null;
  },

  loadFromLocalStorage: () => {
    try {
      // Use 'bydCRM' key to match vanilla JS app
      const stored = localStorage.getItem('bydCRM');
      if (stored) {
        const customers = JSON.parse(stored);
        console.log('Loaded customers from localStorage:', customers.length);
        set({ customers });
      } else {
        console.log('No customer data found in localStorage');
        set({ customers: [] });
      }
    } catch (error) {
      console.error('Failed to load customers from localStorage:', error);
      set({ error: 'Failed to load customer data', customers: [] });
    }
  },

  saveToLocalStorage: () => {
    try {
      const { customers } = get();
      // Use 'bydCRM' key to match vanilla JS app
      localStorage.setItem('bydCRM', JSON.stringify(customers));
      console.log('Saved customers to localStorage:', customers.length);
    } catch (error) {
      console.error('Failed to save customers to localStorage:', error);
      set({ error: 'Failed to save customer data' });
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Google Drive Sync Methods

  /**
   * Initialize Google Drive sync
   */
  initializeDriveSync: async () => {
    try {
      console.log('Initializing Drive sync...');
      await driveService.initialize();
      console.log('Drive sync initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Drive sync:', error);
      set({ syncError: error.message });
    }
  },

  /**
   * Sync customer data to Google Drive (upload)
   */
  syncToDrive: async () => {
    try {
      // Check if user is signed in
      const token = localStorage.getItem('googleAccessToken');
      if (!token) {
        console.log('Not signed in, skipping Drive sync');
        return;
      }

      const { customers, isSyncing } = get();

      // Prevent concurrent syncs
      if (isSyncing) {
        console.log('Sync already in progress, skipping...');
        return;
      }

      set({ isSyncing: true, syncError: null });

      await driveService.uploadCustomerData(customers);

      set({
        isSyncing: false,
        lastSyncTime: new Date(),
        syncError: null
      });

      console.log('Successfully synced to Drive');
    } catch (error) {
      console.error('Failed to sync to Drive:', error);
      set({
        isSyncing: false,
        syncError: error.message
      });
    }
  },

  /**
   * Sync customer data from Google Drive (download and merge)
   */
  syncFromDrive: async (direction = 'merge') => {
    try {
      // Check if user is signed in
      const token = localStorage.getItem('googleAccessToken');
      if (!token) {
        console.log('Not signed in, cannot sync from Drive');
        return;
      }

      const { customers, isSyncing } = get();

      // Prevent concurrent syncs
      if (isSyncing) {
        console.log('Sync already in progress, skipping...');
        return;
      }

      set({ isSyncing: true, syncError: null, isLoading: true });

      const mergedCustomers = await driveService.syncCustomerData(customers, direction);

      set({
        customers: mergedCustomers,
        isSyncing: false,
        isLoading: false,
        lastSyncTime: new Date(),
        syncError: null
      });

      // Save merged data to localStorage
      get().saveToLocalStorage();

      console.log(`Successfully synced from Drive (${direction}):`, mergedCustomers.length, 'customers');
    } catch (error) {
      console.error('Failed to sync from Drive:', error);
      set({
        isSyncing: false,
        isLoading: false,
        syncError: error.message
      });
    }
  },

  /**
   * Create a Google Drive folder for a customer
   */
  createCustomerDriveFolder: async (customerId) => {
    try {
      const { customers } = get();
      const customer = customers.find(c => {
        const cId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
        const targetId = typeof customerId === 'string' ? parseInt(customerId) : customerId;
        return cId === targetId;
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const { folderId, folderLink } = await driveService.createCustomerFolder(
        customer.name,
        customer.id
      );

      // Update customer with folder info
      await get().updateCustomer(customerId, {
        driveFolderId: folderId,
        driveFolderLink: folderLink
      });

      console.log(`Created Drive folder for ${customer.name}`);
      return { folderId, folderLink };
    } catch (error) {
      console.error('Failed to create customer Drive folder:', error);
      throw error;
    }
  },

  /**
   * Get sync status
   */
  getSyncStatus: () => {
    const { isSyncing, lastSyncTime, syncError } = get();
    return { isSyncing, lastSyncTime, syncError };
  },
}));

export default useCustomerStore;
