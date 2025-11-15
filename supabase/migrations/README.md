# Lien Professor Database Migrations

## Overview

This directory contains SQL migrations for the Lien Professor application database schema. The migrations create a complete relational database with Row Level Security (RLS) policies for a construction lien SaaS application.

## Migration Files

The migrations are numbered sequentially and should be run in order:

1. **20251114000001_create_profiles_table.sql**
   - Creates user profiles table extending Supabase Auth
   - Sets up role-based access control (user, attorney, admin)
   - Creates helper functions for role checks
   - Implements RLS policies for user data isolation

2. **20251114000002_create_lien_kits_table.sql**
   - Creates product catalog for lien form packages
   - Public read access, admin-only write access

3. **20251114000003_create_orders_tables.sql**
   - Creates orders and order_items tables
   - Implements e-commerce functionality
   - Users can only access their own orders

4. **20251114000004_create_user_kits_table.sql**
   - Tracks which kits users own/have access to
   - Includes trigger to auto-grant access on order completion

5. **20251114000005_create_projects_table.sql**
   - Central entity for construction projects/cases
   - Supports attorney assignment
   - Complex RLS for user, attorney, and admin access

6. **20251114000006_create_assessments_tables.sql**
   - Creates assessment questionnaires and answers
   - Helps users determine lien eligibility

7. **20251114000007_create_forms_tables.sql**
   - Form templates and user-filled form responses
   - Attorneys can access forms for assigned projects

8. **20251114000008_create_deadlines_table.sql**
   - Critical dates and reminders
   - Includes function to get upcoming deadlines

9. **20251114000009_create_uploads_table.sql**
   - Document and file upload management
   - Integrates with Supabase Storage

10. **20251114000010_create_attorney_tables.sql**
    - Attorney notes and case status tracking
    - Internal vs. client-visible notes
    - Automatic status change logging

11. **20251114000011_seed_sample_data.sql**
    - Sample lien kits and form templates
    - Development/testing data

## Running Migrations

### Method 1: Supabase Dashboard (Recommended for Initial Setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content in order
4. Click **Run** for each migration

### Method 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Initialize Supabase in your project (if not done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Or run individual migrations
supabase db push --file supabase/migrations/20251114000001_create_profiles_table.sql
```

### Method 3: Direct PostgreSQL Connection

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run each migration file
\i supabase/migrations/20251114000001_create_profiles_table.sql
\i supabase/migrations/20251114000002_create_lien_kits_table.sql
# ... continue for all files
```

## Key Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- **Users** can only access their own data (profiles, projects, orders, assessments, etc.)
- **Attorneys** can access projects assigned to them
- **Admins** have full access to all data
- **Public data** (lien kits, form templates) is readable by everyone

### Helper Functions

- `get_user_role(user_id)` - Returns the role of a user
- `is_admin_or_attorney(user_id)` - Checks if user has elevated permissions
- `generate_order_number()` - Creates unique order numbers
- `get_upcoming_deadlines(days_ahead)` - Retrieves upcoming deadlines
- `get_upload_url(upload_id)` - Constructs storage URLs

### Triggers

- `update_updated_at_column()` - Auto-updates timestamps on all tables
- `handle_new_user()` - Creates profile when new user signs up
- `grant_kits_on_order_completion()` - Grants kit access when order completes
- `log_project_status_change()` - Logs status changes automatically

## Schema Relationships

```
profiles (users)
├── projects (1:N)
│   ├── assessments (1:N)
│   │   └── assessment_answers (1:N)
│   ├── form_responses (1:N)
│   ├── deadlines (1:N)
│   ├── uploads (1:N)
│   ├── attorney_notes (1:N)
│   └── case_status_updates (1:N)
├── orders (1:N)
│   └── order_items (1:N)
│       └── lien_kits (N:1)
└── user_kits (N:M with lien_kits)

forms (templates)
└── form_responses (1:N)
```

## Role-Based Access

### User Role
- Full CRUD on own: profiles, projects, assessments, form_responses, deadlines, uploads
- Read own: orders, order_items, user_kits
- Read public: lien_kits, forms

### Attorney Role
- All user permissions
- Read/update: assigned projects and related data
- Create: attorney_notes, case_status_updates

### Admin Role
- Full access to all tables
- Can manage: lien_kits, forms, user roles
- Can assign attorneys to projects

## Testing RLS Policies

After running migrations, test RLS policies:

```sql
-- Set user context (in Supabase SQL Editor, use "User" dropdown)
SELECT auth.uid(); -- Should return current user ID

-- Test user can only see own projects
SELECT * FROM projects; -- Should only return current user's projects

-- Test user can see all active lien kits
SELECT * FROM lien_kits WHERE is_active = true;

-- Test user cannot see other users' assessments
SELECT * FROM assessments; -- Should only return current user's assessments
```

## Common Operations

### Create a new admin user

```sql
-- First, the user must sign up through Supabase Auth
-- Then update their profile:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Assign attorney to project

```sql
UPDATE projects 
SET assigned_attorney_id = 'attorney-uuid-here'
WHERE id = 'project-uuid-here';
```

### Grant kit access to user

```sql
INSERT INTO user_kits (user_id, lien_kit_id, access_type, granted_by)
VALUES (
    'user-uuid-here',
    'kit-uuid-here',
    'granted',
    auth.uid() -- Current admin
);
```

## Rollback

To rollback migrations, you'll need to drop tables in reverse order:

```sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS case_status_updates CASCADE;
DROP TABLE IF EXISTS attorney_notes CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS form_responses CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS assessment_answers CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_kits CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS lien_kits CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS note_priority CASCADE;
DROP TYPE IF EXISTS note_type CASCADE;
DROP TYPE IF EXISTS deadline_status CASCADE;
DROP TYPE IF EXISTS deadline_priority CASCADE;
DROP TYPE IF EXISTS deadline_type CASCADE;
DROP TYPE IF EXISTS upload_category CASCADE;
DROP TYPE IF EXISTS form_response_status CASCADE;
DROP TYPE IF EXISTS form_category CASCADE;
DROP TYPE IF EXISTS assessment_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS project_type CASCADE;
DROP TYPE IF EXISTS kit_access_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS kit_category CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS log_project_status_change CASCADE;
DROP FUNCTION IF EXISTS get_upload_url CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_deadlines CASCADE;
DROP FUNCTION IF EXISTS grant_kits_on_order_completion CASCADE;
DROP FUNCTION IF EXISTS generate_order_number CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS is_admin_or_attorney CASCADE;
DROP FUNCTION IF EXISTS get_user_role CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

## Storage Buckets

Create these storage buckets in Supabase Storage:

1. **documents** - User uploads (contracts, photos, invoices)
2. **generated-forms** - PDF outputs from form_responses
3. **avatars** (optional) - User profile images

### Storage Policies

```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Next Steps

After running migrations:

1. ✅ Create storage buckets
2. ✅ Set up storage policies
3. ✅ Test authentication flow
4. ✅ Test RLS policies with different user roles
5. ✅ Create admin user for management
6. ✅ Configure email templates in Supabase Auth
7. ✅ Set up Stripe/payment integration (if needed)
8. ✅ Configure SMTP for email notifications

## Support

For questions or issues:
- Review Supabase documentation: https://supabase.com/docs
- Check RLS policies: https://supabase.com/docs/guides/auth/row-level-security
- Test queries in SQL Editor with different user contexts

---

**Schema Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**Compatible With:** Supabase PostgreSQL 15+
