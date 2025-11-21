# BYD MotorEast CRM - React Version

> Modern, cloud-synced Customer Relationship Management system for BYD MotorEast dealership

## 🚀 Quick Start

### Development

```bash
# Install dependencies
cd react-app
npm install

# Run development server
npm run dev
# Opens at http://localhost:5173
```

### Production

```bash
# Build and deploy to root
npm run build

# Serve with Python HTTP server
npm start
# Opens at http://localhost:8000
```

## 📁 Project Structure

```
BYD-CRM-REACT/
├── index.html              # React app (default, auto-generated from build)
├── assets/                 # React app assets (auto-generated)
├── classic/                # Classic vanilla JS version
│   ├── index.html          # Classic entry point
│   └── src/                # Classic source code
├── react-app/              # React source code
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── stores/         # Zustand state management
│   │   └── services/       # API services (Google Drive, Auth)
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # React dependencies
├── shared/                 # Shared configuration
│   └── config.js           # API keys, constants
└── package.json            # Root scripts
```

## 🌐 Accessing the App

### Default (React Version)
- **URL**: `http://localhost:8000/`
- **Features**: Modern UI, Google Drive sync, auto-save
- **Recommended**: Use this for production

### Classic Version
- **URL**: `http://localhost:8000/classic/`
- **Features**: Original vanilla JS implementation
- **Use Case**: Fallback or legacy support

**Note**: Both versions share data through localStorage and Google Drive!

## ✨ Key Features

### React Version (Default)
- ✅ Modern React 19 with Vite
- ✅ Google Drive synchronization
- ✅ Auto-sync every 5 minutes
- ✅ Real-time sync status indicators
- ✅ Customer CRUD operations
- ✅ Search and filtering
- ✅ Responsive design
- ✅ Offline support with auto-sync when reconnected

### Classic Version
- ✅ Full-featured vanilla JS implementation
- ✅ Forms management
- ✅ Excel integration
- ✅ Document scanner
- ✅ Offline sync queue

## 🔄 Data Synchronization

Your data is synchronized across three layers:

1. **LocalStorage** (`bydCRM` key)
   - Instant access
   - Offline support
   - Shared between React and Classic

2. **Google Drive** (`BYD_CRM_Data.json`)
   - Cloud backup
   - Cross-device sync
   - Automatic conflict resolution

3. **Cross-Version Compatibility**
   - Changes in React → visible in Classic
   - Changes in Classic → visible in React
   - Seamless switching between versions

## 🛠️ Available Scripts

### Root Level

```bash
npm run dev           # Start Python HTTP server on port 8000
npm run dev:react     # Start React dev server on port 5173
npm run build         # Build React app and deploy to root
npm start             # Start production server
```

### React App Level (inside react-app/)

```bash
npm run dev           # Vite dev server with hot reload
npm run build         # Production build to dist/
npm run lint          # ESLint code check
npm run preview       # Preview production build
```

## 📖 Documentation

- **[REACT_PREVIEW_GUIDE.md](./REACT_PREVIEW_GUIDE.md)** - Complete user guide with Google Drive sync instructions
- **[SETUP.md](./SETUP.md)** - Initial setup and configuration
- **[REFACTORING.md](./REFACTORING.md)** - Architecture documentation
- **[REACT_MIGRATION_GUIDE.md](./REACT_MIGRATION_GUIDE.md)** - Migration strategy from Classic to React

## 🔒 Security & Privacy

- **OAuth 2.0** authentication with Google
- **Scoped access**: Only app-created files (drive.file scope)
- **Local-first**: Works offline, syncs when connected
- **No third-party servers**: Direct Google Drive integration
- **Your data**: Stored in your personal Google Drive only

## 🎯 Getting Started Guide

### 1. First Time Setup

```bash
# Clone the repository
git clone https://github.com/Zeromizer/BYD-CRM-REACT.git
cd BYD-CRM-REACT

# Install React dependencies
cd react-app
npm install
cd ..

# Build and start
npm run build
npm start
```

### 2. Connect to Google Drive

1. Open `http://localhost:8000/`
2. Click **"Connect Drive"** in the header
3. Sign in with your Google account
4. Grant permissions for Drive access
5. Wait for initial sync (green checkmark appears)

### 3. Add Your First Customer

1. Click **"+ Add Customer"** in the customer list
2. Fill in customer details:
   - Name (required)
   - Phone (required)
   - Email, NRIC, Address, etc. (optional)
3. Click **"Add Customer"**
4. Data auto-saves and syncs to Drive

### 4. Switch Between Versions

**From React to Classic:**
- Click menu (⋮) → "Switch to Classic Version"

**From Classic to React:**
- Click banner link "Switch to React version"

All your data is preserved!

## 🔧 Development

### Technology Stack

- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **State Management**: Zustand 5.0.8
- **Routing**: React Router 7.9.6
- **Storage**: LocalStorage + Google Drive API v3
- **Auth**: Google Identity Services (OAuth 2.0)

### File Structure Explained

```
react-app/src/
├── components/
│   ├── Header/              # Top navigation with auth & sync status
│   ├── Dashboard/           # Main 2-column layout
│   ├── CustomerList/        # Left sidebar with search
│   ├── CustomerDetails/     # Right panel with customer info
│   ├── CustomerForm/        # Reusable add/edit form
│   └── Modal/               # Generic modal component
├── stores/
│   ├── useCustomerStore.js  # Customer CRUD + Drive sync
│   └── useAuthStore.js      # Google authentication
├── services/
│   ├── authService.js       # OAuth & token management
│   └── driveService.js      # Google Drive operations
└── main.jsx                 # App entry point
```

## 🐛 Troubleshooting

### Build Issues

**Problem**: Build fails with module errors

**Solution**:
```bash
cd react-app
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Sync Issues

**Problem**: Data not syncing

**Solution**:
1. Check internet connection
2. Sign out and sign back in
3. Click menu (⋮) → "Force Sync"
4. Check browser console for errors

### Port Already in Use

**Problem**: Port 8000 already taken

**Solution**:
```bash
# Use different port
python3 -m http.server 8080
```

## 📊 Project Status

| Feature | React | Classic |
|---------|-------|---------|
| Customer CRUD | ✅ | ✅ |
| Google Drive Sync | ✅ | ✅ |
| Forms Management | 🚧 | ✅ |
| Excel Integration | 🚧 | ✅ |
| Document Scanner | 🚧 | ✅ |
| Offline Queue | 🚧 | ✅ |

✅ Complete | 🚧 In Progress

## 🤝 Contributing

This is a proprietary application for BYD MotorEast. For internal development:

1. Create a feature branch
2. Make your changes
3. Test both React and Classic versions
4. Submit a pull request

## 📝 License

Proprietary - BYD MotorEast CRM System

## 📧 Support

For issues or questions:
1. Check documentation in `/docs/`
2. Review console logs (F12)
3. Contact the development team

---

**Version**: 2.0.0
**Last Updated**: 2025-11-21
**Default Version**: React (recommended)
**Fallback**: Classic (at `/classic/`)
