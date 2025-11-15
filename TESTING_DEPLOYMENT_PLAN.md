# Testing, Hardening & Deployment Plan
## Lien Professor Application

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Error Handling & Logging](#error-handling--logging)
3. [Deployment Checklist](#deployment-checklist)
4. [Git Branching & Release Strategy](#git-branching--release-strategy)
5. [Production Readiness Checklist](#production-readiness-checklist)

---

## Testing Strategy

### Test Pyramid Overview

```
        /\
       /  \      E2E Tests (5%)
      /____\     - Critical user flows
     /      \    
    /        \   Integration Tests (25%)
   /__________\  - API + UI interactions
  /            \ 
 /              \ Unit Tests (70%)
/________________\ - Pure functions, utilities
```

### 1. Unit Tests (70% of tests)

#### Priority Functions to Test

**A. Assessment Logic (`src/lib/assessmentQuestions.ts`, `kitRecommendationEngine.ts`)**

```typescript
// Test file: src/lib/__tests__/assessmentQuestions.test.ts

import { describe, it, expect } from 'vitest'
import { getRecommendation, calculateScore } from '../kitRecommendationEngine'

describe('Kit Recommendation Engine', () => {
  describe('calculateScore', () => {
    it('should recommend Preliminary Notice for early stage projects', () => {
      const answers = {
        stage: 'early',
        role: 'general_contractor',
        amount: 50000,
        state: 'TX'
      }
      const result = getRecommendation(answers)
      expect(result.primaryKit).toBe('preliminary-notice')
      expect(result.score).toBeGreaterThan(0.7)
    })

    it('should recommend Mechanic Lien for unpaid work', () => {
      const answers = {
        stage: 'completed',
        paymentStatus: 'unpaid',
        role: 'subcontractor',
        amount: 75000,
        state: 'TX'
      }
      const result = getRecommendation(answers)
      expect(result.primaryKit).toBe('mechanics-lien')
    })

    it('should recommend Release of Lien after payment', () => {
      const answers = {
        stage: 'completed',
        paymentStatus: 'paid',
        hasLien: true,
        role: 'general_contractor',
        state: 'TX'
      }
      const result = getRecommendation(answers)
      expect(result.primaryKit).toBe('release-of-lien')
    })

    it('should handle edge cases gracefully', () => {
      const emptyAnswers = {}
      const result = getRecommendation(emptyAnswers)
      expect(result.primaryKit).toBeDefined()
      expect(result.secondaryKits).toBeInstanceOf(Array)
    })
  })

  describe('score calculation', () => {
    it('should weight role appropriately', () => {
      const gcAnswers = { role: 'general_contractor', stage: 'early' }
      const subAnswers = { role: 'subcontractor', stage: 'early' }
      
      const gcScore = calculateScore('preliminary-notice', gcAnswers)
      const subScore = calculateScore('preliminary-notice', subAnswers)
      
      expect(gcScore).toBeGreaterThan(subScore)
    })

    it('should factor in project amount', () => {
      const smallProject = { amount: 5000, role: 'subcontractor' }
      const largeProject = { amount: 500000, role: 'subcontractor' }
      
      const smallScore = calculateScore('mechanics-lien', smallProject)
      const largeScore = calculateScore('mechanics-lien', largeProject)
      
      expect(largeScore).toBeGreaterThan(smallScore)
    })
  })
})
```

**B. Deadline Calculator (`src/lib/deadlineCalculator.ts`)**

```typescript
// Test file: src/lib/__tests__/deadlineCalculator.test.ts

import { describe, it, expect } from 'vitest'
import { calculateDeadlines, calculatePreliminaryNoticeDeadline } from '../deadlineCalculator'
import { addDays, addMonths } from 'date-fns'

describe('Deadline Calculator', () => {
  describe('calculatePreliminaryNoticeDeadline', () => {
    it('should calculate 15th day of 2nd month for GC', () => {
      const startDate = new Date('2024-01-05')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: startDate,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate).toEqual(new Date('2024-02-15'))
      expect(result.daysRemaining).toBeGreaterThan(0)
    })

    it('should calculate correct deadline for subcontractor', () => {
      const laborStartDate = new Date('2024-03-10')
      const result = calculatePreliminaryNoticeDeadline({
        laborStartDate,
        role: 'subcontractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate).toEqual(new Date('2024-04-15'))
    })

    it('should handle edge case of start date near month end', () => {
      const startDate = new Date('2024-01-31')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: startDate,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.deadlineDate.getDate()).toBe(15)
      expect(result.deadlineDate.getMonth()).toBe(2) // March (0-indexed)
    })

    it('should mark as overdue when past deadline', () => {
      const pastDate = new Date('2023-01-01')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: pastDate,
        role: 'general_contractor',
        state: 'TX'
      })
      
      expect(result.status).toBe('overdue')
      expect(result.daysRemaining).toBeLessThan(0)
    })
  })

  describe('calculateDeadlines (all deadlines)', () => {
    it('should return all required deadlines for a project', () => {
      const input = {
        projectStartDate: new Date('2024-01-01'),
        lastWorkDate: new Date('2024-06-30'),
        role: 'general_contractor',
        state: 'TX',
        projectType: 'commercial'
      }
      
      const result = calculateDeadlines(input)
      
      expect(result).toHaveProperty('preliminaryNotice')
      expect(result).toHaveProperty('mechanicsLien')
      expect(result).toHaveProperty('fundsTrapping')
      expect(result.preliminaryNotice.deadlineType).toBe('preliminary_notice')
    })

    it('should calculate proper urgency levels', () => {
      const result = calculateDeadlines({
        projectStartDate: addDays(new Date(), -40),
        role: 'general_contractor',
        state: 'TX'
      })
      
      const prelim = result.preliminaryNotice
      if (prelim.daysRemaining <= 7) {
        expect(prelim.urgency).toBe('urgent')
      } else if (prelim.daysRemaining <= 30) {
        expect(prelim.urgency).toBe('high')
      }
    })
  })

  describe('business day calculations', () => {
    it('should skip weekends', () => {
      const friday = new Date('2024-01-05') // Friday
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: friday,
        role: 'general_contractor',
        state: 'TX',
        includeBusinessDaysOnly: true
      })
      
      // Should account for weekends in calculation
      expect(result.deadlineDate.getDay()).not.toBe(0) // Not Sunday
      expect(result.deadlineDate.getDay()).not.toBe(6) // Not Saturday
    })

    it('should skip holidays', () => {
      const beforeHoliday = new Date('2024-12-20')
      const result = calculatePreliminaryNoticeDeadline({
        projectStartDate: beforeHoliday,
        role: 'general_contractor',
        state: 'TX',
        includeBusinessDaysOnly: true
      })
      
      // Should not land on Christmas
      expect(result.deadlineDate).not.toEqual(new Date('2024-12-25'))
    })
  })
})
```

**C. Form Utilities (`src/lib/formUtils.ts`)**

```typescript
// Test file: src/lib/__tests__/formUtils.test.ts

import { describe, it, expect } from 'vitest'
import { validateFormData, formatCurrency, parsePhoneNumber } from '../formUtils'

describe('Form Utilities', () => {
  describe('validateFormData', () => {
    it('should validate required fields', () => {
      const invalidData = { name: '' }
      const schema = { name: { required: true } }
      
      const result = validateFormData(invalidData, schema)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('should validate email format', () => {
      const validEmail = { email: 'user@example.com' }
      const invalidEmail = { email: 'not-an-email' }
      const schema = { email: { type: 'email', required: true } }
      
      expect(validateFormData(validEmail, schema).isValid).toBe(true)
      expect(validateFormData(invalidEmail, schema).isValid).toBe(false)
    })

    it('should validate phone numbers', () => {
      const validPhone = { phone: '(512) 555-1234' }
      const invalidPhone = { phone: '123' }
      const schema = { phone: { type: 'phone', required: true } }
      
      expect(validateFormData(validPhone, schema).isValid).toBe(true)
      expect(validateFormData(invalidPhone, schema).isValid).toBe(false)
    })

    it('should validate dollar amounts', () => {
      const validAmount = { amount: '$50,000.00' }
      const invalidAmount = { amount: 'not a number' }
      const schema = { amount: { type: 'currency', required: true } }
      
      expect(validateFormData(validAmount, schema).isValid).toBe(true)
      expect(validateFormData(invalidAmount, schema).isValid).toBe(false)
    })
  })

  describe('formatCurrency', () => {
    it('should format numbers as currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00')
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should handle negative values', () => {
      expect(formatCurrency(-500)).toBe('-$500.00')
    })
  })

  describe('parsePhoneNumber', () => {
    it('should normalize phone number formats', () => {
      expect(parsePhoneNumber('512-555-1234')).toBe('5125551234')
      expect(parsePhoneNumber('(512) 555-1234')).toBe('5125551234')
      expect(parsePhoneNumber('512.555.1234')).toBe('5125551234')
    })
  })
})
```

**D. Utils (`src/lib/utils.ts`)**

```typescript
// Test file: src/lib/__tests__/utils.test.ts

import { describe, it, expect } from 'vitest'
import { cn, formatDate, truncate, debounce } from '../utils'

describe('Utility Functions', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', false && 'hidden', true && 'visible'))
        .toBe('base visible')
    })
  })

  describe('formatDate', () => {
    it('should format dates consistently', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('January 15, 2024')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const longString = 'This is a very long string that needs truncating'
      expect(truncate(longString, 20)).toHaveLength(23) // 20 + "..."
    })

    it('should not truncate short strings', () => {
      expect(truncate('Short', 20)).toBe('Short')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0
      const fn = debounce(() => callCount++, 100)
      
      fn()
      fn()
      fn()
      
      expect(callCount).toBe(0) // Not called yet
      
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(callCount).toBe(1) // Called once after delay
    })
  })
})
```

### 2. Integration Tests (25% of tests)

**A. Form Submission Flow**

```typescript
// Test file: src/__tests__/integration/formSubmission.test.tsx

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FormCompletionPage from '@/pages/FormCompletionPage'
import * as lienKitsService from '@/services/lienKitsService'

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        }))
      }))
    }))
  }
}))

describe('Form Submission Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete form submission flow', async () => {
    const mockForm = {
      id: 'form-1',
      title: 'Preliminary Notice',
      fields: [
        { name: 'contractor_name', type: 'text', required: true },
        { name: 'property_address', type: 'text', required: true },
        { name: 'contract_amount', type: 'number', required: true }
      ]
    }

    render(
      <BrowserRouter>
        <FormCompletionPage />
      </BrowserRouter>
    )

    // Fill out form
    const nameInput = screen.getByLabelText(/contractor name/i)
    const addressInput = screen.getByLabelText(/property address/i)
    const amountInput = screen.getByLabelText(/contract amount/i)

    fireEvent.change(nameInput, { target: { value: 'ABC Construction' } })
    fireEvent.change(addressInput, { target: { value: '123 Main St' } })
    fireEvent.change(amountInput, { target: { value: '50000' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument()
    })
  })

  it('should show validation errors', async () => {
    render(
      <BrowserRouter>
        <FormCompletionPage />
      </BrowserRouter>
    )

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)

    // Should show error messages
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    // Mock API failure
    vi.spyOn(lienKitsService, 'submitForm').mockRejectedValue(
      new Error('Network error')
    )

    render(
      <BrowserRouter>
        <FormCompletionPage />
      </BrowserRouter>
    )

    // Fill and submit form
    // ... (fill form fields)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

**B. Checkout Flow**

```typescript
// Test file: src/__tests__/integration/checkout.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CheckoutPage from '@/pages/CheckoutPage'
import * as stripeService from '@/services/stripeService'

vi.mock('@/services/stripeService')

describe('Checkout Integration', () => {
  it('should complete checkout flow', async () => {
    const mockCreateCheckout = vi.spyOn(stripeService, 'createCheckoutSession')
      .mockResolvedValue({ sessionId: 'sess_123', url: 'https://checkout.stripe.com/...' })

    render(<CheckoutPage />)

    // Select a kit
    const kitCard = screen.getByText(/preliminary notice kit/i)
    fireEvent.click(kitCard)

    // Proceed to checkout
    const checkoutButton = screen.getByRole('button', { name: /checkout/i })
    fireEvent.click(checkoutButton)

    await waitFor(() => {
      expect(mockCreateCheckout).toHaveBeenCalled()
    })
  })

  it('should handle Stripe errors', async () => {
    vi.spyOn(stripeService, 'createCheckoutSession')
      .mockRejectedValue(new Error('Stripe error'))

    render(<CheckoutPage />)

    const checkoutButton = screen.getByRole('button', { name: /checkout/i })
    fireEvent.click(checkoutButton)

    await waitFor(() => {
      expect(screen.getByText(/payment error/i)).toBeInTheDocument()
    })
  })
})
```

**C. Assessment to Checkout Flow**

```typescript
// Test file: src/__tests__/integration/assessmentFlow.test.tsx

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AssessmentPage from '@/pages/AssessmentPage'

describe('Assessment to Checkout Flow', () => {
  it('should complete full assessment and reach checkout', async () => {
    render(
      <BrowserRouter>
        <AssessmentPage />
      </BrowserRouter>
    )

    // Answer first question
    const option1 = screen.getByText(/general contractor/i)
    fireEvent.click(option1)

    // Click next
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    // Answer subsequent questions
    // ... (continue through assessment)

    // Should show recommendation
    await waitFor(() => {
      expect(screen.getByText(/recommended for you/i)).toBeInTheDocument()
    })

    // Click to add to cart
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartButton)

    // Should navigate to checkout (or show cart)
    await waitFor(() => {
      expect(screen.getByText(/checkout/i)).toBeInTheDocument()
    })
  })
})
```

### 3. End-to-End Tests (5% of tests)

**Critical User Flows with Playwright**

```typescript
// Test file: e2e/criticalFlows.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  test('complete user journey: signup → assessment → purchase → form', async ({ page }) => {
    // 1. Sign up
    await page.goto('/login')
    await page.click('text=Sign up')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Sign up")')
    
    await expect(page).toHaveURL('/dashboard')

    // 2. Start assessment
    await page.click('text=Start Assessment')
    await expect(page).toHaveURL('/assessment')

    // 3. Complete assessment
    await page.click('text=General Contractor')
    await page.click('button:has-text("Next")')
    
    await page.click('text=Early Stage')
    await page.click('button:has-text("Next")')
    
    await page.fill('input[name="amount"]', '50000')
    await page.click('button:has-text("Get Recommendation")')

    // 4. Purchase kit
    await expect(page.locator('text=Preliminary Notice Kit')).toBeVisible()
    await page.click('button:has-text("Add to Cart")')
    await page.click('button:has-text("Checkout")')

    // 5. Complete checkout (using Stripe test mode)
    await page.fill('[placeholder="Card number"]', '4242424242424242')
    await page.fill('[placeholder="MM / YY"]', '12/25')
    await page.fill('[placeholder="CVC"]', '123')
    await page.click('button:has-text("Pay")')

    // 6. Verify purchase and access form
    await expect(page).toHaveURL(/checkout\/success/)
    await page.click('text=Complete Your Forms')
    
    await expect(page).toHaveURL(/forms/)
    await expect(page.locator('text=Preliminary Notice Form')).toBeVisible()
  })

  test('admin can review submissions', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button:has-text("Sign in")')

    // Navigate to admin
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')

    // View submissions
    await page.click('text=Submissions')
    await expect(page.locator('table')).toBeVisible()

    // Click on a submission
    await page.click('table tr:first-child')
    await expect(page.locator('text=Submission Details')).toBeVisible()

    // Add internal note
    await page.fill('textarea[placeholder*="note"]', 'Reviewed and approved')
    await page.click('button:has-text("Add Note")')
    
    await expect(page.locator('text=Reviewed and approved')).toBeVisible()

    // Change status
    await page.selectOption('select', 'approved')
    await expect(page.locator('text=Status updated')).toBeVisible()
  })
})
```

### Test Setup & Configuration

**1. Install Testing Dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npm install -D @vitest/coverage-v8
```

