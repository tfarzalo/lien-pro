# Lien Professor App - Complete Setup Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account
- VS Code with recommended extensions

## Step 1: Git Repository Setup

### 1.1 Initialize Local Repository
```bash
# Navigate to project directory
cd "/Users/timothyfarzalo/Desktop/Lien Professor App"

# Initialize git repository
git init

# Create initial .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules
/.pnp
.pnp.js

# Production builds
/dist
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# IDE files
.vscode/settings.json
.vscode/launch.json
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Vercel
.vercel

# Supabase
supabase/.branches
supabase/.temp
supabase/logs
EOF
```

### 1.2 Connect to GitHub
```bash
# Create repository on GitHub (replace YOUR_USERNAME)
gh repo create lien-professor-app --public --description "Texas lien kit assessment and purchasing platform"

# Or manually create at github.com and then:
git remote add origin https://github.com/YOUR_USERNAME/lien-professor-app.git
```

## Step 2: Vite + React + TypeScript Project Setup

### 2.1 Initialize Vite Project
```bash
# Create Vite React TypeScript project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install
```

### 2.2 Update package.json Scripts
Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

## Step 3: Install and Configure Dependencies

### 3.1 Install Core Dependencies
```bash
# React Router
npm install react-router-dom
npm install -D @types/react-router-dom

# TanStack Query (React Query)
npm install @tanstack/react-query @tanstack/react-query-devtools

# Supabase
npm install @supabase/supabase-js

# Form handling
npm install react-hook-form @hookform/resolvers zod

# State management
npm install zustand

# Utilities
npm install clsx tailwind-merge lucide-react

# Date handling
npm install date-fns
```

### 3.2 Install and Configure Tailwind CSS
```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional Tailwind plugins
npm install -D @tailwindcss/forms @tailwindcss/typography
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}
```

### 3.3 Install and Configure shadcn/ui
```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest init

# When prompted, choose:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Install initial components
npx shadcn-ui@latest add button card input label
npx shadcn-ui@latest add navigation-menu sheet
npx shadcn-ui@latest add toast alert-dialog
```

### 3.4 Configure ESLint and Prettier
```bash
# Install ESLint and Prettier
npm install -D eslint-config-prettier prettier eslint-plugin-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

Create `.eslintrc.cjs`:
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
```

Create `.prettierrc`:
```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## Step 4: Project Structure Setup

### 4.1 Create Folder Structure
```bash
# Create main directories
mkdir -p src/{components/{ui,forms,layout,common},features/{assessment,ecommerce,dashboard,forms,documents,deadlines,admin},lib,hooks,stores,types,styles,pages}

# Create component subdirectories
mkdir -p src/features/assessment/{components,hooks,services}
mkdir -p src/features/ecommerce/{components,hooks,services}
mkdir -p src/features/dashboard/{components,hooks,services}
mkdir -p src/features/forms/{components,hooks,services}
mkdir -p src/features/documents/{components,hooks,services}
mkdir -p src/features/deadlines/{components,hooks,services}
mkdir -p src/features/admin/{components,hooks,services}
```

## Step 5: Core Configuration Files

### 5.1 Update main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/globals.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### 5.2 Create App.tsx
```typescript
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { AssessmentPage } from '@/pages/AssessmentPage'
import { KitsPage } from '@/pages/KitsPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { FormPage } from '@/pages/FormPage'
import { AuthGuard } from '@/components/common/AuthGuard'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="assessment" element={<AssessmentPage />} />
          <Route path="kits" element={<KitsPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="forms/:id" element={<FormPage />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
```

### 5.3 Create Supabase Configuration
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  getCurrentUser: () => supabase.auth.getUser(),
  
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
}
```

### 5.4 Create Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### 5.5 Update CSS Files
Replace `src/index.css` with `src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 5.6 Create Utility Files
Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
```

## Step 6: Initial Page Components

### 6.1 Create Layout Component
Create `src/components/layout/Layout.tsx`:
```typescript
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

### 6.2 Create Basic Pages
Create `src/pages/HomePage.tsx`:
```typescript
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Texas Lien Solutions Made Simple
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Get the right lien kit for your situation with our interactive assessment tool. 
          Complete your forms online and let our attorneys guide you through the process.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link to="/assessment">Start Assessment</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/kits">Browse Kits</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

Create placeholder pages:
```bash
# Create basic page templates
cat > src/pages/AssessmentPage.tsx << 'EOF'
export function AssessmentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lien Assessment</h1>
      <p>Assessment functionality coming soon...</p>
    </div>
  )
}
EOF

cat > src/pages/KitsPage.tsx << 'EOF'
export function KitsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lien Kits</h1>
      <p>Kit catalog coming soon...</p>
    </div>
  )
}
EOF

cat > src/pages/CheckoutPage.tsx << 'EOF'
export function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <p>Checkout functionality coming soon...</p>
    </div>
  )
}
EOF

cat > src/pages/DashboardPage.tsx << 'EOF'
export function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <p>Dashboard functionality coming soon...</p>
    </div>
  )
}
EOF

cat > src/pages/FormPage.tsx << 'EOF'
import { useParams } from 'react-router-dom'

export function FormPage() {
  const { id } = useParams()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Form {id}</h1>
      <p>Form functionality coming soon...</p>
    </div>
  )
}
EOF
```

## Step 7: Git Workflow and Branch Naming

### 7.1 Initial Commit
```bash
# Stage all files
git add .

# Initial commit
git commit -m "feat: initial project setup with Vite, React, TypeScript, and Tailwind CSS

- Configure Vite + React + TypeScript project
- Install and configure Tailwind CSS with shadcn/ui
- Set up React Router with initial routes
- Configure TanStack Query for data fetching
- Add Supabase client setup
- Configure ESLint and Prettier
- Create basic project structure and layout
- Add placeholder pages for main routes"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 7.2 Branch Naming Conventions
```bash
# Feature branches
git checkout -b feature/assessment-engine
git checkout -b feature/user-authentication
git checkout -b feature/kit-catalog
git checkout -b feature/payment-integration

# Bug fixes
git checkout -b fix/form-validation-error
git checkout -b fix/mobile-responsive-issues

# Chores/maintenance
git checkout -b chore/update-dependencies
git checkout -b chore/improve-test-coverage

# Documentation
git checkout -b docs/api-documentation
git checkout -b docs/deployment-guide
```

### 7.3 Commit Message Convention
Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Step 8: Development Workflow

### 8.1 Start Development Server
```bash
npm run dev
```

### 8.2 Code Quality Checks
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### 8.3 Build for Production
```bash
npm run build
npm run preview
```

## Next Steps

1. **Set up Supabase project** and add environment variables
2. **Create database schema** based on architecture document
3. **Implement authentication flow** with Supabase Auth
4. **Start with Phase 1 features** as outlined in ARCHITECTURE.md
5. **Set up Vercel deployment** for automatic deployments

Your project is now ready for development! The foundation is solid and follows modern React best practices with TypeScript, proper tooling, and a scalable architecture.
