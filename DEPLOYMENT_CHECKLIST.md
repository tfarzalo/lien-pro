# 🚀 DEPLOYMENT CHECKLIST
## Lien Professor App - Ready to Ship

---

## PRE-DEPLOYMENT ✅

### Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Bundle size acceptable (check `dist/` folder < 500KB gzipped)

### Security Review
- [ ] No API keys or secrets in code
- [ ] `.env.local` in `.gitignore`
- [ ] All environment variables documented
- [ ] Supabase RLS policies tested
- [ ] Input validation on all forms
- [ ] CORS configured properly

### Testing
- [ ] Critical user flows tested manually
- [ ] Checkout flow works end-to-end
- [ ] Form submission works
- [ ] Admin panel accessible
- [ ] Error boundary catches errors
- [ ] Toast notifications show properly

---

## GITHUB SETUP 📦

### Repository
```bash
# 1. Initialize git (if not done)
git init

# 2. Create .gitignore (check it exists)
cat .gitignore  # Should include node_modules, .env, etc.

# 3. Initial commit
git add .
git commit -m "chore: initial commit - ready for deployment"

# 4. Create GitHub repo
# Via GitHub CLI:
gh repo create lien-professor-app --private --source=. --remote=origin

# Or create manually on GitHub.com and:
git remote add origin https://github.com/YOUR_USERNAME/lien-professor-app.git

# 5. Push
git push -u origin main
```

### Branch Protection (Optional)
- [ ] Require PR reviews before merging to main
- [ ] Require status checks to pass
- [ ] Require branches to be up to date

---

## SUPABASE PRODUCTION 🗄️

### 1. Create Production Project
```
1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: "Lien Professor Production"
4. Set STRONG database password (save it!)
5. Choose region close to your users (e.g., US East)
6. Wait for provisioning (2-3 minutes)
```

### 2. Run Migrations
```bash
# Link to production project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
npx supabase db push

# Or copy/paste each migration in SQL Editor manually
```

### 3. Verify Database
- [ ] All tables created
- [ ] RLS policies enabled
- [ ] Test a query in SQL Editor
- [ ] Check storage buckets created

### 4. Configure Auth
```
Settings > Authentication > URL Configuration
Site URL: https://your-domain.com
Redirect URLs: https://your-domain.com/**
```

### 5. Email Templates
```
Authentication > Email Templates
- Customize confirmation email
- Customize password reset
- Customize magic link (if using)
```

### 6. Get Production Keys
```
Settings > API
- Copy anon key (public)
- Copy service_role key (secret - don't commit!)
- Copy Project URL
```

---

## STRIPE PRODUCTION 💳

### 1. Activate Account
```
1. Complete business verification
2. Add bank account for payouts
3. Configure tax settings
4. Set up billing address
```

### 2. Create Products
```
Products > Create product

For each kit:
- Name: "Preliminary Notice Kit"
- Description: "Complete preliminary notice filing package"
- Price: $49.00 (or your price)
- Recurring: No
- Tax code: (select appropriate)

Get Product IDs for each
```

### 3. Webhook Configuration
```
Developers > Webhooks > Add endpoint

Endpoint URL: https://your-domain.com/api/webhooks/stripe
Events to send:
✓ checkout.session.completed
✓ payment_intent.succeeded
✓ payment_intent.payment_failed
✓ customer.subscription.updated (if using subscriptions)

Get Signing Secret (starts with whsec_...)
```

### 4. Get API Keys
```
Developers > API keys
- Publishable key (pk_live_...)
- Secret key (sk_live_...)

Store these securely - DO NOT commit to git!
```

---

## VERCEL DEPLOYMENT ☁️

### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. First Deployment
```bash
cd "/Users/timothyfarzalo/Desktop/Lien Professor App"
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? lien-professor-app
# - Directory? ./
# - Override settings? No
```

### 3. Add Environment Variables
```bash
# Production variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://xxxxx.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production  
# Paste: eyJhbGc...

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Paste: pk_live_...

# Add same for preview and development
vercel env add VITE_SUPABASE_URL preview
# ... repeat for all variables
```

### 4. Deploy to Production
```bash
vercel --prod
```

### 5. Custom Domain (Optional)
```bash
vercel domains add yourdomain.com
# Follow DNS instructions
# Add A record or CNAME to your domain registrar
```

---

## ALTERNATIVE: NETLIFY DEPLOYMENT ☁️