**2. Vitest Configuration**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ]
    }
  }
})
```

**3. Test Setup File**

```typescript
// src/test/setup.ts
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}
```

**4. Package.json Scripts**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Error Handling & Logging

### 1. Error Handling Strategy

**A. Create Error Boundary Component**

```typescript
// src/components/common/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logError } from '@/lib/errorLogger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack,
      severity: 'high'
    })
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**B. Create Error Logger**

```typescript
// src/lib/errorLogger.ts

import { supabase } from './supabaseClient'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

interface ErrorContext {
  userId?: string
  page?: string
  action?: string
  componentStack?: string
  severity?: ErrorSeverity
  [key: string]: any
}

export async function logError(
  error: Error,
  context: ErrorContext = {}
): Promise<void> {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error logged:', error, context)
  }

  try {
    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()

    // Prepare error data (sanitized)
    const errorData = {
      message: error.message,
      name: error.name,
      stack: sanitizeStackTrace(error.stack),
      severity: context.severity || 'medium',
      user_id: user?.id || context.userId,
      page: context.page || window.location.pathname,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context: sanitizeContext(context)
    }

    // Log to database (optional - only if you have error_logs table)
    await supabase.from('error_logs').insert(errorData)

    // In production, also send to external service (e.g., Sentry)
    if (import.meta.env.PROD && context.severity === 'critical') {
      // Send to Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: context })
    }
  } catch (loggingError) {
    // Don't let logging errors break the app
    console.error('Failed to log error:', loggingError)
  }
}

function sanitizeStackTrace(stack?: string): string {
  if (!stack) return ''
  
  // Remove absolute paths and sensitive info
  return stack
    .split('\n')
    .map(line => line.replace(/file:\/\/\/.*?\//, ''))
    .join('\n')
}

function sanitizeContext(context: ErrorContext): Record<string, any> {
  const sanitized = { ...context }
  
  // Remove sensitive fields
  delete sanitized.password
  delete sanitized.token
  delete sanitized.apiKey
  delete sanitized.ssn
  delete sanitized.creditCard
  
  return sanitized
}

export function logUserAction(action: string, details?: Record<string, any>): void {
  if (import.meta.env.DEV) {
    console.log('User action:', action, details)
  }

  // Log important actions to database
  supabase.from('user_actions').insert({
    action,
    details: sanitizeContext(details || {}),
    timestamp: new Date().toISOString()
  }).catch(err => {
    console.error('Failed to log user action:', err)
  })
}
```

