# BYD CRM React Preview - Google Drive Sync Guide

## Overview

This is the React preview version of the BYD CRM system with full Google Drive synchronization. The React app provides a modern, component-based architecture with automatic data syncing to Google Drive, ensuring your customer data is always backed up and accessible across both the classic and React versions.

## Key Features

### ✅ Implemented Features

1. **Google Drive Synchronization**
   - Automatic bidirectional sync with Google Drive
   - Auto-sync every 5 minutes when signed in
   - Manual force sync option
   - Real-time sync status indicators
   - Conflict resolution with merge strategy

2. **Customer Management**
   - Full CRUD operations (Create, Read, Update, Delete)
   - Customer search and filtering
   - Customer details view and editing
   - Form validation

3. **Data Persistence**
   - Local storage for offline access
   - Google Drive cloud backup
   - Data sharing between classic and React versions
   - Automatic conflict resolution

4. **Modern UI/UX**
   - Component-based React architecture
   - Real-time sync status indicators
   - Responsive design for mobile and desktop
   - Smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google account for Drive access

### Installation

1. **Install dependencies:**
   ```bash
   cd react-app
   npm install
   ```

2. **Development mode:**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` folder

### Running Both Versions

To run both the classic and React versions simultaneously:

```bash
# From the root directory
npm run dev
```

Then access:
- Classic version: `http://localhost:8000/index.html`
- React version: `http://localhost:8000/react/index.html`

## Google Drive Integration

### How It Works

1. **Initial Setup**
   - Click "Connect Drive" in the header
   - Sign in with your Google account
   - Grant permissions for Drive access
   - The app creates a "BYD CRM Data" folder in your Drive

2. **Folder Structure**
   ```
   Google Drive/
   └── BYD CRM Data/               # Root folder
       ├── BYD_CRM_Data.json       # Customer data backup
       ├── Form Templates/          # PDF form templates
       └── Excel Templates/         # Excel templates
   ```

3. **Data Synchronization**

   **Automatic Sync:**
   - Syncs automatically when you sign in
   - Auto-syncs every 5 minutes while connected
   - Syncs after every customer data change (add/update/delete)

   **Manual Sync:**
   - Click the menu (⋮) in the header
   - Select "Force Sync"
   - Data merges with Drive (Drive data + local-only customers)

4. **Sync Status Indicators**
   - **Green checkmark**: "Synced Xm ago" - Last successful sync time
   - **Blue spinner**: "Syncing..." - Sync in progress
   - **Red**: Sync error (check console for details)

### Sync Strategy

The app uses a smart merge strategy:

1. **On Sign-In**: Downloads data from Drive and merges with local data
2. **On Data Change**: Uploads updated data to Drive
3. **Merge Logic**:
   - Drive data is the primary source
   - Local-only customers are added to Drive data
   - No data loss - all customers preserved
   - Automatic conflict resolution

### Data Sharing Between Classic and React

Both versions share data through:

1. **Local Storage** (same key: `bydCRM`)
2. **Google Drive** (same data file: `BYD_CRM_Data.json`)

This means:
- Changes in Classic version → visible in React version (after sync)
- Changes in React version → visible in Classic version (after sync)
- Sign in to Drive in either version to enable cross-version sync

## Architecture

### Technology Stack

- **React 19.2.0** - UI framework
- **Vite 7.2.4** - Build tool & dev server
- **Zustand 5.0.8** - State management
- **React Router 7.9.6** - Routing
- **Google Drive API v3** - Cloud storage
- **Google Identity Services** - OAuth authentication

### Project Structure

```
react-app/
├── src/
│   ├── components/
│   │   ├── Header/              # Nav bar with auth & sync status
│   │   ├── Dashboard/           # Main container
│   │   ├── CustomerList/        # Left sidebar
│   │   ├── CustomerDetails/     # Right panel
│   │   ├── CustomerForm/        # Add/edit form
│   │   └── Modal/               # Reusable modal
│   ├── stores/
│   │   ├── useCustomerStore.js  # Customer data & sync logic
│   │   └── useAuthStore.js      # Authentication state
│   ├── services/
│   │   ├── authService.js       # Google OAuth
│   │   └── driveService.js      # Google Drive operations
│   └── main.jsx                 # App entry point
├── shared/
│   └── config.js                # Shared configuration
└── package.json
```

### Key Services

#### 1. **driveService.js** - Google Drive Integration

```javascript
// Main methods:
driveService.initialize()                    // Setup Drive folders
driveService.syncCustomerData(data, 'merge') // Bidirectional sync
driveService.uploadCustomerData(data)        // Upload to Drive
driveService.downloadCustomerData()          // Download from Drive
driveService.createCustomerFolder(name, id)  // Create customer folder
```

#### 2. **useCustomerStore.js** - Customer Data Management

```javascript
// Main methods:
const {
  customers,                // Customer array
  addCustomer,              // Create customer
  updateCustomer,           // Update customer
  deleteCustomer,           // Delete customer
  syncFromDrive,            // Manual sync from Drive
  syncToDrive,              // Manual sync to Drive
  initializeDriveSync,      // Initialize Drive service
  getSyncStatus             // Get sync status
} = useCustomerStore();
```

#### 3. **authService.js** - Google Authentication

