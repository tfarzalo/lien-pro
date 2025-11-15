# Supabase Edge Functions

This directory contains Supabase Edge Functions for handling Stripe integration.

## Functions

### 1. create-checkout-session

Creates a Stripe Checkout session for purchasing lien kits.

**Endpoint**: `{SUPABASE_URL}/functions/v1/create-checkout-session`

**Method**: POST

**Request Body**:
```json
{
  "kitIds": ["kit-id-1", "kit-id-2"],
  "successUrl": "https://yourapp.com/checkout/success",
  "cancelUrl": "https://yourapp.com/checkout",
  "metadata": {
    "userId": "user-id",
    "orderNumber": "ORD-123456"
  }
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### 2. stripe-webhook

Handles Stripe webhook events, specifically `checkout.session.completed`.

**Endpoint**: `{SUPABASE_URL}/functions/v1/stripe-webhook`

**Method**: POST

**Headers**:
- `stripe-signature`: Stripe webhook signature for verification

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Link to your Supabase project

```bash
supabase link --project-ref your-project-ref
```

### 3. Set up environment variables

Create a `.env` file in the `supabase/functions` directory:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Deploy functions

```bash
# Deploy create-checkout-session
supabase functions deploy create-checkout-session

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

### 5. Set secrets in Supabase Dashboard

Go to your Supabase project dashboard → Functions → Secrets and add:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 6. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `{SUPABASE_URL}/functions/v1/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook signing secret and add it to Supabase secrets

## Development

### Test locally

```bash
# Serve functions locally
supabase functions serve create-checkout-session --env-file ./supabase/functions/.env

# In another terminal
supabase functions serve stripe-webhook --env-file ./supabase/functions/.env
```

### Test webhook locally with Stripe CLI

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Frontend Integration

Update your `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_API_URL=https://your-project.supabase.co/functions/v1
```

The frontend `stripeService.ts` will automatically use this URL to call the Edge Functions.

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all secrets
- Webhook signature verification is critical for security
- Service role key should only be used in backend/edge functions