**C. API Error Handler**

```typescript
// src/lib/apiErrorHandler.ts

import { logError } from './errorLogger'
import { toast } from 'sonner' // or your toast library

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function handleAPIError(
  error: unknown,
  context?: string
): Promise<void> {
  let message = 'An unexpected error occurred'
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'

  if (error instanceof APIError) {
    message = error.message
    severity = error.statusCode && error.statusCode >= 500 ? 'high' : 'medium'
  } else if (error instanceof Error) {
    message = error.message
  }

  // Log the error
  await logError(
    error instanceof Error ? error : new Error(String(error)),
    { context, severity }
  )

  // Show user-friendly message
  toast.error(message, {
    description: context,
    duration: 5000
  })
}

export function wrapAPICall<T>(
  promise: Promise<T>,
  context?: string
): Promise<T> {
  return promise.catch(error => {
    handleAPIError(error, context)
    throw error
  })
}
```

**D. Use in Components**

```typescript
// Example usage in a component
import { useState } from 'react'
import { wrapAPICall, handleAPIError } from '@/lib/apiErrorHandler'
import { logUserAction } from '@/lib/errorLogger'
import { lienKitsService } from '@/services/lienKitsService'

export function MyComponent() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    
    try {
      // Log the action
      logUserAction('form_submitted', { formType: 'preliminary_notice' })

      // Make API call with error wrapping
      await wrapAPICall(
        lienKitsService.submitForm(data),
        'Failed to submit form'
      )

      // Success
      toast.success('Form submitted successfully!')
      
    } catch (error) {
      // Error already handled by wrapAPICall
      // Optionally do component-specific error handling
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      {/* Component content */}
    </ErrorBoundary>
  )
}
```

