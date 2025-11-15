# 🔐 Admin Login Quick Guide

## Dev Server Running

**URL:** http://localhost:5176/

---

## Admin Login Credentials

You'll need to use the admin credentials that were set up in your Supabase database.

### Default Admin Email
Check your Supabase project for the admin user email. It should be in the `profiles` table with `role = 'admin'`.

### If No Admin User Exists

You can create one by running this SQL in your Supabase SQL Editor:

```sql
-- First, create the auth user (if not already created)
-- Sign up through the app at /login

-- Then update their profile to admin
UPDATE profiles
SET role = 'admin', is_attorney = true
WHERE email = 'your-email@example.com';
```

---

## Admin Access Routes

Once logged in as admin, you can access:

1. **Admin Dashboard:** http://localhost:5176/admin
2. **Submissions:** http://localhost:5176/admin/submissions
3. **Deadlines:** http://localhost:5176/admin/deadlines
4. **Users:** http://localhost:5176/admin/users

---

## Testing Steps

1. ✅ **Start dev server** (Already running on port 5176)
2. 🌐 **Open browser:** http://localhost:5176/
3. 🔑 **Login:**
   - Go to http://localhost:5176/login
   - Use admin credentials
4. 📊 **Access admin:**
   - Navigate to http://localhost:5176/admin
   - Verify all admin pages load
5. 📚 **Test Learn Center:**
   - Click "Learn" in header dropdown
   - Navigate to educational pages
   - Test sidebar navigation

---

## Educational Content URLs

- **Learn Hub:** http://localhost:5176/learn
- **What is a Lien:** http://localhost:5176/learn/what-is-a-lien
- **Who Can File:** http://localhost:5176/learn/who-can-file
- **Pre-Lien Notice:** http://localhost:5176/learn/preliminary-notice
- **Residential vs Commercial:** http://localhost:5176/learn/residential-vs-commercial

---

## If Admin Access Denied

### Check Database:
```sql
-- Verify your user has admin role
SELECT id, email, role, is_attorney 
FROM profiles 
WHERE email = 'your-email@example.com';
```

### Update to Admin:
```sql
-- Set user as admin
UPDATE profiles 
SET role = 'admin', is_attorney = true 
WHERE email = 'your-email@example.com';
```

### Check RLS Policies:
Make sure the admin RLS policies are enabled:
```sql
-- Verify admin policies exist
SELECT * FROM pg_policies 
WHERE tablename IN ('profiles', 'projects', 'assessments', 'orders');
```

---

## Quick Troubleshooting

### Issue: Can't login
- Check Supabase Auth settings
- Verify email confirmation not required (or confirm email)
- Check .env.local has correct Supabase URL and anon key

### Issue: Login works but no admin access
- Verify user role is 'admin' in profiles table
- Check AdminRoute component is wrapping admin routes
- Clear browser cache and cookies

### Issue: Educational pages not loading
- Check browser console for errors
- Verify all Learn components imported in App.tsx
- Check routes are configured correctly

---

## Environment Check

Make sure your `.env.local` has:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Success Checklist

- [ ] Dev server running on port 5176
- [ ] Can access landing page
- [ ] Can login with admin credentials
- [ ] Admin dashboard loads (/admin)
- [ ] Can see submissions, deadlines, users pages
- [ ] Learn dropdown menu appears in header
- [ ] Can navigate to educational pages
- [ ] Sidebar navigation works on learn pages
- [ ] No console errors

---

## Deployment Next Steps

Once local testing is complete:

1. **Fix remaining TypeScript errors** for production build
2. **Set up Git remote** (GitHub, GitLab, etc.)
3. **Configure deployment platform** (Vercel, Netlify, etc.)
4. **Deploy to production**

---

**Current Status:** ✅ Dev server running - Ready for testing!
**Port:** http://localhost:5176/