```javascript
// Main methods:
authService.initialize()    // Setup Google APIs
authService.signIn()        // Sign in to Google
authService.signOut()       // Sign out
authService.isSignedIn()    // Check auth status
```

## Usage Guide

### Connecting to Google Drive

1. Click **"Connect Drive"** in the header
2. Sign in with your Google account
3. Grant Drive access permissions
4. Wait for initial sync to complete (green checkmark appears)

### Adding a Customer

1. Click **"+ Add Customer"** in the customer list
2. Fill in customer details (name and phone are required)
3. Click **"Add Customer"**
4. Data automatically saves locally and syncs to Drive

### Editing a Customer

1. Click on a customer in the list
2. Click **"Edit"** in the details panel
3. Update information
4. Click **"Save Changes"**
5. Changes sync automatically to Drive

### Deleting a Customer

1. Click on a customer in the list
2. Click **"Delete Customer"** button
3. Confirm deletion
4. Deletion syncs automatically to Drive

### Force Sync

1. Click the menu button (⋮) in the header
2. Select **"Force Sync"**
3. Wait for sync to complete
4. Alert confirms success/failure

## Troubleshooting

### Sync Issues

**Problem**: "Sync failed" error

**Solutions**:
1. Check internet connection
2. Verify you're still signed in (reconnect if needed)
3. Check browser console for detailed error
4. Try force sync from menu
5. Sign out and sign back in

**Problem**: Data not appearing after sync

**Solutions**:
1. Check sync status indicator (should show green checkmark)
2. Try manual force sync
3. Check Google Drive folder exists
4. Verify you're using the same Google account

**Problem**: Slow sync

**Solutions**:
1. Large datasets may take time (normal)
2. Check network speed
3. Sync happens in background, don't interrupt

### Authentication Issues

**Problem**: Can't sign in to Google Drive

**Solutions**:
1. Clear browser cache and cookies
2. Try in incognito/private mode
3. Check popup blockers aren't blocking Google auth
4. Verify you're using a supported browser (Chrome, Firefox, Safari, Edge)

**Problem**: Token expired error

**Solutions**:
1. Sign out and sign back in
2. Tokens auto-refresh, but manual refresh may be needed
3. Check console for specific error details

## Development

### Running Tests

```bash
npm run lint  # Check code quality
```

### Building for Production

```bash
npm run build      # Build optimized production bundle
npm run preview    # Preview production build locally
```

### Debugging

1. **Enable verbose logging:**
   Open browser console (F12) to see detailed logs:
   - Drive operations
   - Sync status
   - Authentication events
   - Data changes

2. **Check sync status:**
   ```javascript
   // In browser console:
   const status = useCustomerStore.getState().getSyncStatus();
   console.log(status);
   ```

3. **Inspect Drive folder:**
   - Go to Google Drive
   - Find "BYD CRM Data" folder
   - Open `BYD_CRM_Data.json` to see raw data

## API Configuration

The app uses these Google API settings (in `shared/config.js`):

```javascript
CLIENT_ID: '876961148543-8sdj3cti6q9tc523natb3g6jt789qlbr.apps.googleusercontent.com'
SCOPES: 'https://www.googleapis.com/auth/drive.file'
```

**Scope**: `drive.file` - Only access files created by the app (secure)

## Migration from Classic Version

### Automatic Migration

When you first sign in to the React version:

1. React app loads local storage data (same as Classic)
2. Syncs with Google Drive
3. Merges any discrepancies
4. Both versions now share the same data

### Manual Data Transfer

If needed, you can manually export/import:

1. **From Classic**: Data is in localStorage key `bydCRM`
2. **To React**: React uses the same key, so data is shared automatically
3. **Backup**: Always sign in to Drive to create cloud backup

## Security & Privacy

### Data Security

- ✅ OAuth 2.0 authentication
- ✅ Scoped Drive access (app-created files only)
- ✅ Tokens stored securely in localStorage
- ✅ HTTPS required for production
- ✅ No data sent to external servers (except Google Drive)

### Privacy

- Customer data stored in your personal Google Drive
- Only you can access your BYD CRM Data folder
- No third-party data sharing
- Local-first architecture (works offline)

## Roadmap

### Planned Features

- [ ] Forms management in React
- [ ] Excel template integration
- [ ] Document scanner
- [ ] Offline sync queue
- [ ] Customer folder creation in Drive
- [ ] File upload/download
- [ ] Statistics and analytics
- [ ] Data export/import
- [ ] Multi-user collaboration

## Support

### Getting Help

1. **Check console logs**: F12 → Console tab
2. **Check sync status**: Look at header indicators
3. **Try force sync**: Menu → Force Sync
4. **Clear and restart**: Sign out, clear cache, sign in again

### Known Limitations

- Sync requires internet connection
- Large datasets (1000+ customers) may sync slowly
- Forms and Excel features not yet implemented in React
- Customer Drive folders not auto-created (coming soon)

## Contributing

This is a migration in progress from Classic to React. Current focus:

1. ✅ Core customer CRUD
2. ✅ Google Drive sync
3. ✅ Authentication
4. 🚧 Forms management
5. 🚧 Excel integration
6. 🚧 Document scanning

## License

Proprietary - BYD MotorEast CRM System

---

**Last Updated**: 2025-11-21
**Version**: 2.0.0 (React Preview)
**Compatibility**: Chrome, Firefox, Safari, Edge (latest versions)