### 2. Wrap App with Error Boundary

```typescript
// src/App.tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Toaster } from 'sonner'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        {/* Routes */}
      </Router>
      <Toaster position="top-right" />
    </ErrorBoundary>
  )
}
```

### 3. Database Table for Error Logs (Optional)

```sql
-- supabase/migrations/error_logging.sql

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  name TEXT,
  stack TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  page TEXT,
  user_agent TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_logs_user ON error_logs(user_id);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);

-- RLS policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert error logs"
ON error_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all error logs"
ON error_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- User actions log (optional)
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_actions_user ON user_actions(user_id);
CREATE INDEX idx_user_actions_created ON user_actions(created_at DESC);
```

---

## Deployment Checklist

### Pre-Deployment Checklist

#### ✅ Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Bundle size acceptable (`npm run build`)
- [ ] All console.logs removed from production code
- [ ] All TODO comments addressed or documented

#### ✅ Security
- [ ] Environment variables properly configured
- [ ] No hardcoded secrets in code
- [ ] Supabase RLS policies tested
- [ ] API routes properly authenticated
- [ ] CORS configured correctly
- [ ] Stripe webhook signatures verified
- [ ] Input validation on all forms
- [ ] XSS protection in place

#### ✅ Performance
- [ ] Images optimized and lazy-loaded
- [ ] Code splitting implemented
- [ ] Large dependencies tree-shaken
- [ ] Database queries optimized with indexes
- [ ] API responses cached where appropriate
- [ ] Fonts optimized (subset, preload)