### 1. Create `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Deploy via Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 3. Add Environment Variables
```
Go to Site Settings > Build & Deploy > Environment
Add variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_STRIPE_PUBLISHABLE_KEY
```

---

## POST-DEPLOYMENT VERIFICATION ✅

### Smoke Tests (Must Pass!)
- [ ] Homepage loads
- [ ] Can sign up
- [ ] Can log in
- [ ] Assessment completes
- [ ] Can add kit to cart
- [ ] Checkout redirects to Stripe
- [ ] After payment, redirects back successfully
- [ ] Forms are accessible
- [ ] Form submission works
- [ ] Admin panel works (for admin users)
- [ ] Email notifications send

### Performance Checks
```bash
# Run Lighthouse
npx lighthouse https://your-domain.com --view

# Check critical metrics:
# - First Contentful Paint < 2s
# - Time to Interactive < 4s
# - Performance score > 90
```

### Security Checks
- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] No secrets exposed in frontend
- [ ] RLS policies working (can't access others' data)
- [ ] API endpoints require authentication
- [ ] Stripe webhook signature verified

---

## MONITORING SETUP 📊

### 1. Error Tracking (Optional - Sentry)
```bash
npm install @sentry/react

# Add to src/main.tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})
```

### 2. Analytics (Optional - Google Analytics)
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. Uptime Monitoring
```
Sign up for:
- UptimeRobot (free)
- Better Uptime (paid)
- Pingdom (paid)

Monitor:
- Homepage
- /api/health endpoint (create one)
- Stripe webhook endpoint
```

---

## CI/CD SETUP (OPTIONAL) 🤖

### GitHub Actions
Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## ROLLBACK PLAN 🔄

### If something goes wrong:

```bash
# Vercel - Revert to previous deployment
vercel --prod --yes rollback

# Netlify - Revert via dashboard
# Site > Deploys > [Previous Deploy] > Publish

# Database - Restore from backup
# Supabase > Settings > Backups > Restore

# DNS - Keep old domain active until new one works
```

---

## LAUNCH DAY CHECKLIST 🎉

### 24 Hours Before
- [ ] Final testing on staging
- [ ] Database backup created
- [ ] Monitoring configured
- [ ] Support email ready
- [ ] Documentation updated

### Launch Day
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor error tracking
- [ ] Watch for user feedback
- [ ] Be ready to rollback if needed

### 24 Hours After
- [ ] Check error logs
- [ ] Review analytics
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Plan first updates

---

## ENVIRONMENT VARIABLES REFERENCE 📋

### Required (Frontend)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Optional (Backend - if you have Netlify Functions/Vercel Functions)
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## SUPPORT & MAINTENANCE 🛠️

### Weekly Tasks
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Monitor performance metrics
- [ ] Update dependencies (`npm outdated`)

### Monthly Tasks
- [ ] Review security advisories
- [ ] Backup database
- [ ] Test disaster recovery
- [ ] Review costs (Supabase, Vercel, Stripe)

### Quarterly Tasks
- [ ] Major dependency updates
- [ ] Performance optimization
- [ ] Security audit
- [ ] User survey

---

## EMERGENCY CONTACTS 📞

```
Vercel Support: https://vercel.com/support
Netlify Support: https://netlify.com/support
Supabase Support: https://supabase.com/support
Stripe Support: https://support.stripe.com

Your hosting dashboard:
Vercel: https://vercel.com/dashboard
Netlify: https://app.netlify.com
Supabase: https://app.supabase.com
```

---

## ✅ FINAL VERIFICATION

Before you call it "SHIPPED":

- [ ] All tests passing
- [ ] Deployed to production
- [ ] Custom domain working (if applicable)
- [ ] Checkout flow tested with real payment
- [ ] Received test submission successfully
- [ ] Admin panel accessible
- [ ] Error tracking working
- [ ] Monitoring active
- [ ] Team notified
- [ ] Documentation complete

---

## 🎉 CONGRATULATIONS!

Your app is **LIVE** and **PRODUCTION-READY**!

**What you built:**
- ✅ Full-stack React + Supabase app
- ✅ E-commerce with Stripe
- ✅ Admin panel
- ✅ Form system
- ✅ Deadline calculator
- ✅ Error handling
- ✅ Testing infrastructure
- ✅ Deployed and monitored

**You shipped it! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Ready for production deployment
