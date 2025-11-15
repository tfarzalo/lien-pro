// =====================================================
// Stripe & Payment Types
// =====================================================

export interface StripeCheckoutSession {
    id: string
    url: string
    status: 'open' | 'complete' | 'expired'
}

export interface CreateCheckoutSessionRequest {
    kitIds: string[]
    successUrl: string
    cancelUrl: string
    customerId?: string
    metadata?: Record<string, string>
}

export interface CreateCheckoutSessionResponse {
    sessionId: string
    url: string
}

export interface StripeWebhookEvent {
    type: string
    data: {
        object: any
    }
}

export interface PaymentMetadata {
    userId: string
    orderNumber: string
    kitIds: string[]
    assessmentId?: string
}

// Extended lien kit with Stripe price info
export interface LienKitWithPrice {
    id: string
    name: string
    description: string | null
    price_cents: number
    category: string
    features: string[] | null
    is_popular: boolean
    is_active: boolean
    stripe_price_id: string | null
    stripe_product_id: string | null
    created_at: string
    updated_at: string
}

// Checkout item for cart
export interface CheckoutItem {
    kitId: string
    name: string
    price: number
    quantity: number
    features?: string[]
}

// Order confirmation details
export interface OrderConfirmation {
    orderNumber: string
    orderId: string
    totalAmount: number
    items: OrderConfirmationItem[]
    paymentMethod: string
    purchasedAt: string
    nextSteps: string[]
}

export interface OrderConfirmationItem {
    name: string
    price: number
    quantity: number
}

// Test payment details for development
export interface TestPaymentDetails {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvc: string
    name: string
    email: string
    zipCode: string
}

export const TEST_CARD_NUMBERS = {
    success: '4242424242424242',
    declined: '4000000000000002',
    requiresAuth: '4000002500003155',
    insufficientFunds: '4000000000009995',
} as const

export const DEFAULT_TEST_PAYMENT: TestPaymentDetails = {
    cardNumber: '4242424242424242',
    expiryMonth: '12',
    expiryYear: '2030',
    cvc: '123',
    name: 'Test User',
    email: 'test@example.com',
    zipCode: '78701',
}