#### ✅ User Experience
- [ ] Error boundaries in place
- [ ] Loading states for all async operations
- [ ] Empty states designed
- [ ] 404 page exists
- [ ] Mobile responsive design tested
- [ ] Accessibility (WCAG AA) checked
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)

#### ✅ Documentation
- [ ] README.md up to date
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Admin user guide created

### Deployment Steps

#### 1. GitHub Setup

```bash
# Initialize git (if not already done)
git init

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Supabase
.supabase/

# Misc
.cache/
temp/
EOF

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Lien Professor App"

# Create GitHub repository (via GitHub CLI or web)
gh repo create lien-professor-app --private --source=. --remote=origin

# Push to GitHub
git push -u origin main
```

#### 2. Vercel Deployment

**A. Install Vercel CLI**

```bash
npm install -g vercel
```

**B. Login to Vercel**

```bash
vercel login
```

**C. Deploy**

```bash
# First deployment (interactive)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? lien-professor-app
# - Directory? ./
# - Override settings? No

# This creates a preview deployment
```

**D. Configure Environment Variables**

```bash
# Set production environment variables
vercel env add VITE_SUPABASE_URL production
# Paste your production Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your production anon key

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Paste your Stripe publishable key

# Repeat for preview and development environments
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
# ...
```

**E. Deploy to Production**

