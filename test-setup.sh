#!/bin/bash

# ===============================================
# Lien Professor App - Testing Quick Start
# ===============================================

echo "🚀 Lien Professor App - Testing Setup"
echo "======================================"
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if ! npm list vitest > /dev/null 2>&1; then
  echo "❌ Testing dependencies not found. Installing..."
  npm install -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
  npm install sonner
else
  echo "✅ Testing dependencies installed"
fi

echo ""
echo "🧪 Available Test Commands:"
echo "  npm run test           - Run all tests"
echo "  npm run test:watch     - Run tests in watch mode"
echo "  npm run test:ui        - Open interactive test UI"
echo "  npm run test:coverage  - Generate coverage report"
echo ""

# Run tests
echo "Running tests..."
npm run test

echo ""
echo "✨ Setup complete! Check IMPLEMENTATION_STATUS.md for next steps."
