# 🚀 Lien Professor Database Migration Checklist

## ✅ Pre-Migration Review Complete

**Status:** All migrations reviewed and validated  
**Critical Issues Found:** 2  
**Critical Issues Fixed:** 2  
**Ready for Deployment:** YES ✅

📄 **See full review:** [MIGRATION_REVIEW.md](./MIGRATION_REVIEW.md)

---

## 📋 Migration Execution Order

Copy and paste the content of each file below **in order** into your Supabase SQL Editor, then click "Run" after each one.

### Prerequisites
- [ ] Supabase project created
- [ ] Database is accessible
- [ ] Backup created (if existing data)
- [ ] You are in the SQL Editor (Dashboard → SQL Editor)

---

## Migration Files (Click to Open)

### 1️⃣ Create Profiles Table
**File:** [20251114000001_create_profiles_table.sql](./20251114000001_create_profiles_table.sql)

**What it does:**
- Creates user profiles extending Supabase Auth
- Sets up role-based access (user, attorney, admin)
- Creates helper functions for role checks
- Enables RLS with user data isolation

**Status:** ✅ Ready  
**Run Time:** ~5 seconds

---

### 2️⃣ Create Lien Kits Table
**File:** [20251114000002_create_lien_kits_table.sql](./20251114000002_create_lien_kits_table.sql)

**What it does:**
- Creates product catalog for lien packages
- Public read access, admin-only write
- Indexes for performance

**Status:** ✅ Ready  
**Run Time:** ~2 seconds  
**Depends on:** Migration 1

---

### 3️⃣ Create Orders Tables
**File:** [20251114000003_create_orders_tables.sql](./20251114000003_create_orders_tables.sql)

**What it does:**
- Creates orders and order_items tables
- E-commerce functionality
- Automatic order number generation

**Status:** ✅ Ready  
**Run Time:** ~3 seconds  
**Depends on:** Migrations 1, 2

---

### 4️⃣ Create User Kits Table
**File:** [20251114000004_create_user_kits_table.sql](./20251114000004_create_user_kits_table.sql)

**What it does:**
- Tracks which kits users own
- Auto-grants access on order completion
- Prevents duplicate ownership

**Status:** ✅ Ready  
**Run Time:** ~3 seconds  
**Depends on:** Migrations 1, 2, 3

---

### 5️⃣ Create Projects Table
**File:** [20251114000005_create_projects_table.sql](./20251114000005_create_projects_table.sql)

**What it does:**
- Central entity for construction projects/cases
- Attorney assignment support
- Complex RLS for user/attorney/admin access

**Status:** ✅ Ready (Fixed)  
**Run Time:** ~4 seconds  
**Depends on:** Migration 1  
**Note:** CHECK constraint removed (fixed)

---

### 6️⃣ Create Assessments Tables
**File:** [20251114000006_create_assessments_tables.sql](./20251114000006_create_assessments_tables.sql)

**What it does:**
- Creates assessment questionnaires
- Tracks user answers
- Determines lien eligibility

**Status:** ✅ Ready  
**Run Time:** ~3 seconds  
**Depends on:** Migrations 1, 5

---

### 7️⃣ Create Forms Tables
**File:** [20251114000007_create_forms_tables.sql](./20251114000007_create_forms_tables.sql)

**What it does:**
- Form templates (public read)
- User-filled form responses
- Attorney access to assigned project forms

**Status:** ✅ Ready  
**Run Time:** ~4 seconds  
**Depends on:** Migrations 1, 5

---

### 8️⃣ Create Deadlines Table
**File:** [20251114000008_create_deadlines_table.sql](./20251114000008_create_deadlines_table.sql)

**What it does:**
- Critical dates and reminders
- Includes function to get upcoming deadlines
- Attorney can create deadlines for assigned projects

**Status:** ✅ Ready  
**Run Time:** ~3 seconds  
**Depends on:** Migrations 1, 5, 7