```bash
vercel --prod
```

**F. Configure Custom Domain (Optional)**

```bash
# Add domain
vercel domains add yourdomain.com

# Configure DNS (A or CNAME records)
# Vercel will provide the records to add
```

#### 3. Alternative: Netlify Deployment

**A. Create `netlify.toml`**

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**B. Deploy via Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

**C. Set Environment Variables**

Via Netlify Dashboard:
1. Go to Site Settings > Build & Deploy > Environment
2. Add variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

#### 4. Supabase Production Configuration

**A. Create Production Project**

1. Go to https://app.supabase.com
2. Create new project
3. Set strong password
4. Choose region close to users
5. Wait for project to provision

**B. Run Migrations**

```bash
# Link to production project
npx supabase link --project-ref your-project-ref

# Push all migrations
npx supabase db push

# Or manually run migrations in Supabase Dashboard
# Copy each migration file to SQL Editor and run
```

**C. Configure RLS Policies**

```bash
# Test RLS policies locally first
npx supabase db test

# Push to production
npx supabase db push
```

**D. Set Up Storage Buckets**

```sql
-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Set up storage policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**E. Configure Email Templates**

1. Go to Authentication > Email Templates
2. Customize:
   - Confirmation email
   - Password reset
   - Magic link (if using)

**F. Set Up Webhooks (if needed)**

1. Go to Database > Webhooks
2. Create webhooks for:
   - New user registration → Welcome email
   - Order completed → Fulfillment trigger
   - Deadline approaching → Reminder email

#### 5. Stripe Production Setup

**A. Activate Stripe Account**

1. Complete business verification
2. Add bank account for payouts
3. Configure tax settings

**B. Create Production Products**

```bash
# Use Stripe CLI or Dashboard to create products
stripe products create \
  --name "Preliminary Notice Kit" \
  --description "Complete preliminary notice filing package" \
  --default-price-data '{
    "currency": "usd",
    "unit_amount": 4900
  }'

