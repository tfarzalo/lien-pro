# E-Commerce & Stripe Integration Guide

## Overview

This guide explains the complete e-commerce and checkout flow implemented in the Lien Professor App, including Stripe integration, order management, and kit access control.

## Architecture

```
┌─────────────────┐
│   Assessment    │
│      Flow       │
└────────┬────────┘
         │ Recommends Kits
         ▼
┌─────────────────┐
│  Checkout Page  │ ← User selects kits
└────────┬────────┘
         │
         ├─► Test Mode (Development)
         │   - Simulated payment
         │   - Creates order immediately
         │   - Grants kit access
         │
         └─► Production Mode
             - Creates Stripe Checkout Session
             - Redirects to Stripe Checkout
             - Webhook handles post-payment
             - Creates order + grants access
```

## Data Model

### Database Tables

#### lien_kits (Extended)
```sql
CREATE TABLE lien_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  category TEXT NOT NULL,
  features JSONB,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stripe_product_id TEXT,  -- Stripe Product ID
  stripe_price_id TEXT,    -- Stripe Price ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### orders (Extended)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  stripe_session_id TEXT,        -- Stripe Checkout Session ID
  stripe_payment_intent_id TEXT, -- Stripe Payment Intent ID
  paid_at TIMESTAMPTZ,
  payment_metadata JSONB,        -- Additional payment info
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  lien_kit_id UUID NOT NULL REFERENCES lien_kits(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,
  kit_name TEXT NOT NULL,        -- Snapshot of kit name
  kit_features JSONB,            -- Snapshot of kit features
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_kits
```sql
CREATE TABLE user_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  lien_kit_id UUID NOT NULL REFERENCES lien_kits(id),
  access_type TEXT NOT NULL,     -- 'purchased', 'trial', 'gifted'
  purchase_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lien_kit_id)
);
```

## Frontend Implementation

### Type Definitions

**src/types/stripe.ts**
```typescript
export interface CheckoutItem {
  kitId: string
  name: string
  price: number
  quantity: number
  features?: string[]
}

export interface TestPaymentDetails {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvc: string
  name: string
  email: string
  zipCode: string
}

