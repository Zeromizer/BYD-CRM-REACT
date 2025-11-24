# Development Guide for Claude Code

This guide helps you continue building the BYD CRM with Claude Code.

## ✅ What's Already Built

### Core Infrastructure
- ✅ TypeScript configuration
- ✅ Vite build setup
- ✅ Database schema (IndexedDB with Dexie)
- ✅ Configuration system with environment variables
- ✅ ESLint + Prettier for code quality

### Authentication System
- ✅ Google OAuth integration
- ✅ Auth service with sign in/sign out
- ✅ Auth store (Zustand)
- ✅ useAuth hook for components
- ✅ Session management

### Customer Management (Partial)
- ✅ Customer schema with validation (Zod)
- ✅ Customer service with CRUD operations
- ✅ Database table for customers
- ✅ Type definitions

### UI Foundation
- ✅ Main App component with React Query
- ✅ Dashboard page with sign-in flow
- ✅ Modern CSS with design system
- ✅ Responsive layout

## 🎯 What to Build Next

### Phase 1: Customer List & Details (Week 1)

#### 1.1 Customer List Component
Location: `src/features/customers/components/CustomerList.tsx`

Features needed:
- Display all customers for current consultant
- Search/filter functionality
- Sort by name, date, status
- Show customer count
- Click to select customer

```typescript
// Key functionality:
- useQuery to fetch customers
- Search input with debounce
- Map through customers array
- Handle customer selection
```

#### 1.2 Customer Details Component
Location: `src/features/customers/components/CustomerDetails.tsx`

Features needed:
- Display selected customer info
- Edit button
- Delete button
- Show Google Drive folder link
- Display checklist
- Toggle deal closed status

#### 1.3 Customer Form Component
Location: `src/features/customers/components/CustomerForm.tsx`

Features needed:
- Form with all customer fields
- Validation using Zod schema
- Submit to create/update customer
- Error handling
- Success feedback

**Prompt for Claude Code:**
```
Create a CustomerList component that:
1. Fetches customers using React Query and customerService
2. Has a search input to filter customers
3. Displays customers in a scrollable list with name, phone, and status
4. Allows clicking a customer to select them
5. Shows loading and error states
6. Uses modern, clean styling consistent with the dashboard

Follow the patterns in Dashboard.tsx and use the customerService for data access.
```

### Phase 2: Google Drive Integration (Week 2)

#### 2.1 Drive Client Service
Location: `src/shared/lib/drive/driveClient.ts`

Features needed:
- Initialize Drive API
- List files/folders
- Create folder
- Upload file
- Download file
- Delete file
- Get folder structure

#### 2.2 Folder Management
Location: `src/shared/lib/drive/driveFolders.ts`

Features needed:
- Create customer folder structure
- Create subfolder (NRIC, VSA, etc.)
- Move files between folders
- Get folder by path

#### 2.3 Sync Engine
Location: `src/shared/lib/sync/syncEngine.ts`

Features needed:
- Queue operations when offline
- Auto-sync when online
- Retry failed operations
- Conflict resolution
- Progress tracking

**Prompt for Claude Code:**
```
Create a DriveClient service for Google Drive operations:
1. Use the access token from authService.getAccessToken()
2. Implement methods: createFolder, uploadFile, listFiles, deleteFile
3. Use fetch with Google Drive API v3 endpoints
4. Handle errors and rate limiting
5. Type all methods with TypeScript
6. Add JSDoc comments

Reference the Google Drive API docs and use the authService pattern.
```

### Phase 3: Form Templates (Week 3)

#### 3.1 Form Template Schema
Location: `src/features/forms/schemas/form.schema.ts`

Define:
- FormTemplate interface
- FormField interface with x, y coordinates
- Validation rules

#### 3.2 Form Template Service
Location: `src/features/forms/services/formService.ts`

Features needed:
- Upload form image
- Save to Drive
- Configure field positions
- Map fields to customer data
- Render form with data overlay

#### 3.3 Field Mapper Component
Location: `src/features/forms/components/FieldMapper.tsx`

Features needed:
- Display form image on canvas
- Click to place field markers
- Configure field properties
- Preview with sample data
- Save field mappings

**Prompt for Claude Code:**
```
Create a FieldMapper component for form templates:
1. Display an uploaded image on HTML5 canvas
2. Allow clicking on the canvas to place field markers
3. Show a modal to configure each field (label, customer field, font size, color)
4. Draw field markers on canvas
5. Allow dragging markers to reposition
6. Save field configurations to database
7. Preview form with actual customer data

Use Canvas API, similar to your old app's approach but with TypeScript.
```

### Phase 4: Excel Integration (Week 4)

#### 4.1 Excel Template Schema
Location: `src/features/excel/schemas/excel.schema.ts`

Define:
- ExcelTemplate interface
- ExcelMapping (cell → customer field)
- Validation rules

#### 4.2 Excel Service
Location: `src/features/excel/services/excelService.ts`

Features needed:
- Upload Excel template
- Map cells to customer fields
- Populate template with data
- Generate new Excel file
- Save to Drive

Use xlsx-populate library (already installed)

#### 4.3 Excel Mapper Component
Location: `src/features/excel/components/ExcelMapper.tsx`

Features needed:
- Upload Excel file
- Display cell grid
- Select cells to map
- Choose customer field for each cell
- Preview populated file
- Generate and download

