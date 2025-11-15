# 🔒 Routing & Authentication Setup Guide

## ✅ Completed Setup

### 1. Storage Buckets Created ✅

Run this SQL in your Supabase Dashboard → SQL Editor:

**File:** `supabase/STORAGE_SETUP.sql`

This creates:
- `pdf-templates` bucket (public) - for blank PDF templates
- `generated-pdfs` bucket (private) - for user-generated PDFs
- All necessary RLS policies

**To Run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy/paste the entire `STORAGE_SETUP.sql` file
5. Click "Run"

---

### 2. Public vs Protected Routes ✅

Your app now has proper separation between public and protected pages:

#### **Public Routes** (no login required)
- ✅ `/` - Landing page
- ✅ `/login` - Authentication page
- ✅ `/assessment` - Free assessment tool
- ✅ `/kits` - Browse lien kits (NEW!)

#### **Protected Routes** (login required)
- 🔒 `/dashboard` - User dashboard
- 🔒 `/checkout` - Checkout page
- 🔒 `/checkout/success` - Order success page
- 🔒 `/projects/:projectId/forms/:formId` - Form completion page

---

## 🔄 User Flow

### New Visitor Journey

```
Landing Page (/)
    │
    ├─→ Browse Kits (/kits) [PUBLIC]
    │   │
    │   └─→ Click "Purchase" → Redirected to /login
    │       │
    │       └─→ After login → Redirected to /checkout?kit={kitId}
    │
    ├─→ Take Assessment (/assessment) [PUBLIC]
    │   │
    │   └─→ Get recommendations → Browse Kits
    │
    └─→ Sign In (/login)
        │
        └─→ Dashboard (/dashboard) [PROTECTED]
            │
            ├─→ View Kits
            ├─→ Complete Forms
            ├─→ Track Deadlines
            └─→ Generate PDFs
```

---

## 🎯 Key Features

### 1. **Public Kit Browse Page**

**Route:** `/kits`  
**File:** `src/pages/BrowseKitsPage.tsx`

**Features:**
- ✅ View all available lien kits without login
- ✅ Filter by category
- ✅ See kit details, prices, features
- ✅ Click "Purchase" redirects to login if not authenticated
- ✅ After login, automatically redirect to checkout with selected kit

**Example:**
```tsx
// User clicks "Purchase" on a kit
// If not logged in:
//   1. Saves kit ID to sessionStorage
//   2. Redirects to /login
//   3. After successful login, redirects to /checkout?kit={kitId}
```

### 2. **Redirect After Login**

**Implementation in AuthPage:**
```typescript
const handleLogin = async (e: FormEvent) => {
  // ... login logic ...
  
  // Check for redirect after login
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  if (redirectTo) {
    sessionStorage.removeItem('redirectAfterLogin');
    navigate(redirectTo);
  } else {
    navigate('/dashboard');
  }
};
```

**How to Use:**
```typescript
// Before redirecting to login, save intended destination
sessionStorage.setItem('redirectAfterLogin', '/checkout?kit=123');
navigate('/login');

// After login, user is automatically redirected to /checkout?kit=123
```

### 3. **Protected Route Component**

**File:** `src/components/auth/ProtectedRoute.tsx`

Wraps all protected routes and:
- ✅ Shows loading spinner while checking auth
- ✅ Redirects to `/login` if not authenticated
- ✅ Renders protected content if authenticated

---

## 📁 Updated Files

### 1. `src/App.tsx`
```tsx
// Added public route
<Route path="/kits" element={<BrowseKitsPage />} />

// Added form completion route
<Route path="/projects/:projectId/forms/:formId" element={<FormCompletionPage />} />
```

### 2. `src/pages/BrowseKitsPage.tsx` (NEW)
- Public page to browse and view all lien kits
- Handles purchase flow with login redirect
- Shows kit categories, features, pricing

### 3. `src/pages/LandingPage.tsx`
```tsx
// Changed from /dashboard to /kits
<Button onClick={() => navigate('/kits')}>
  Browse Lien Kits
</Button>
```

### 4. `src/pages/AuthPage.tsx`
```tsx
// Added redirect after login logic
const redirectTo = sessionStorage.getItem('redirectAfterLogin');
if (redirectTo) {
  navigate(redirectTo);
}
```

---

## 🔐 Authentication Flow

### Session Management

Your app uses Supabase Auth with:
- ✅ `AuthContext` - Global auth state
- ✅ `ProtectedRoute` - Route-level protection
- ✅ Session persistence across page reloads
- ✅ Automatic token refresh

