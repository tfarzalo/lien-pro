# Quick Start: E-Commerce Setup Guide

## Current State: Test Mode ✅

The app is **fully functional** in test mode. Users can:
1. Complete the assessment
2. Get kit recommendations
3. "Purchase" kits with test payment
4. Access purchased kits from dashboard

**Test it now**:
```bash
npm run dev
```
Navigate to `/assessment` and complete the flow!

---

## Enable Production Stripe (Optional)

Follow these steps when you're ready to accept real payments:

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete verification

### 2. Create Products & Prices

In Stripe Dashboard:

```bash
# Example for "Basic Lien Kit"
1. Go to Products → Add Product
2. Name: "Basic Lien Kit"
3. Description: "Essential forms for Texas construction liens"
4. Price: $99.00 (one-time)
5. Save and copy:
   - Product ID: prod_xxx
   - Price ID: price_xxx
```

### 3. Update Database

```sql
-- Update your lien kits with Stripe IDs
UPDATE lien_kits 
SET 
  stripe_product_id = 'prod_xxx',
  stripe_price_id = 'price_xxx'
WHERE name = 'Basic Lien Kit';

-- Repeat for each kit
```

### 4. Get Stripe Keys

In Stripe Dashboard → Developers → API Keys:

**Test Keys** (for development):
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...`

**Live Keys** (for production):
- Publishable key: `pk_live_...`
- Secret key: `sk_live_...`

### 5. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### 6. Set Supabase Secrets

In Supabase Dashboard → Functions → Secrets, add:

```env
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (get this in step 7)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 7. Configure Webhook

In Stripe Dashboard → Developers → Webhooks:

1. Click "Add endpoint"
2. Endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Description: "Lien Professor Order Webhook"
4. Events to send:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

### 8. Update Frontend Environment

Edit `.env.local`:

```env
# Supabase (already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Add these for Stripe:
VITE_STRIPE_API_URL=https://your-project.supabase.co/functions/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
```

### 9. Switch to Real Stripe Checkout

In `src/pages/CheckoutPage.tsx`, replace the test payment:

```typescript
// BEFORE (Test Mode):
const handleCheckout = async () => {
  const order = await processPayment.mutateAsync(selectedKitIds)
  navigate(`/checkout/success?order=${order.id}`)
}

// AFTER (Production Mode):
const handleCheckout = async () => {
  const session = await createCheckoutSession.mutateAsync({
    kitIds: selectedKitIds,
    successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/checkout`,
    metadata: {
      userId: user!.id,
      orderNumber: `ORD-${Date.now()}`,
    },
  })
  
  // Redirect to Stripe Checkout
  window.location.href = session.url
}
```

### 10. Test with Stripe Test Cards

Use these test cards in your checkout:

**Successful Payment**:
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any valid ZIP
```

**Declined**:
```
Card: 4000 0000 0000 0002
```

**Requires Authentication**:
```
Card: 4000 0025 0000 3155
```

### 11. Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local Edge Function
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

### 12. Go Live

When ready for production:

1. Switch from test keys to live keys
2. Update Stripe webhook to use live mode
3. Test with a real card (small amount)
4. Monitor Stripe Dashboard for successful payments
5. Check Supabase logs for webhook processing

---

## Testing Checklist

Before going live, test:

- [ ] User can complete assessment
- [ ] Kit recommendations appear
- [ ] Checkout page loads with correct kits
- [ ] Stripe Checkout loads
- [ ] Payment succeeds
- [ ] Webhook receives event
- [ ] Order created in database
- [ ] Order items created
- [ ] Kit access granted (user_kits)
- [ ] Success page displays order
- [ ] User can access kit from dashboard
- [ ] Failed payment handled gracefully
- [ ] Canceled checkout handled

---

## Troubleshooting

### Webhook not receiving events

1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check Supabase function logs
4. Test with `stripe listen` locally

### Order not created after payment

1. Check Edge Function logs in Supabase
2. Verify user_id is in session metadata
3. Ensure kit IDs are valid
4. Check database permissions

### Stripe Checkout fails to create

1. Verify `STRIPE_SECRET_KEY` is set
2. Check kits have `stripe_price_id`
3. Ensure kits are active
4. Check Edge Function logs

---

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions

---

## Summary

**Current Status**: ✅ Test mode fully functional

**To Enable Stripe**: Follow steps 1-12 above

**Time to Setup**: ~30-60 minutes

**No Code Changes Required**: All infrastructure is ready!

Just configure Stripe, deploy Edge Functions, and switch the checkout flow. That's it! 🎉