---

### 9️⃣ Create Uploads Table
**File:** [20251114000009_create_uploads_table.sql](./20251114000009_create_uploads_table.sql)

**What it does:**
- Document and file upload management
- Integrates with Supabase Storage
- Attorney access to project documents

**Status:** ✅ Ready  
**Run Time:** ~3 seconds  
**Depends on:** Migrations 1, 5, 7

---

### 🔟 Create Attorney Tables
**File:** [20251114000010_create_attorney_tables.sql](./20251114000010_create_attorney_tables.sql)

**What it does:**
- Attorney notes (internal and client-visible)
- Case status tracking
- Automatic status change logging

**Status:** ✅ Ready (Fixed)  
**Run Time:** ~4 seconds  
**Depends on:** Migrations 1, 5  
**Note:** CHECK constraint removed (fixed)

---

### 1️⃣1️⃣ Seed Sample Data
**File:** [20251114000011_seed_sample_data.sql](./20251114000011_seed_sample_data.sql)

**What it does:**
- Inserts 6 sample lien kits
- Inserts 3 sample form templates
- Development/testing data

**Status:** ✅ Ready  
**Run Time:** ~2 seconds  
**Depends on:** Migrations 2, 7  
**Note:** Optional - skip for production

---

## 🎯 Post-Migration Checklist

After running all migrations:

### Immediate Tasks

- [ ] **Verify all tables created**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
  ```

- [ ] **Check for errors**
  - Review output for any ERROR messages
  - All should show "Success" or "Completed"

- [ ] **Create Storage Buckets** (Supabase Dashboard → Storage)
  - [ ] `documents` bucket
  - [ ] `generated-forms` bucket
  - [ ] `avatars` bucket (optional)

- [ ] **Set Storage Policies** (see README.md for policy SQL)

### Create First Admin User

- [ ] **Sign up through your app** (creates profile automatically)
- [ ] **Promote to admin:**
  ```sql
  UPDATE profiles 
  SET role = 'admin' 
  WHERE email = 'your-email@example.com';
  ```

### Testing

- [ ] **Test user data isolation** (create test user, verify RLS)
- [ ] **Test attorney access** (assign project, verify attorney can see it)
- [ ] **Test admin access** (verify admin can see all data)
- [ ] **Test sample data** (browse lien kits in your app)

---

## 🆘 Troubleshooting

### If you encounter errors:

**"relation already exists"**
- Table was already created
- Skip this migration or drop the table first

**"type already exists"**
- Enum type was already created
- Skip or drop the type first: `DROP TYPE type_name CASCADE;`

**"function does not exist"**
- Helper function wasn't created in migration 1
- Re-run migration 1

**"column does not exist" in RLS policy**
- Table structure doesn't match
- Verify previous migrations completed successfully

**"permission denied"**
- RLS is blocking access
- Verify you're using the correct role in SQL Editor
- Use "Service role" for admin operations

---

## 📊 Expected Results

After all migrations:

- **13 tables** created
- **11 enum types** created
- **6 helper functions** created
- **40+ indexes** created
- **60+ RLS policies** created
- **8 triggers** created
- **6 sample lien kits** inserted
- **3 sample forms** inserted

**Total Run Time:** ~35 seconds

---

## 🎉 Success Indicators

You'll know everything worked if:

1. ✅ All 11 migrations run without errors
2. ✅ Sample lien kits appear when querying: `SELECT * FROM lien_kits;`
3. ✅ Your first user profile is created automatically on signup
4. ✅ Users can only see their own projects (test with 2 different users)
5. ✅ Admin user can see all data

---

## 📞 Need Help?

- Review the full analysis: [MIGRATION_REVIEW.md](./MIGRATION_REVIEW.md)
- Check the README: [README.md](./README.md)
- Supabase Docs: https://supabase.com/docs
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

**Ready to proceed?** Open the first migration file and start running them in your Supabase SQL Editor! 🚀