**Prompt for Claude Code:**
```
Create an ExcelService using xlsx-populate:
1. Load Excel template from file
2. Map customer fields to specific cells (e.g., A1, B5)
3. Create a new workbook from template
4. Populate cells with customer data
5. Generate blob for download
6. Upload to Google Drive in customer folder
7. Use Web Worker for large files (optional optimization)

Reference xlsx-populate docs and use async/await properly.
```

### Phase 5: Document Management (Week 5)

#### 5.1 Document Service
Location: `src/features/documents/services/documentService.ts`

Features needed:
- List documents in customer folder
- Upload document to subfolder
- Download document
- Delete document
- Move document
- Rename document

#### 5.2 Document Viewer Component
Location: `src/features/documents/components/DocumentViewer.tsx`

Features needed:
- Display document list by category
- Preview images/PDFs
- Download button
- Delete with confirmation
- Upload with drag-and-drop
- Progress indicator

**Prompt for Claude Code:**
```
Create a DocumentViewer component:
1. Fetch documents from Drive using driveClient
2. Group by subfolder (NRIC, VSA, Trade In, etc.)
3. Display as cards with thumbnails
4. Support drag-and-drop upload
5. Show upload progress
6. Preview images inline
7. Download button for each document
8. Delete with confirmation dialog

Use the Drive API patterns and add nice UI with thumbnails.
```

## 🎨 UI Component Library

Create reusable components in `src/shared/components/ui/`:

### Button.tsx
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

### Modal.tsx
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

### Input.tsx
```typescript
interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}
```

**Prompt for Claude Code:**
```
Create a reusable Button component:
1. Support variants: primary, secondary, danger
2. Support sizes: sm, md, lg
3. Show loading spinner when loading prop is true
4. Disable when disabled prop is true
5. Style using CSS variables from App.css
6. Export from src/shared/components/ui/Button.tsx
7. Add TypeScript types
8. Include hover and active states

Use modern React patterns (function components, props with TypeScript).
```

## 🧪 Testing Strategy

Write tests as you build features:

### Unit Tests
Test services in isolation:
```typescript
describe('CustomerService', () => {
  it('should create a customer', async () => {
    const customer = await customerService.create({
      name: 'John Doe',
      phone: '+6591234567',
      // ... other fields
    });
    
    expect(customer.id).toBeDefined();
    expect(customer.name).toBe('John Doe');
  });
});
```

### Component Tests
Test components with React Testing Library:
```typescript
describe('CustomerList', () => {
  it('should display customers', async () => {
    render(<CustomerList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## 📝 Git Workflow

### Branch Strategy
```bash
main                    # Production-ready code
├── develop            # Development branch
    ├── feature/customer-list
    ├── feature/drive-sync
    └── feature/form-templates
```

### Commit Messages
```
feat: add customer list component
fix: resolve auth token expiration
docs: update README with setup instructions
test: add customer service tests
refactor: extract common button styles
```

### Before Committing
```bash
npm run lint        # Check for errors
npm run type-check  # Check TypeScript
npm test           # Run tests
```

## 🚀 Development Tips

### 1. Use Claude Code Effectively

**Good prompts:**
- Specific: "Create a CustomerList component with search"
- Context: "Following the pattern in Dashboard.tsx"
- Clear requirements: "Display name, phone, status; allow selection"

**Less effective prompts:**
- Vague: "Make a customer thing"
- Too broad: "Build the entire CRM"

### 2. Iterate Incrementally

Build one feature at a time:
1. Schema → Service → Component → Test
2. Get it working first
3. Refactor for quality
4. Add tests
5. Move to next feature

### 3. Reference Existing Code

When asking Claude Code to build something:
- Reference similar existing files
- Ask to follow the same patterns
- Maintain consistency in style

### 4. Test Early and Often

Don't wait until the end:
- Write tests as you go
- Test in browser frequently
- Fix issues immediately

### 5. Use TypeScript Well

- Define interfaces first
- Use Zod for runtime validation
- Let TypeScript catch errors

## 🎯 Feature Priority

Suggested order for building:

**Critical Path (MVP):**
1. ✅ Auth (done)
2. Customer List
3. Customer Form
4. Basic Drive integration
5. Document upload

**Important:**
6. Form templates
7. Excel integration
8. Sync engine
9. Offline support

**Nice to Have:**
10. Advanced search
11. Analytics
12. Notifications
13. Export features

## 📚 Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Dexie.js Docs](https://dexie.org/)
- [Google Drive API](https://developers.google.com/drive/api/v3/reference)

### Examples in Codebase
- Authentication: `src/features/auth/`
- Database: `src/shared/lib/db/`
- Configuration: `src/shared/constants/config.ts`
- Validation: `src/features/customers/schemas/`

## 🤝 Getting Help from Claude Code

When stuck, ask Claude Code:

**"Show me how to..."**
- "Show me how to use React Query with customerService"
- "Show me how to validate form input with Zod"
- "Show me how to upload a file to Google Drive"

**"Help me fix..."**
- "Help me fix this TypeScript error: [paste error]"
- "Help me fix this component that's not rendering"
- "Help me fix the auth flow that's not working"

**"Explain..."**
- "Explain how the database schema works"
- "Explain the auth flow in this app"
- "Explain how to add a new feature"

## 🎉 You're Ready!

You have:
- ✅ Complete project structure
- ✅ Working authentication
- ✅ Database ready
- ✅ Type-safe foundation
- ✅ Modern tooling
- ✅ Clear roadmap

Start with customer list and work through features one by one. Happy coding! 🚀
