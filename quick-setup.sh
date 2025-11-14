#!/bin/bash

# Lien Professor App - Quick Setup Script
# This script automates the entire project setup process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Lien Professor App - Quick Setup${NC}"
echo "=================================================="

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}📋 Checking requirements...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements met${NC}"
}

# Initialize Git repository
setup_git() {
    echo -e "${YELLOW}🔧 Setting up Git repository...${NC}"
    
    if [ ! -d ".git" ]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    else
        echo -e "${BLUE}ℹ️  Git repository already exists${NC}"
    fi
}

# Create Vite React TypeScript project
setup_vite() {
    echo -e "${YELLOW}⚡ Setting up Vite + React + TypeScript...${NC}"
    
    if [ ! -f "package.json" ]; then
        npm create vite@latest . -- --template react-ts
        echo -e "${GREEN}✅ Vite project created${NC}"
    else
        echo -e "${BLUE}ℹ️  Package.json already exists, skipping Vite setup${NC}"
    fi
}

# Install all dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    # Install base dependencies
    npm install
    
    # Install additional dependencies
    npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools
    npm install @supabase/supabase-js
    npm install react-hook-form @hookform/resolvers zod
    npm install zustand
    npm install clsx tailwind-merge lucide-react
    npm install date-fns
    
    # Install dev dependencies
    npm install -D @types/react-router-dom
    npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography
    npm install -D eslint-config-prettier prettier eslint-plugin-prettier
    npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Setup Tailwind CSS
setup_tailwind() {
    echo -e "${YELLOW}🎨 Setting up Tailwind CSS...${NC}"
    
    if [ ! -f "tailwind.config.js" ]; then
        npx tailwindcss init -p
        echo -e "${GREEN}✅ Tailwind CSS initialized${NC}"
    else
        echo -e "${BLUE}ℹ️  Tailwind config already exists${NC}"
    fi
}

# Setup shadcn/ui
setup_shadcn() {
    echo -e "${YELLOW}🎯 Setting up shadcn/ui...${NC}"
    
    # Initialize shadcn/ui with default settings
    npx shadcn-ui@latest init --defaults --yes
    
    # Install common components
    npx shadcn-ui@latest add button card input label navigation-menu sheet toast alert-dialog
    
    echo -e "${GREEN}✅ shadcn/ui components installed${NC}"
}

# Create project structure
create_structure() {
    echo -e "${YELLOW}📁 Creating project structure...${NC}"
    
    # Create main directories
    mkdir -p src/{components/{ui,forms,layout,common},features/{assessment,ecommerce,dashboard,forms,documents,deadlines,admin},lib,hooks,stores,types,styles,pages}
    
    # Create feature subdirectories
    mkdir -p src/features/assessment/{components,hooks,services}
    mkdir -p src/features/ecommerce/{components,hooks,services}
    mkdir -p src/features/dashboard/{components,hooks,services}
    mkdir -p src/features/forms/{components,hooks,services}
    mkdir -p src/features/documents/{components,hooks,services}
    mkdir -p src/features/deadlines/{components,hooks,services}
    mkdir -p src/features/admin/{components,hooks,services}
    
    echo -e "${GREEN}✅ Project structure created${NC}"
}

# Create configuration files
create_configs() {
    echo -e "${YELLOW}⚙️  Creating configuration files...${NC}"
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
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
    fi
    
    # Create .env.local template
    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
EOF
    fi
    
    # Create .eslintrc.cjs
    cat > .eslintrc.cjs << 'EOF'
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
EOF
    
    # Create .prettierrc
    cat > .prettierrc << 'EOF'
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
EOF
    
    echo -e "${GREEN}✅ Configuration files created${NC}"
}

# Final setup message
finish_setup() {
    echo ""
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo "=================================================="
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Set up your Supabase project and update .env.local"
    echo "2. Create a GitHub repository and connect it:"
    echo "   ${YELLOW}git remote add origin https://github.com/YOUR_USERNAME/lien-professor-app.git${NC}"
    echo "3. Make your first commit:"
    echo "   ${YELLOW}git add .${NC}"
    echo "   ${YELLOW}git commit -m \"feat: initial project setup\"${NC}"
    echo "   ${YELLOW}git push -u origin main${NC}"
    echo "4. Start the development server:"
    echo "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "- Architecture: ARCHITECTURE.md"
    echo "- Setup Guide: SETUP_GUIDE.md"
    echo ""
    echo -e "${BLUE}🚀 Happy coding!${NC}"
}

# Main execution
main() {
    check_requirements
    setup_git
    setup_vite
    install_dependencies
    setup_tailwind
    create_structure
    create_configs
    
    # Note: shadcn/ui setup is commented out as it requires interactive input
    # setup_shadcn
    
    finish_setup
}

# Run main function
main