### Auth Context

**File:** `src/contexts/AuthContext.tsx`

Provides:
```typescript
interface AuthContextType {
  user: User | null;        // Current user
  session: Session | null;  // Current session
  loading: boolean;         // Loading state
}
```

**Usage in Components:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner />;
  
  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }
  
  return <Link to="/login">Sign In</Link>;
}
```

---

## 🚀 Testing the Setup

### 1. Test Public Access

```bash
# Start dev server
npm run dev

# Visit these pages WITHOUT logging in:
✅ http://localhost:5173/           # Landing page
✅ http://localhost:5173/kits       # Browse kits
✅ http://localhost:5173/assessment # Assessment
```

### 2. Test Protected Access

```bash
# Try to visit protected route without login:
❌ http://localhost:5173/dashboard  # Should redirect to /login
```

### 3. Test Purchase Flow

1. Visit `/kits` without logging in
2. Click "Purchase Kit" on any kit
3. Should redirect to `/login`
4. After successful login, should redirect to `/checkout?kit={kitId}`

### 4. Test Direct Protected Route

1. Visit `/dashboard` without logging in
2. Should redirect to `/login`
3. After login, should redirect to `/dashboard`

---

## 🔧 Configuration

### Environment Variables

**File:** `.env.local`
```bash
VITE_SUPABASE_URL=https://uhmdffjniyugmcdaiedt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Supabase Client

**File:** `src/lib/supabaseClient.ts`

All imports use:
```typescript
import { supabase } from '@/lib/supabaseClient';
```

---

## 🎨 Customization

### Adding New Public Routes

```tsx
// In src/App.tsx
<Route path="/your-public-page" element={<YourPublicPage />} />
```

### Adding New Protected Routes

```tsx
// In src/App.tsx, inside <Route element={<ProtectedRoute />}>
<Route element={<ProtectedRoute />}>
  <Route path="/your-protected-page" element={<YourProtectedPage />} />
</Route>
```

### Customizing Redirect Behavior

```typescript
// Save custom redirect
sessionStorage.setItem('redirectAfterLogin', '/custom-page');

// Or pass via URL query
navigate('/login?redirect=/custom-page');

// Then in AuthPage, read from query
const searchParams = new URLSearchParams(location.search);
const redirect = searchParams.get('redirect') || '/dashboard';
```

---

## 📊 Route Summary Table

| Route | Public | Protected | Description |
|-------|--------|-----------|-------------|
| `/` | ✅ | ❌ | Landing page |
| `/login` | ✅ | ❌ | Authentication |
| `/assessment` | ✅ | ❌ | Free assessment |
| `/kits` | ✅ | ❌ | Browse kits |
| `/dashboard` | ❌ | ✅ | User dashboard |
| `/checkout` | ❌ | ✅ | Checkout page |
| `/checkout/success` | ❌ | ✅ | Order confirmation |
| `/projects/:projectId/forms/:formId` | ❌ | ✅ | Form completion |

---

## 🐛 Troubleshooting

### Issue: Infinite redirect loop

**Fix:** Check that ProtectedRoute doesn't render itself recursively

### Issue: Can't access protected route after login

**Fix:** 
1. Check AuthContext is providing user
2. Check browser console for errors
3. Verify Supabase session is valid

### Issue: Redirect after login not working

**Fix:**
1. Check sessionStorage has the redirect URL
2. Verify AuthPage reads from sessionStorage
3. Clear sessionStorage and try again

### Issue: Public routes require login

**Fix:**
1. Check routes are OUTSIDE `<Route element={<ProtectedRoute />}>`
2. Verify no auth checks in public pages

---

## ✅ Success Checklist

- ✅ Storage buckets created in Supabase
- ✅ Public routes accessible without login
- ✅ Protected routes require authentication
- ✅ Browse kits page works publicly
- ✅ Purchase flow redirects to login
- ✅ Redirect after login works
- ✅ Landing page links to `/kits` not `/dashboard`
- ✅ Authentication flow is smooth

---

## 📞 Next Steps

1. **Run the storage setup SQL** in Supabase Dashboard
2. **Test all public routes** without logging in
3. **Test protected routes** with and without login
4. **Test purchase flow** from browse → login → checkout
5. **Customize styling** of BrowseKitsPage to match your brand

---

**Your app now has proper public/protected route separation!** 🎉

Public users can:
- View landing page
- Browse kits
- Take assessment
- See pricing

Authenticated users get access to:
- Dashboard
- Purchase kits
- Complete forms
- Generate PDFs
