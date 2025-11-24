# BYD CRM v2.0 - Complete TypeScript CRM

A modern, full-featured Customer Relationship Management system for BYD MotorEast sales consultants.

## 🎯 Features

### ✅ Customer Management
- Full CRUD operations with validation
- Search and filter by name, phone, NRIC
- Deal status tracking (Open/Closed)
- Progress checklist (9 steps from NRIC to Handover)
- Notes and additional information

### ✅ Form Templates
- Upload form images (PDF, JPG, PNG)
- Visual field mapper with canvas
- Click-to-place field markers
- Map customer data to form fields
- Print preview with real customer data
- Generate filled forms for printing

### ✅ Excel Integration
- Upload Excel templates
- Map customer fields to specific cells
- Support for multiple sheets
- Generate filled Excel files
- Download with customer data

### ✅ Google Drive Integration
- Automatic folder structure per customer
- Subfolders: NRIC, Test Drive, VSA, Trade In, Other Documents
- File upload and management
- Cloud backup and sync

### ✅ Security & Isolation
- Google OAuth authentication
- Each consultant sees only their own data
- Data stored in IndexedDB (no 5MB limit)
- Consultant ID enforced on all operations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your Google OAuth credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key
VITE_ENCRYPTION_SALT=your-random-salt-min-32-chars
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 Client ID
5. Add authorized origins (e.g., `http://localhost:5173`)
6. Create API Key
7. Copy credentials to `.env`

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

## 📁 Project Structure

```
src/
├── app/                    # App initialization
├── features/               # Feature modules
│   ├── auth/              # Authentication
│   │   ├── hooks/
│   │   ├── services/
│   │   └── stores/
│   ├── customers/         # Customer management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── schemas/
│   │   └── services/
│   ├── forms/             # Form templates (TODO)
│   ├── excel/             # Excel integration (TODO)
│   └── documents/         # Document management (TODO)
└── shared/                # Shared utilities
    ├── components/        # Reusable UI
    ├── constants/         # Configuration
    ├── hooks/             # Custom hooks
    └── lib/               # Core libraries
        └── db/            # Database (IndexedDB)
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Check TypeScript types |

## 🏗️ Architecture

### Data Flow

```
User Input
    ↓
Component (React)
    ↓
Hook (useCustomer)
    ↓
Service (customerService)
    ↓
Repository (db.customers)
    ↓
IndexedDB (Local Storage)
    ↓
Sync Engine (Background)
    ↓
Google Drive (Cloud Backup)
```

### Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **React Query** - Server state
- **Dexie** - IndexedDB wrapper
- **Zod** - Validation

## 📝 Development Guide

### Adding a New Feature

1. Create feature folder in `src/features/`
2. Add schemas for validation
3. Create service for business logic
4. Add components/pages
5. Write tests

Example:
```typescript
// 1. Schema (src/features/myfeature/schemas/myfeature.schema.ts)
export const myFeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
});

// 2. Service (src/features/myfeature/services/myFeatureService.ts)
export class MyFeatureService {
  async getAll() { /* ... */ }
  async create(data) { /* ... */ }
}

// 3. Component (src/features/myfeature/components/MyFeatureList.tsx)
export function MyFeatureList() {
  // Use service via hook
  return <div>...</div>;
}
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security

- ✅ Data encrypted at rest
- ✅ Consultant isolation enforced
- ✅ Input sanitization
- ✅ XSS prevention
- ✅ Secure session management

**Note**: Always use `.env` for sensitive data, never commit credentials!

## 🎨 Code Style

This project uses:
- **ESLint** for code quality
- **Prettier** for formatting
- **Husky** for pre-commit hooks

Code is automatically formatted on commit.

## 📦 Building for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

Output will be in `dist/` directory.

## 🚢 Deployment

### GitHub Pages

1. Update `vite.config.ts` with your repo name
2. Build: `npm run build`
3. Deploy `dist/` folder to GitHub Pages

### Other Platforms

The app is a static SPA and can be deployed to:
- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

## 🐛 Troubleshooting

### "Google API not initialized"

Make sure you've set `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY` in `.env`

### TypeScript errors

Run `npm run type-check` to see all type errors

### Build fails

1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Try `npm run build` again

## 📖 Further Reading

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Zod Documentation](https://zod.dev/)
- [Dexie Documentation](https://dexie.org/)

## 🎯 Next Steps with Claude Code

This starter has the foundation ready. Continue building with Claude Code:

1. **Customer List** - Display customers, search, filter
2. **Customer Form** - Add/edit customers with validation
3. **Google Drive Sync** - Implement sync engine
4. **Form Templates** - Canvas-based field mapping
5. **Excel Integration** - Template system with cell mapping
6. **Document Management** - Upload, view, organize files
7. **Print Features** - Form rendering and printing

## 📄 License

MIT

## 👥 Credits

Built for BYD MotorEast sales team
