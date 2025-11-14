# Lien Professor App

A modern web application for Texas lien kit assessment and purchasing, built for Lovein Ribman P.C.

## 🏗️ Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
./quick-setup.sh
```

### Option 2: Manual Setup
Follow the detailed instructions in [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 📋 Prerequisites

- Node.js 18+
- Git
- VS Code (recommended)
- GitHub account

## 🏛️ Architecture

This application follows a modern, scalable architecture:

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: TanStack Query + Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe
- **Deployment**: Vercel

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Features

### Phase 1 - Foundation
- [x] Project setup and configuration
- [ ] User authentication (Supabase Auth)
- [ ] Basic UI components and layout
- [ ] Database schema and RLS policies

### Phase 2 - Assessment & E-commerce
- [ ] Interactive lien assessment tool
- [ ] Kit catalog and product pages
- [ ] Shopping cart functionality
- [ ] Stripe payment integration

### Phase 3 - User Dashboard
- [ ] User profile management
- [ ] Purchased kits display
- [ ] Dashboard navigation

### Phase 4 - Forms System
- [ ] Dynamic form builder
- [ ] Form completion interface
- [ ] Data validation and submission
- [ ] Draft saving functionality

### Phase 5 - Document Generation
- [ ] PDF template system
- [ ] Form data to PDF conversion
- [ ] Document preview and download
- [ ] File storage integration

### Phase 6 - Advanced Features
- [ ] Deadline tracking system
- [ ] Email notifications
- [ ] Attorney portal
- [ ] Case management tools

## 🛠️ Development

### Start Development Server
```bash
npm run dev
```

### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── forms/           # Form-specific components
│   ├── layout/          # Layout components
│   └── common/          # Shared business components
├── features/            # Feature-based modules
│   ├── assessment/      # Assessment engine
│   ├── ecommerce/       # Kit catalog & purchasing
│   ├── dashboard/       # User dashboard
│   ├── forms/           # Online form system
│   ├── documents/       # PDF generation
│   ├── deadlines/       # Deadline tracking
│   └── admin/           # Attorney portal
├── lib/                 # Utility libraries
├── hooks/               # Global custom hooks
├── stores/              # Zustand stores
├── types/               # Global TypeScript types
└── styles/              # Global styles
```

## 🌐 Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

## 🔐 Security

This application implements several security measures:

- **Row Level Security (RLS)** in Supabase
- **End-to-end encryption** for sensitive data
- **Role-based access control**
- **Secure file storage** with access controls
- **Input validation** and sanitization
- **HTTPS everywhere**

## 🤝 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `chore/task-description` - Maintenance tasks
- `docs/update-description` - Documentation updates

### Commit Messages
We use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code formatting
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md) - Detailed system architecture
- [Setup Guide](./SETUP_GUIDE.md) - Step-by-step setup instructions

## 🎯 VS Code Setup

Recommended extensions:
- GitHub Copilot & Copilot Chat
- ES7+ React snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Thunder Client

## 📄 License

This project is proprietary software developed for Lovein Ribman P.C.

## 🤖 AI Development

This project is optimized for development with GitHub Copilot:
- TypeScript throughout for better IntelliSense
- Clear, descriptive component and function names
- Consistent patterns and conventions
- Feature-based architecture for focused development

---

**Built with ❤️ for Texas legal professionals**
