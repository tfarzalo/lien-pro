# Lien Professor App

A modern React + TypeScript web application for Texas lien kit assessment and purchasing, built for Lovein Ribman P.C.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd "Lien Professor App"

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Start development server
npm run dev
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **VS Code** (recommended IDE)
- **Supabase account** for backend services
- **Modern web browser** for development

## �️ Tech Stack

This application is built with a modern, scalable architecture:

### Frontend
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe JavaScript for better DX
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation

### Backend & Services
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **Authentication** - Supabase Auth with social providers
- **Real-time subscriptions** - Live data updates

### Developer Experience
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Hot Module Replacement** - Instant dev updates

## ✨ Features

### 🎯 Core Features (Planned)
- **Lien Assessment Tool** - Interactive questionnaire for lien eligibility
- **Kit Catalog** - Browse and purchase lien kits
- **User Dashboard** - Manage profile and purchased kits
- **Form Builder** - Dynamic legal form creation and completion
- **Document Generation** - PDF creation from form data
- **Deadline Tracking** - Important date management
- **Attorney Portal** - Professional tools and case management

### 🔧 Current Implementation Status
- [x] Modern React + TypeScript setup with Vite
- [x] Tailwind CSS styling system
- [x] State management with Zustand
- [x] Server state with TanStack Query
- [x] Form handling with React Hook Form + Zod
- [x] Supabase integration ready
- [x] Routing with React Router
- [x] Development tooling (ESLint, Prettier)
- [x] Icon system with Lucide React
- [x] Authentication guard components
- [x] **Supabase database schema** - Complete PostgreSQL schema with RLS
- [x] **TypeScript types** - Type-safe database interfaces
- [x] **Data access layer** - Service functions for all major entities
- [x] **React Query hooks** - useLienKits, useOrders, useAssessments, useDashboard
- [x] **Example dashboard** - Fully implemented with live data
- [x] Authentication flows
- [x] UI component library
- [ ] Business logic implementation (assessment scoring, PDF generation)
- [ ] Payment integration
- [ ] Attorney portal features

## 📖 Documentation

### Architecture & Development Guides

- **[Data Access Layer](./docs/DATA_ACCESS_LAYER.md)** - Complete guide to TypeScript types, service functions, and React Query hooks
- **[Quick Start Guide](./docs/QUICK_START_GUIDE.md)** - Fast examples for common data access patterns
- **[Database Schema](./supabase/migrations/README.md)** - PostgreSQL schema, RLS policies, and migration instructions

### Key Concepts

- **TypeScript Types** (`src/types/database.ts`) - Type-safe interfaces for all database tables
- **Service Layer** (`src/services/`) - Business logic and database access functions
- **React Query Hooks** (`src/hooks/`) - Data fetching and caching with React Query
- **Example Implementation** (`src/pages/EnhancedDashboardPage.tsx`) - Real-world usage example

## 🛠️ Development

### Available Scripts

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Format code with Prettier
npm run format

# Type check without emitting
npm run type-check
```

### Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Make your changes** in the `src/` directory
3. **Check for errors**: `npm run lint` and `npm run type-check`
4. **Format code**: `npm run format`
5. **Test your changes** in the browser
6. **Commit with conventional commits`

## 📁 Project Structure

```
/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Shared business components
│   │   │   └── AuthGuard.tsx
│   │   └── layout/        # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.ts     # Authentication hook
│   ├── lib/               # Utility libraries and configurations
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles
│   │   └── globals.css    # Main CSS with Tailwind directives
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── prettier.config.js    # Prettier configuration
├── README.md             # Project documentation
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for Node.js
└── vite.config.ts        # Vite configuration
```

### Key Directories

- **`src/components/`** - Reusable React components organized by purpose
- **`src/hooks/`** - Custom React hooks for shared logic
- **`src/lib/`** - Utility functions, configurations, and external service integrations
- **`src/stores/`** - Zustand stores for global state management
- **`src/types/`** - TypeScript type definitions and interfaces

## 🌐 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Additional service keys
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### Getting Supabase Credentials

1. Create a [Supabase account](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**
5. Paste them into your `.env.local` file

## 🔐 Security & Best Practices

### Security Measures
- **Type Safety** - Full TypeScript coverage prevents runtime errors
- **Input Validation** - Zod schemas validate all user inputs
- **Authentication Guards** - Protected routes and components
- **Environment Variables** - Sensitive data kept in `.env.local`
- **Supabase RLS** - Row Level Security for database access
- **HTTPS Everywhere** - Secure connections in production

### Code Quality
- **ESLint** - Catches potential bugs and enforces standards
- **Prettier** - Consistent code formatting
- **TypeScript** - Static type checking
- **Conventional Commits** - Standardized commit messages

## 🤝 Contributing & Git Workflow

### Branch Naming Convention
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes  
- `chore/task-description` - Maintenance tasks
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring

### Commit Message Format
We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat: add user authentication flow
fix: resolve form validation issue
docs: update setup instructions
style: format code with prettier
refactor: reorganize component structure
chore: update dependencies
```

### Development Process
1. Create a feature branch from `main`
2. Make your changes with descriptive commits
3. Run `npm run lint` and `npm run type-check`
4. Test your changes thoroughly
5. Create a pull request with detailed description

## 🎯 VS Code Setup

### Recommended Extensions
Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "GitHub.copilot",
    "GitHub.copilot-chat", 
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### VS Code Settings
Add these to your workspace settings for optimal TypeScript and React development:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🔧 Troubleshooting

### Common Issues

**Port 5173 is already in use**
```bash
# Kill the process using the port
npx kill-port 5173
# Or use a different port
npm run dev -- --port 3000
```

**Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors after installing new packages**
```bash
# Restart TypeScript language server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | ^18.3.1 | UI library |
| TypeScript | ^5.6.2 | Type safety |
| Vite | ^5.4.10 | Build tool |
| Tailwind CSS | ^3.4.14 | Styling |
| Zustand | ^5.0.1 | State management |
| TanStack Query | ^5.59.16 | Server state |
| React Hook Form | ^7.53.2 | Form handling |
| Zod | ^3.23.8 | Schema validation |
| Supabase | ^2.46.1 | Backend services |
| React Router | ^6.27.0 | Routing |
| Lucide React | ^0.453.0 | Icons |

## 📄 License

This project is proprietary software developed for Lovein Ribman P.C. All rights reserved.

## 🤖 AI-Powered Development

This project is optimized for AI-assisted development:

- **TypeScript everywhere** for better IntelliSense and AI suggestions
- **Clear naming conventions** for components, functions, and variables  
- **Consistent code patterns** that AI can easily understand and extend
- **Comprehensive type definitions** for better AI code generation
- **Well-structured component architecture** for focused development

---

**Built with ❤️ for Texas legal professionals using modern web technologies**