export interface CreateCheckoutSessionRequest {
  kitIds: string[]
  successUrl: string
  cancelUrl: string
  customerId?: string
  metadata?: Record<string, string>
}
```

### Services

**src/services/stripeService.ts**

Key functions:
- `createCheckoutSession()` - Creates Stripe Checkout session (production)
- `processTestPayment()` - Simulates payment for development
- `createOrderFromCheckout()` - Creates order after successful payment
- `getOrderDetails()` - Retrieves order with items and kit details

### React Query Hooks

**src/hooks/useCheckout.ts**

- `useCreateCheckoutSession()` - Hook for creating checkout session
- `useProcessTestPayment()` - Hook for test payment processing
- `useOrderDetails()` - Hook for fetching order details

### Pages

#### CheckoutPage
**Path**: `/checkout?kit=<kit-id>` or `/checkout?kits=<kit-id-1>,<kit-id-2>`

Features:
- Displays selected kits with features
- Shows order summary with pricing
- Test mode with pre-filled card details
- Real-time validation
- Error handling

#### OrderSuccessPage
**Path**: `/checkout/success?order=<order-id>`

Features:
- Order confirmation
- Order details display
- Purchased items list
- Next steps guide
- Links to dashboard

## Backend Implementation

### Supabase Edge Functions

#### create-checkout-session

**Path**: `supabase/functions/create-checkout-session/index.ts`

Creates a Stripe Checkout session.

**Request**:
```json
{
  "kitIds": ["uuid1", "uuid2"],
  "successUrl": "https://app.com/checkout/success",
  "cancelUrl": "https://app.com/checkout",
  "metadata": {
    "userId": "user-uuid",
    "orderNumber": "ORD-123456"
  }
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### stripe-webhook

**Path**: `supabase/functions/stripe-webhook/index.ts`

Handles Stripe webhook events.

**Events Handled**:
- `checkout.session.completed` - Creates order and grants kit access
- `payment_intent.payment_failed` - Handles failed payments

**Webhook Flow**:
1. Verify webhook signature
2. Extract session metadata (userId, kitIds, orderNumber)
3. Fetch kit details from database
4. Create order record
5. Create order_items records
6. Grant kit access (user_kits records)
7. Send confirmation email (optional)

## User Flows

### Test Mode Flow (Current Implementation)

1. User completes assessment → receives kit recommendations
2. User clicks "Purchase Kit" → redirects to `/checkout?kit=<kit-id>`
3. CheckoutPage loads with test card pre-filled
4. User clicks "Complete Purchase"
5. `processTestPayment()` is called:
   - Creates order with status 'completed'
   - Creates order_items
   - Grants kit access via user_kits
6. Redirects to `/checkout/success?order=<order-id>`
7. OrderSuccessPage displays confirmation
8. User can access kit from dashboard

### Production Flow (To Be Enabled)

1. User completes assessment → receives kit recommendations
2. User clicks "Purchase Kit" → redirects to `/checkout?kit=<kit-id>`
3. CheckoutPage calls `createCheckoutSession()`:
   - Frontend calls Edge Function
   - Edge Function creates Stripe Checkout Session
   - Returns session URL
4. User redirected to Stripe Checkout
5. User completes payment on Stripe
6. Stripe redirects to success URL
7. Stripe sends webhook to `stripe-webhook` function:
   - Webhook creates order
   - Grants kit access
8. User sees success page with order details

## Environment Variables

### Frontend (.env.local)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_API_URL=https://your-project.supabase.co/functions/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (for production)
```

### Edge Functions (Supabase Secrets)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing

### Test Mode

Use the pre-filled test card:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/2030
CVC: 123
ZIP: 78701
```

### Stripe Test Cards

For production testing with real Stripe integration:

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155
- **Insufficient Funds**: 4000 0000 0000 9995

### Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local Edge Function
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Migration from Test to Production

### Step 1: Set Up Stripe Products

1. Create products in Stripe Dashboard
2. Create prices for each product
3. Update `lien_kits` table with Stripe IDs:

```sql
UPDATE lien_kits 
SET stripe_product_id = 'prod_...', 
    stripe_price_id = 'price_...'
WHERE id = 'kit-uuid';
```

### Step 2: Deploy Edge Functions

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Step 3: Configure Stripe Webhook

1. Add webhook endpoint in Stripe Dashboard
2. URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook secret to Supabase secrets

### Step 4: Update Frontend

In `CheckoutPage.tsx`, replace test payment with real checkout:

```typescript
const handleCheckout = async () => {
  // Replace test payment
  const session = await createCheckoutSession.mutateAsync({
    kitIds: selectedKitIds,
    successUrl: `${window.location.origin}/checkout/success`,
    cancelUrl: `${window.location.origin}/checkout`,
    metadata: {
      userId: user!.id,
      orderNumber: generateOrderNumber(),
    },
  })
  
  // Redirect to Stripe Checkout
  window.location.href = session.url
}
```

## Security Considerations

- ✅ Webhook signature verification in Edge Function
- ✅ Service role key only used in backend
- ✅ CORS headers properly configured
- ✅ User authentication required for checkout
- ✅ Order ownership verified on success page
- ✅ Stripe Checkout handles PCI compliance
- ✅ No card details stored in database

## Next Steps

1. **Email Notifications**: Add order confirmation emails
2. **Invoice Generation**: Create PDF invoices
3. **Refund Handling**: Implement refund webhook handling
4. **Subscription Support**: Add recurring billing option
5. **Promo Codes**: Implement discount codes
6. **Analytics**: Track conversion funnel
7. **Multi-currency**: Support international payments

## Troubleshooting

### Order not created after payment

- Check webhook is configured correctly
- Verify webhook secret is correct
- Check Edge Function logs in Supabase
- Ensure user_id is passed in metadata

### Stripe Checkout session creation fails

- Verify Stripe secret key is set
- Check kit has valid stripe_price_id
- Ensure kit is active in database

### User doesn't have kit access after purchase

- Check user_kits table for record
- Verify webhook completed successfully
- Check order status is 'completed'

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review Stripe Dashboard for payment details
- Contact support@lienprofessor.com
