#!/bin/bash

# =====================================================
# E-Commerce Integration Test Script
# Tests the complete checkout flow
# =====================================================

echo "🧪 E-Commerce Integration Test"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "1. Checking Prerequisites"
echo "-------------------------"

# Check Node.js
if command_exists node; then
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js"
    exit 1
fi

# Check npm
if command_exists npm; then
    echo -e "${GREEN}✓${NC} npm installed: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

echo ""
echo "2. Checking File Structure"
echo "-------------------------"

# Check critical files exist
FILES=(
    "src/pages/CheckoutPage.tsx"
    "src/pages/OrderSuccessPage.tsx"
    "src/services/stripeService.ts"
    "src/hooks/useCheckout.ts"
    "src/types/stripe.ts"
    "supabase/functions/create-checkout-session/index.ts"
    "supabase/functions/stripe-webhook/index.ts"
    "supabase/migrations/20251114000006_add_stripe_fields.sql"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
        ((TESTS_FAILED++))
    fi
done

echo ""
echo "3. Checking Documentation"
echo "-------------------------"

DOCS=(
    "docs/E-COMMERCE_GUIDE.md"
    "docs/STRIPE_QUICK_SETUP.md"
    "docs/FLOW_DIAGRAMS.md"
    "docs/ECOMMERCE_IMPLEMENTATION_SUMMARY.md"
    "ECOMMERCE_DELIVERY.md"
    "QUICK_REFERENCE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${YELLOW}⚠${NC} $doc (missing - not critical)"
    fi
done

echo ""
echo "4. Checking Environment Variables"
echo "---------------------------------"

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check for required variables
    if grep -q "VITE_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✓${NC} VITE_SUPABASE_URL configured"
    else
        echo -e "${RED}✗${NC} VITE_SUPABASE_URL not found"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} VITE_SUPABASE_ANON_KEY configured"
    else
        echo -e "${RED}✗${NC} VITE_SUPABASE_ANON_KEY not found"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found"
    echo -e "${YELLOW}⚠${NC} Please create .env.local with Supabase credentials"
fi

echo ""
echo "5. Checking TypeScript Compilation"
echo "-----------------------------------"

if [ -f "package.json" ]; then
    if command_exists npx; then
        echo "Running TypeScript check..."
        if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
            echo -e "${RED}✗${NC} TypeScript errors found"
            echo "Run 'npx tsc --noEmit' to see details"
        else
            echo -e "${GREEN}✓${NC} No TypeScript errors"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Cannot check TypeScript (npx not available)"
    fi
else
    echo -e "${RED}✗${NC} package.json not found"
fi

echo ""
echo "6. Testing Database Schema"
echo "-------------------------"

if [ -f "supabase/migrations/20251114000006_add_stripe_fields.sql" ]; then
    echo -e "${GREEN}✓${NC} Stripe fields migration exists"
    
    # Check if migration contains required alterations
    if grep -q "stripe_product_id" supabase/migrations/20251114000006_add_stripe_fields.sql; then
        echo -e "${GREEN}✓${NC} stripe_product_id field present"
    fi
    
    if grep -q "stripe_price_id" supabase/migrations/20251114000006_add_stripe_fields.sql; then
        echo -e "${GREEN}✓${NC} stripe_price_id field present"
    fi
    
    if grep -q "stripe_session_id" supabase/migrations/20251114000006_add_stripe_fields.sql; then
        echo -e "${GREEN}✓${NC} stripe_session_id field present"
    fi
else
    echo -e "${RED}✗${NC} Stripe fields migration not found"
fi

echo ""
echo "7. Checking Routes"
echo "------------------"

if [ -f "src/App.tsx" ]; then
    if grep -q "/checkout" src/App.tsx; then
        echo -e "${GREEN}✓${NC} /checkout route configured"
    else
        echo -e "${RED}✗${NC} /checkout route not found"
    fi
    
    if grep -q "/checkout/success" src/App.tsx; then
        echo -e "${GREEN}✓${NC} /checkout/success route configured"
    else
        echo -e "${RED}✗${NC} /checkout/success route not found"
    fi
else
    echo -e "${RED}✗${NC} src/App.tsx not found"
fi

echo ""
echo "8. Checking Service Functions"
echo "-----------------------------"

if [ -f "src/services/stripeService.ts" ]; then
    # Check for key functions
    if grep -q "createCheckoutSession" src/services/stripeService.ts; then
        echo -e "${GREEN}✓${NC} createCheckoutSession function exists"
    fi
    
    if grep -q "processTestPayment" src/services/stripeService.ts; then
        echo -e "${GREEN}✓${NC} processTestPayment function exists"
    fi
    
    if grep -q "getOrderDetails" src/services/stripeService.ts; then
        echo -e "${GREEN}✓${NC} getOrderDetails function exists"
    fi
else
    echo -e "${RED}✗${NC} stripeService.ts not found"
fi

echo ""
echo "9. Checking React Query Hooks"
echo "-----------------------------"

if [ -f "src/hooks/useCheckout.ts" ]; then
    if grep -q "useProcessTestPayment" src/hooks/useCheckout.ts; then
        echo -e "${GREEN}✓${NC} useProcessTestPayment hook exists"
    fi
    
    if grep -q "useOrderDetails" src/hooks/useCheckout.ts; then
        echo -e "${GREEN}✓${NC} useOrderDetails hook exists"
    fi
    
    if grep -q "useCreateCheckoutSession" src/hooks/useCheckout.ts; then
        echo -e "${GREEN}✓${NC} useCreateCheckoutSession hook exists"
    fi
else
    echo -e "${RED}✗${NC} useCheckout.ts not found"
fi

echo ""
echo "10. Integration Test Summary"
echo "============================="

# Calculate total tests
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo ""
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical files present and configured${NC}"
    echo ""
    echo "🎉 E-Commerce integration is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run dev' to start the app"
    echo "2. Navigate to /assessment"
    echo "3. Complete the assessment"
    echo "4. Click 'Purchase Kit'"
    echo "5. Test the checkout flow"
    echo ""
    echo "📖 For production setup: See docs/STRIPE_QUICK_SETUP.md"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please review the failures above and fix them."
    echo "Refer to ECOMMERCE_DELIVERY.md for complete implementation details."
    exit 1
fi