# Repeat for all products
```

**C. Configure Webhooks**

```bash
# Add production webhook endpoint
stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe

# Or in Stripe Dashboard:
# Developers > Webhooks > Add endpoint
# URL: https://yourdomain.com/api/webhooks/stripe
# Events: checkout.session.completed, payment_intent.succeeded
```

**D. Test Payment Flow**

1. Use test cards in test mode
2. Verify webhook delivery
3. Check database updates
4. Test refunds and disputes

#### 6. Post-Deployment Verification

**Smoke Tests Checklist**

- [ ] Homepage loads
- [ ] Sign up flow works
- [ ] Login flow works
- [ ] Assessment completes
- [ ] Can add kit to cart
- [ ] Checkout redirects to Stripe
- [ ] After payment, redirects back
- [ ] Forms are accessible
- [ ] Form submission works
- [ ] Admin panel accessible (for admin users)
- [ ] Deadlines calculate correctly
- [ ] Email notifications send
- [ ] Error tracking works

**Performance Checks**

```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com --view

# Check bundle size
npm run build
# Review dist/ folder size

# Test load time
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com
```

**curl-format.txt:**
```
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
```

#### 7. Monitoring Setup

**A. Set Up Error Tracking (Sentry)**

```bash
# Install Sentry
npm install @sentry/react

# Configure Sentry
# src/lib/sentry.ts
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

**B. Set Up Analytics**

```typescript
// src/lib/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties)
  }
  
  // PostHog, Mixpanel, etc.
  // posthog.capture(event, properties)
}
```

**C. Set Up Uptime Monitoring**

- Use UptimeRobot, Better Uptime, or Pingdom
- Monitor:
  - Homepage
  - API health endpoint
  - Stripe webhook endpoint

---

## Git Branching & Release Strategy

### Branch Structure

```
main (production)
  ↑
  ├── staging (pre-production)
  │     ↑
  │     ├── develop (integration)
  │     │     ↑
  │     │     ├── feature/assessment-v2
  │     │     ├── feature/admin-dashboard
  │     │     ├── bugfix/deadline-calc
  │     │     └── hotfix/stripe-webhook
  │     │
  │     └── release/v1.1.0
  │
  └── hotfix/critical-security-fix
```

### Branch Types

**1. Main Branch (`main`)**
- Production code only
- Protected branch
- Requires pull request + approval
- Auto-deploys to production

**2. Staging Branch (`staging`)**
- Pre-production testing
- Mirrors production environment
- Merged from develop
- Auto-deploys to staging environment

**3. Develop Branch (`develop`)**
- Integration branch
- Latest development code
- Base for feature branches
- Auto-deploys to dev environment

**4. Feature Branches (`feature/*`)**
- New features
- Branch from: `develop`
- Merge to: `develop`
- Naming: `feature/short-description`

**5. Bugfix Branches (`bugfix/*`)**
- Non-critical bug fixes
- Branch from: `develop`
- Merge to: `develop`
- Naming: `bugfix/issue-number-description`

**6. Hotfix Branches (`hotfix/*`)**
- Critical production fixes
- Branch from: `main`
- Merge to: `main` AND `develop`
- Naming: `hotfix/critical-issue-description`

**7. Release Branches (`release/*`)**
- Prepare for release
- Branch from: `develop`
- Merge to: `main` AND `develop`
- Naming: `release/v1.0.0`

### Workflow Examples

**A. Adding a New Feature**

```bash
# 1. Update develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/deadline-reminders

# 3. Make changes and commit
git add .
git commit -m "feat: add email reminders for approaching deadlines"

# 4. Push to remote
git push origin feature/deadline-reminders

# 5. Create pull request to develop
# (via GitHub UI)

# 6. After review and approval, merge to develop
# (via GitHub UI with "Squash and merge")

# 7. Delete feature branch
git branch -d feature/deadline-reminders
git push origin --delete feature/deadline-reminders
```

**B. Preparing a Release**

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 2. Update version number
npm version 1.1.0

# 3. Update CHANGELOG.md
cat >> CHANGELOG.md << EOF
## [1.1.0] - 2024-12-01
### Added
- Email reminders for deadlines
- Admin bulk actions
- User profile editing

