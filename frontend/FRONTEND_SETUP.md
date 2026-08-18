# VeriRule Frontend Setup Guide

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and production builds)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Node Version**: 16+ (18+ recommended)

## Folder Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── QueryInput/
│   │   ├── ResultDisplay/
│   │   ├── DocumentUpload/
│   │   └── ...
│   │
│   ├── pages/              # Page components (routing)
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Documents.tsx
│   │   ├── History.tsx
│   │   ├── Settings.tsx
│   │   └── NotFound.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useQuery.ts
│   │   ├── useDocuments.ts
│   │   ├── useHistory.ts
│   │   └── useAuth.ts
│   │
│   ├── context/            # React Context for global state
│   │   ├── AuthContext.tsx
│   │   ├── AppContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── services/           # API calls and backend integration
│   │   ├── api.ts
│   │   ├── queryService.ts
│   │   ├── documentService.ts
│   │   ├── authService.ts
│   │   └── ...
│   │
│   ├── utils/              # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── styles/             # Global styles
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── globals.css
│   │
│   ├── assets/             # Images, icons, fonts
│   │   ├── icons/
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # Vite environment types
│
├── public/                 # Static files
│   ├── favicon.ico
│   └── ...
│
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── index.html              # HTML entry point
```

## Installation & Setup

### 1. Prerequisites
```bash
# Check Node.js version (should be 16+)
node --version
npm --version
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and update API URL and other configs
```

### 4. Development Server
```bash
npm run dev
```
- Frontend will run on `http://localhost:3000`
- API calls will proxy to `http://localhost:8000`

### 5. Build for Production
```bash
npm run build
```
Output files will be in `dist/` folder

### 6. Preview Production Build
```bash
npm run preview
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript types |

## Component Structure Example

### Pages (Full-page components)
- Home / Landing page
- Dashboard / Main query interface
- Document Management
- Query History
- Settings
- Admin Panel

### Components (Reusable UI pieces)
- SearchBar / Query Input
- ResultCard / Answer Display
- DocumentList / Document Browser
- SourceCitation / Evidence Display
- UploadArea / Document Upload
- Navbar / Header
- Sidebar / Navigation
- Toast / Notifications

### Services
- `queryService.ts` - Submit compliance queries
- `documentService.ts` - Upload, list, delete documents
- `authService.ts` - Authentication & authorization
- `api.ts` - Base API client with error handling

### Hooks
- `useQuery()` - Manage query state and loading
- `useDocuments()` - Manage documents
- `useHistory()` - Manage query history
- `useAuth()` - Authentication state

## API Integration

All API calls go through `/api/` proxy:
```
Frontend (localhost:3000)
    ↓
Vite Proxy
    ↓
Backend API (localhost:8000)
```

## Environment Variables

```env
VITE_API_BASE_URL          # Backend API URL
VITE_API_TIMEOUT           # Request timeout in ms
VITE_APP_NAME              # App name
VITE_APP_VERSION           # Version
VITE_ENABLE_DOCUMENT_UPLOAD # Enable doc upload feature
VITE_ENABLE_HISTORY        # Enable query history
VITE_ENABLE_EXPORT         # Enable export results
```

## Next Steps

1. ✅ Folder structure created
2. ⏳ Create shared UI components (Header, Sidebar, Card, etc.)
3. ⏳ Build pages (Home, Dashboard, Documents, etc.)
4. ⏳ Implement API services
5. ⏳ Set up authentication
6. ⏳ Connect to backend
7. ⏳ Test and deploy

## Common Commands

```bash
# Fresh install
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix common issues
npm audit fix
```

## Troubleshooting

### Port already in use
```bash
# Change port in vite.config.ts
server: {
  port: 3001,  # Change to different port
}
```

### API calls not working
- Check `.env.local` VITE_API_BASE_URL
- Ensure backend is running on localhost:8000
- Check browser DevTools Network tab

### TypeScript errors
```bash
npm run type-check
```

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
