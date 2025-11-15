# 🎯 E-Commerce Quick Reference Card

## 🚀 Test the App NOW

```bash
npm run dev
```

Then go to: `http://localhost:5173/assessment`

## 🧪 Test Card (Pre-filled)

```
Card: 4242 4242 4242 4242
Exp: 12/2030
CVC: 123
ZIP: 78701
```

## 📍 Routes

| Route | Description |
|-------|-------------|
| `/assessment` | Take the interactive assessment |
| `/checkout` | Checkout page (requires kit param) |
| `/checkout?kit=xxx` | Checkout with single kit |
| `/checkout?kits=xxx,yyy` | Checkout with multiple kits |
| `/checkout/success?order=xxx` | Order confirmation |

## 🗂️ Key Files

### Frontend
```
src/pages/CheckoutPage.tsx          - Checkout UI
src/pages/OrderSuccessPage.tsx     - Order confirmation
src/services/stripeService.ts      - Payment logic
src/hooks/useCheckout.ts           - React Query hooks
src/types/stripe.ts                - Type definitions
```

### Backend
```
supabase/functions/create-checkout-session/   - Creates Stripe sessions
supabase/functions/stripe-webhook/            - Handles webhooks
```

### Database
```
supabase/migrations/20251114000006_add_stripe_fields.sql
```

### Docs
```
docs/STRIPE_QUICK_SETUP.md                 - Setup guide
docs/E-COMMERCE_GUIDE.md                   - Full documentation
docs/FLOW_DIAGRAMS.md                      - Visual diagrams
ECOMMERCE_DELIVERY.md                      - Delivery summary
```

## 🔑 Environment Variables

### Current (Test Mode)
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### For Production
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_STRIPE_API_URL=https://your-project.supabase.co/functions/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 📊 Database Queries

### Check Orders
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

### Check Order Items
```sql
SELECT oi.*, lk.name 
FROM order_items oi
JOIN lien_kits lk ON oi.lien_kit_id = lk.id
ORDER BY oi.created_at DESC;
```

### Check Kit Access
```sql
SELECT uk.*, lk.name
FROM user_kits uk
JOIN lien_kits lk ON uk.lien_kit_id = lk.id
ORDER BY uk.created_at DESC;
```

## 🛠️ Common Tasks

### Deploy Edge Functions
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Test Webhook Locally
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

### Trigger Test Event
```bash
stripe trigger checkout.session.completed
```

## ✅ Test Checklist

- [ ] Assessment flow works
- [ ] Kit recommendations appear
- [ ] "Purchase Kit" redirects to checkout
- [ ] Checkout displays correct kit(s)
- [ ] "Complete Purchase" works
- [ ] Success page shows order details
- [ ] Order created in database
- [ ] Order items created
- [ ] Kit access granted (user_kits)

## 🐛 Troubleshooting

### Order not created
1. Check browser console for errors
2. Check React Query DevTools
3. Verify user is authenticated
4. Check database permissions

### Kit not showing on checkout
1. Verify kit ID in URL is valid
2. Check kit is active (`is_active = true`)
3. Check useLienKits hook returns data

### Success page shows error
1. Verify order ID in URL
2. Check order exists in database
3. Verify user owns the order

## 📞 Get Help

1. Check `docs/E-COMMERCE_GUIDE.md` - Complete guide
2. Check `docs/STRIPE_QUICK_SETUP.md` - Setup instructions
3. Check `docs/FLOW_DIAGRAMS.md` - Visual flows
4. Check browser console for errors
5. Check Supabase logs

## 🎯 Status

- ✅ **Test Mode**: Fully functional
- ⏳ **Production**: Ready to enable (30-60 min)

## 🎉 Quick Wins

**Try this now**:
1. Start app: `npm run dev`
2. Go to `/assessment`
3. Complete assessment
4. Click "Purchase Kit"
5. Click "Complete Purchase"
6. See your order confirmation!

**That's it!** The entire flow works! 🚀

---

**For production Stripe**: See `docs/STRIPE_QUICK_SETUP.md`
