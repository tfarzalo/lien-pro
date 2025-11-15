# Admin/Attorney Tools - Complete Implementation Guide

## Overview

This document provides a complete guide to the admin/attorney tools system implemented for the Lien Professor application. This system allows internal staff (admins and attorneys) to view, manage, and monitor all user submissions, deadlines, and activities across the platform.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [Pages](#pages)
4. [Authentication & Authorization](#authentication--authorization)
5. [Database Schema](#database-schema)
6. [API/Services](#apiservices)
7. [Setup Instructions](#setup-instructions)
8. [Usage Guide](#usage-guide)
9. [Future Enhancements](#future-enhancements)

## Architecture

### High-Level Structure

```
src/
├── hooks/
│   └── useAdminAuth.ts          # Admin authentication & role checking
├── components/
│   └── admin/
│       ├── AdminRoute.tsx       # Protected route guard
│       ├── AdminLayout.tsx      # Main admin layout with nav
│       ├── SubmissionsTable.tsx # Table view of submissions
│       ├── SubmissionFilters.tsx# Advanced filtering component
│       └── InternalNotesPanel.tsx # Notes management
├── pages/
│   └── admin/
│       ├── AdminDashboardPage.tsx      # Overview & stats
│       ├── AdminSubmissionsPage.tsx    # All submissions list
│       ├── SubmissionDetailPage.tsx    # Single submission detail
│       ├── AdminDeadlinesPage.tsx      # Deadline monitor
│       └── AdminUsersPage.tsx          # User management
└── services/
    └── adminQueriesService.ts   # Admin data queries
```

### Key Features

1. **Role-Based Access Control (RBAC)**
   - Admin role: Full access
   - Attorney role: View and review access
   - User role: No admin access

2. **Comprehensive Dashboard**
   - Real-time statistics
   - Recent submissions
   - Urgent deadlines
   - Activity overview

3. **Advanced Filtering & Search**
   - Filter by status, date range, user
   - Full-text search across submissions
   - Saved filter presets (future)

4. **Internal Notes System**
   - Add private notes to submissions
   - Flag important items
   - Track reviewer comments
   - Full audit trail

5. **Activity Logging**
   - Track all admin actions
   - Status changes
   - Note additions
   - User modifications

## Components

### AdminRoute

Protected route component that verifies user role before allowing access.

```tsx
<Route element={<AdminRoute />}>
  <Route path="/admin/*" element={<AdminLayout>...</AdminLayout>} />
</Route>
```

**Props:**
- `allowAttorney` (boolean): Allow attorney role access (default: true)

### AdminLayout

Main layout wrapper for admin pages with navigation and header.

**Features:**
- Top navigation bar with role indicator
- Menu items for all admin sections
- "Exit Admin" link to return to user dashboard
- Responsive design

### SubmissionsTable

Displays a list of submissions with sorting, filtering, and bulk actions.

**Features:**
- Checkbox selection for bulk operations
- Status badges with color coding
- Click row to view details
- Pagination (future)
- Export functionality (future)

### SubmissionFilters

Advanced filtering UI for narrowing down submissions.

**Filters Available:**
- Status (draft, submitted, under_review, approved, rejected)
- Date range (start/end dates)
- Search query (across all fields)
- User ID filter

### InternalNotesPanel

Component for viewing and adding internal staff notes.

**Features:**
- Add new notes with textarea
- List all notes with timestamps
- Show author information
- Refresh to load latest notes

## Pages

### AdminDashboardPage (`/admin`)

**Purpose:** Overview of platform activity and key metrics

**Features:**
- Statistics cards (users, submissions, deadlines)
- Recent submissions list
- Urgent deadlines widget
- Quick action buttons

**Data Displayed:**
- Total users, active users
- Pending/in-review submissions
- Overdue/due-today/due-this-week deadlines
- Forms completed today
- Average review time

### AdminSubmissionsPage (`/admin/submissions`)

**Purpose:** View and filter all user submissions

**Features:**
- Submissions table with sorting
- Advanced filters
- Bulk status updates
- Export to CSV
- Click to view detail

### SubmissionDetailPage (`/admin/submissions/:id`)

**Purpose:** View complete details of a single submission

**Features:**
- User information panel
- Project details
- Form response data (JSON view)
- Uploaded documents list
- Internal notes
- Deadline tracker
- Status change dropdown
- Quick actions (email user, generate report)

### AdminDeadlinesPage (`/admin/deadlines`)

**Purpose:** Monitor all filing deadlines across the platform

**Features:**
- Filter by status (overdue, upcoming, completed)
- Priority indicators (low, medium, high, urgent)
- User and project context
- Send reminder button
- View submission details

### AdminUsersPage (`/admin/users`)

**Purpose:** View and manage all users

**Features:**
- User list with search
- Role indicators
- Project/submission counts
- Last sign-in tracking
- Click to view user detail

## Authentication & Authorization

### User Roles

Stored in `profiles` table with `role` column:

```sql
CREATE TYPE user_role AS ENUM ('user', 'attorney', 'admin');

ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'user';
```

### useAdminAuth Hook

Extends standard authentication with role checking:

```typescript
const { user, role, isAdmin, isAttorney, loading } = useAdminAuth()

if (isAdmin) {
  // Full admin access
}

if (isAttorney) {
  // Attorney access (view, review)
}
```

### Row Level Security (RLS)

Admin tables should have RLS policies that allow access only to admin/attorney roles:

```sql
-- Example policy for internal_notes table
CREATE POLICY "Admin and attorneys can view all notes"
ON internal_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'attorney')
  )
);

CREATE POLICY "Only admins can insert notes"
ON internal_notes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

## Database Schema

### Tables to Create

#### 1. `profiles` (extend existing)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

#### 2. `internal_notes`

```sql
CREATE TABLE internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_kit_id UUID NOT NULL REFERENCES user_kits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  note_type TEXT CHECK (note_type IN ('review', 'follow_up', 'issue', 'resolved')),
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_internal_notes_user_kit ON internal_notes(user_kit_id);
CREATE INDEX idx_internal_notes_flagged ON internal_notes(is_flagged) WHERE is_flagged = true;
```

#### 3. `status_history`

```sql
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_kit_id UUID NOT NULL REFERENCES user_kits(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_user_kit ON status_history(user_kit_id);
```

#### 4. `admin_activity_log`

```sql
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_admin ON admin_activity_log(admin_id);
CREATE INDEX idx_activity_log_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON admin_activity_log(created_at DESC);
```

### Complete Migration Script

See `supabase/migrations/admin_tools_schema.sql` for the complete migration.

## API/Services

### adminQueriesService

Located in `src/services/adminQueriesService.ts`

**Available Functions:**

```typescript
// Dashboard
getAdminDashboardStats(): Promise<{data: AdminDashboardStats, error}>

// Submissions
getAllSubmissions(filters): Promise<{data: Submission[], error}>
getSubmissionDetail(id): Promise<{data: SubmissionDetail, error}>
updateUserKitStatus(id, status, adminId, notes): Promise<{error}>

// Users
getAllUsers(filters): Promise<{data: User[], error}>
getUserDetail(id): Promise<{data: UserDetail, error}>

// Deadlines
getAllDeadlines(filters): Promise<{data: Deadline[], error}>

// Internal Notes
getInternalNotes(userKitId): Promise<{data: InternalNote[], error}>
addInternalNote(userKitId, userId, authorId, noteType, content): Promise<{data, error}>
updateInternalNote(noteId, content, isFlagged): Promise<{data, error}>

// Activity Log
logAdminActivity(activity): Promise<void>
getAdminActivityLog(filters): Promise<{data, error}>

// Search
globalSearch(searchTerm): Promise<{data, error}>
```

## Setup Instructions

### 1. Database Setup

Run the migration to create necessary tables:

```bash
# Using Supabase CLI
supabase migration up
```

Or manually execute the SQL in `supabase/migrations/admin_tools_schema.sql`

### 2. Set User Roles

Update user roles in the database:

```sql
-- Make a user an admin
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- Make a user an attorney
UPDATE profiles SET role = 'attorney' WHERE email = 'attorney@example.com';
```

### 3. Configure RLS Policies

Apply RLS policies for admin tables (see Database Schema section above).

### 4. Update App Routes

Routes are already configured in `src/App.tsx`:

```tsx
<Route element={<AdminRoute />}>
  <Route path="/admin/*" element={
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="submissions" element={<AdminSubmissionsPage />} />
        <Route path="submissions/:submissionId" element={<SubmissionDetailPage />} />
        <Route path="deadlines" element={<AdminDeadlinesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Routes>
    </AdminLayout>
  } />
</Route>
```

### 5. Environment Variables

No additional environment variables needed beyond existing Supabase config.

## Usage Guide

### Accessing Admin Tools

1. Log in as a user with `admin` or `attorney` role
2. Navigate to `/admin` in your browser
3. You'll see the admin dashboard with stats and recent activity

### Viewing Submissions

1. Click "Submissions" in the admin nav
2. Use filters to narrow down results:
   - Select status from dropdown
   - Enter search query
   - Set date range
3. Click on any row to view full details

### Managing a Submission

1. From submission detail page:
   - Change status using dropdown
   - Add internal notes
   - View user/project info
   - Download documents
   - Send email to user

### Monitoring Deadlines

1. Click "Deadlines" in admin nav
2. Filter by status (overdue, upcoming, completed)
3. Review priority levels
4. Send reminders as needed

### Managing Users

1. Click "Users" in admin nav
2. Search for specific users
3. View user details and activity
4. Edit user roles (future feature)

## Future Enhancements

### Phase 1 Enhancements
- [ ] Bulk actions (status update, assign, export)
- [ ] Advanced saved filter views
- [ ] Email notifications for admin events
- [ ] Document preview in submission detail
- [ ] User detail page with full history

### Phase 2 Features
- [ ] Advanced analytics and reporting
- [ ] Custom report builder
- [ ] Automated workflow rules
- [ ] Team assignment and workload balancing
- [ ] Client communication portal
- [ ] Mobile app for attorneys

### Phase 3 Integrations
- [ ] Calendar integration for deadlines
- [ ] Third-party document signing
- [ ] Payment processing integration
- [ ] SMS notifications
- [ ] API for external integrations

## Troubleshooting

### "Not authorized" error
- Verify your user has `admin` or `attorney` role in `profiles` table
- Check RLS policies are correctly applied
- Ensure you're logged in

### Data not loading
- Check browser console for errors
- Verify Supabase connection
- Ensure tables exist in database
- Check RLS policies allow read access

### Submission detail not showing
- Verify submission ID exists
- Check RLS policies on related tables
- Ensure user has permission to view data

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in source files
3. Check `ADMIN_TOOLS_DESIGN.md` for design details
4. Contact development team

## License

Internal use only - Lien Professor App