### Fixed
- Deadline calculation for month-end dates
- Form validation edge cases

### Changed
- Improved dashboard performance
EOF

# 4. Commit changes
git add .
git commit -m "chore: prepare release v1.1.0"

# 5. Push release branch
git push origin release/v1.1.0

# 6. Deploy to staging for testing
# (automatic via CI/CD)

# 7. After testing, merge to main
git checkout main
git pull origin main
git merge --no-ff release/v1.1.0
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main --tags

# 8. Merge back to develop
git checkout develop
git merge --no-ff release/v1.1.0
git push origin develop

# 9. Delete release branch
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

**C. Hotfix for Production**

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/stripe-webhook-signature

# 2. Make the fix
# Edit files...

# 3. Commit
git add .
git commit -m "fix: correct Stripe webhook signature verification"

# 4. Update version (patch)
npm version patch

# 5. Push
git push origin hotfix/stripe-webhook-signature

# 6. Merge to main
git checkout main
git merge --no-ff hotfix/stripe-webhook-signature
git tag -a v1.0.1 -m "Hotfix: Stripe webhook signature"
git push origin main --tags

# 7. Merge to develop
git checkout develop
git merge --no-ff hotfix/stripe-webhook-signature
git push origin develop

# 8. Delete hotfix branch
git branch -d hotfix/stripe-webhook-signature
git push origin --delete hotfix/stripe-webhook-signature
```

### Commit Message Convention

Follow **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**

```bash
git commit -m "feat(assessment): add progress indicator to assessment flow"

git commit -m "fix(deadlines): handle month-end dates correctly in calculation"

git commit -m "docs(readme): update deployment instructions"

git commit -m "refactor(forms): extract form validation logic to separate utility"

git commit -m "test(calculator): add unit tests for deadline calculator"
```

### Pull Request Template

```markdown
<!-- .github/pull_request_template.md -->

## Description
<!-- Describe your changes in detail -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## How Has This Been Tested?
<!-- Describe the tests you ran -->
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)

## Additional Notes
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop, staging]
  pull_request:
    branches: [main, develop, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### Release Process

**1. Pre-Release**
- [ ] All features for release merged to `develop`
- [ ] All tests passing
- [ ] Code review complete
- [ ] Documentation updated

**2. Create Release Branch**
```bash
git checkout -b release/v1.x.x develop
```

**3. Prepare Release**
- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run final tests
- [ ] Build and test production bundle

**4. Deploy to Staging**
```bash
git push origin release/v1.x.x
# Automatic deployment to staging
```

**5. Staging Testing**
- [ ] Smoke tests
- [ ] Full regression testing
- [ ] Performance testing
- [ ] Security scan

**6. Merge to Production**
```bash
git checkout main
git merge --no-ff release/v1.x.x
git tag -a v1.x.x -m "Release version 1.x.x"
git push origin main --tags
```

**7. Merge Back to Develop**
```bash
git checkout develop
git merge --no-ff release/v1.x.x
git push origin develop
```

**8. Post-Release**
- [ ] Monitor error tracking
- [ ] Verify production deployment
- [ ] Monitor performance metrics
- [ ] Create release notes
- [ ] Notify stakeholders

---

## Production Readiness Checklist

### Infrastructure
- [ ] Production database created and configured
- [ ] RLS policies tested and enabled
- [ ] Database backups configured
- [ ] CDN configured for static assets
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] DNS records configured

### Security
- [ ] All secrets in environment variables
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] CSP headers configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Performance
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] Bundle size under 500KB
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (GA, Mixpanel)
- [ ] Uptime monitoring active
- [ ] Performance monitoring (Lighthouse CI)
- [ ] Log aggregation setup

### Legal & Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented
- [ ] GDPR compliance verified
- [ ] Data retention policy defined

### Communication
- [ ] Support email configured
- [ ] Error notification emails setup
- [ ] Transactional email templates configured
- [ ] Status page created

---

## Testing Commands Quick Reference

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run E2E tests with debugging
npm run test:e2e:debug

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

This comprehensive plan provides everything you need to test, harden, and deploy your Lien Professor application. Follow the checklists systematically, and your app will be production-ready! 🚀
