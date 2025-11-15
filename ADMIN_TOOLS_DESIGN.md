# Attorney/Admin Tools - Phase 2 Design Document

## 🎯 Overview

This document outlines the admin/attorney interface for managing user submissions, tracking deadlines, and providing internal workflow support.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Overview Stats │  │ Recent Activity│  │ Urgent Items │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ Submissions  │    │ Deadlines        │    │ Users        │
│ Management   │    │ Monitoring       │    │ Management   │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ Form Review  │    │ Critical Items   │    │ User Detail  │
│ - View docs  │    │ - Overdue        │    │ - History    │
│ - Add notes  │    │ - Due soon       │    │ - Activity   │
│ - Update     │    │ - Filter/sort    │    │ - Support    │
└──────────────┘    └──────────────────┘    └──────────────┘
```

---

## 🔐 Security Model (RLS)

### Roles
```sql
-- User roles stored in auth.users metadata
{
  "role": "user" | "attorney" | "admin"
}
```

### Row Level Security Policies

#### Users Table
```sql
-- Users can see only their own data
CREATE POLICY "Users see own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admins/attorneys can see all users
CREATE POLICY "Admins see all users"
ON users FOR SELECT
USING (
  auth.jwt()->>'role' IN ('admin', 'attorney')
);
```

#### Submissions Table
```sql
-- Users can see only their submissions
CREATE POLICY "Users see own submissions"
ON submissions FOR SELECT
USING (auth.uid() = user_id);

-- Admins/attorneys can see all submissions
CREATE POLICY "Admins see all submissions"
ON submissions FOR SELECT
USING (
  auth.jwt()->>'role' IN ('admin', 'attorney')
);

-- Only admins/attorneys can update submission status
CREATE POLICY "Admins update submissions"
ON submissions FOR UPDATE
USING (
  auth.jwt()->>'role' IN ('admin', 'attorney')
);
```

#### Internal Notes Table
```sql
-- Only admins/attorneys can see and create internal notes
CREATE POLICY "Admins manage notes"
ON internal_notes FOR ALL
USING (
  auth.jwt()->>'role' IN ('admin', 'attorney')
);
```

---

## 📊 Database Schema Extensions

### Internal Notes Table
```sql
CREATE TABLE internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),  -- Subject user
  author_id UUID REFERENCES auth.users(id),  -- Attorney who wrote note
  note_type VARCHAR(50) NOT NULL,  -- 'review', 'follow_up', 'issue', 'resolved'
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_internal_notes_submission ON internal_notes(submission_id);
CREATE INDEX idx_internal_notes_user ON internal_notes(user_id);
CREATE INDEX idx_internal_notes_flagged ON internal_notes(is_flagged);
```

### Submission Status Updates Table
```sql
CREATE TABLE submission_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_status_history_submission ON submission_status_history(submission_id);
```

### Admin Activity Log
```sql
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL,  -- 'view', 'update', 'note', 'download'
  entity_type VARCHAR(50) NOT NULL,  -- 'submission', 'user', 'deadline'
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_created ON admin_activity_log(created_at);
```

### Extended Submissions Table
```sql
-- Add admin-specific columns to existing submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS
  admin_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'in_review', 'approved', 'rejected', 'needs_revision'
  assigned_to UUID REFERENCES auth.users(id),  -- Attorney assigned
  priority VARCHAR(20) DEFAULT 'normal',  -- 'low', 'normal', 'high', 'urgent'
  internal_flags JSONB DEFAULT '[]'::jsonb,  -- ['incomplete', 'urgent', 'follow_up']
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id);

CREATE INDEX idx_submissions_admin_status ON submissions(admin_status);
CREATE INDEX idx_submissions_assigned_to ON submissions(assigned_to);
CREATE INDEX idx_submissions_priority ON submissions(priority);
```

---

## 🎨 UI Structure

### Main Admin Routes
```
/admin/
├── dashboard              # Overview and stats
├── submissions            # All user submissions
│   ├── [id]              # Individual submission detail
│   └── [id]/review       # Review mode with notes
├── deadlines             # Deadline monitoring
│   ├── overdue           # Overdue items
│   ├── critical          # Critical upcoming
│   └── [id]              # Deadline detail
├── users                 # User management
│   ├── [id]              # User profile and history
│   └── [id]/submissions  # User's submissions
├── kits                  # Kit management
│   └── analytics         # Kit usage stats
├── reports               # Analytics and reports
└── settings              # Admin settings
```

---

## 📱 Component Breakdown

### 1. Admin Dashboard (`/admin/dashboard`)

**Purpose**: High-level overview of system status

**Components**:
- `AdminDashboard.tsx` - Main layout
- `AdminStatsCards.tsx` - Key metrics
- `RecentActivityFeed.tsx` - Recent user actions
- `UrgentItemsList.tsx` - Items needing attention
- `AssignedToMeWidget.tsx` - Personal queue

**Metrics Displayed**:
- Total active users
- Submissions pending review
- Overdue deadlines (by severity)
- Forms completed today
- Average response time
- User satisfaction (if tracked)

---

### 2. Submissions Management (`/admin/submissions`)

**Purpose**: View and manage all user form submissions

**Components**:
- `SubmissionsTable.tsx` - Filterable, sortable table
- `SubmissionFilters.tsx` - Advanced filtering
- `SubmissionRow.tsx` - Individual row with quick actions
- `BulkActions.tsx` - Select and act on multiple

**Filters**:
- Status (pending, in review, approved, rejected, needs revision)
- Priority (low, normal, high, urgent)
- Kit type
- Assigned attorney
- Date range
- User
- Completion status
- Has issues/flags

**Sortable Columns**:
- Submission date
- User name
- Kit type
- Status
- Priority
- Assigned to
- Last updated

**Quick Actions**:
- Assign to me
- Change priority
- Add to queue
- Mark for follow-up

---

### 3. Submission Detail (`/admin/submissions/[id]`)

**Purpose**: Deep dive into a single submission

**Components**:
- `SubmissionDetail.tsx` - Main layout
- `SubmissionHeader.tsx` - User info, status, actions
- `FormResponsesViewer.tsx` - Display all form answers
- `DocumentViewer.tsx` - View uploaded documents
- `InternalNotesPanel.tsx` - Add/view internal notes
- `DeadlinesSidebar.tsx` - Related deadlines
- `StatusHistoryTimeline.tsx` - Status change history
- `RelatedSubmissions.tsx` - Other user submissions

**Sections**:
1. **Header**
   - User info with link to profile
   - Submission date
   - Kit type
   - Current status with change button
   - Priority indicator
   - Assign/reassign button

2. **Form Responses**
   - All questions and answers
   - Validation indicators
   - Incomplete fields highlighted
   - Edit capability (admin only)

3. **Documents**
   - List of uploaded files
   - Preview/download
   - Document type labels
   - Upload additional docs (on behalf of user)

4. **Internal Notes**
   - Add new note
   - View history
   - Filter by note type
   - Flag important notes
   - @mention other attorneys

5. **Activity Timeline**
   - Status changes
   - Document uploads
   - Note additions
   - Deadline updates
   - User interactions

6. **Related Deadlines**
   - Deadlines from this submission
   - Urgency indicators
   - Quick status update

---

### 4. Deadline Monitoring (`/admin/deadlines`)

**Purpose**: Monitor all user deadlines across the system

**Components**:
- `DeadlineMonitorDashboard.tsx` - Overview
- `DeadlineTable.tsx` - All deadlines
- `DeadlineFilters.tsx` - Filter controls
- `CriticalDeadlinesWidget.tsx` - Urgent items
- `DeadlineCalendarView.tsx` - Calendar visualization

**Views**:
1. **Overview Tab**
   - Stats cards (overdue, due today, due this week)
   - Critical items list
   - Trends chart

2. **All Deadlines Tab**
   - Comprehensive table
   - Multi-level filtering
   - Export capability

3. **Calendar View**
   - Month/week view
   - Color-coded by severity
   - Click to view details

**Filters**:
- Date range
- Severity (critical, high, medium, low)
- Status (pending, overdue, completed)
- User
- Deadline type
- Kit type
- Assigned attorney

**Bulk Actions**:
- Send reminder emails
- Update status
- Change assignment
- Generate report

---

### 5. User Management (`/admin/users`)

**Purpose**: View and manage user accounts

**Components**:
- `UsersTable.tsx` - User list
- `UserFilters.tsx` - Search and filter
- `UserDetail.tsx` - Individual user view
- `UserActivityTimeline.tsx` - User history
- `UserSubmissionsList.tsx` - User's submissions

**User Detail Sections**:
1. **Profile Information**
   - Contact details
   - Account created date
   - Last login
   - Subscription status
   - Edit capability

2. **Activity Summary**
   - Total submissions
   - Active projects
   - Deadlines (total, overdue, completed)
   - Last activity

3. **Submissions History**
   - All user submissions
   - Status of each
   - Quick navigation

4. **Support Notes**
   - Internal notes about user
   - Support tickets
   - Communication history

5. **Quick Actions**
   - Send email
   - Reset password
   - Suspend/activate account
   - View as user (impersonate)

---

## 🔧 Key Service Functions

### Admin Queries Service
```typescript
// src/services/adminQueriesService.ts

/**
 * Get all submissions with filters
 */
export async function getAllSubmissions(filters: SubmissionFilters) {
  const query = supabase
    .from('submissions')
    .select(`
      *,
      user:users!user_id (
        id,
        email,
        full_name,
        created_at
      ),
      kit:lien_kits!kit_id (
        id,
        name,
        category
      ),
      deadlines:deadlines(count)
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status) query.eq('admin_status', filters.status);
  if (filters.priority) query.eq('priority', filters.priority);
  if (filters.assignedTo) query.eq('assigned_to', filters.assignedTo);
  if (filters.kitType) query.eq('kit_id', filters.kitType);
  if (filters.userId) query.eq('user_id', filters.userId);
  if (filters.dateFrom) query.gte('created_at', filters.dateFrom);
  if (filters.dateTo) query.lte('created_at', filters.dateTo);

  return query;
}

/**
 * Get submission detail with all related data
 */
export async function getSubmissionDetail(submissionId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      user:users!user_id (*),
      kit:lien_kits!kit_id (*),
      deadlines (*),
      documents (*),
      internal_notes (
        *,
        author:auth.users!author_id (
          email,
          raw_user_meta_data->full_name
        )
      ),
      status_history:submission_status_history (
        *,
        changed_by_user:auth.users!changed_by (
          email,
          raw_user_meta_data->full_name
        )
      )
    `)
    .eq('id', submissionId)
    .single();

  return { data, error };
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    pendingSubmissions,
    overdueDeadlines,
    dueTodayDeadlines,
    formsCompletedToday
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('users')
      .select('id', { count: 'exact' })
      .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('submissions')
      .select('id', { count: 'exact' })
      .eq('admin_status', 'pending'),
    supabase.from('deadlines')
      .select('id', { count: 'exact' })
      .lt('due_date', new Date().toISOString())
      .neq('status', 'completed'),
    supabase.from('deadlines')
      .select('id', { count: 'exact' })
      .gte('due_date', today.toISOString())
      .lt('due_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .neq('status', 'completed'),
    supabase.from('submissions')
      .select('id', { count: 'exact' })
      .gte('completed_at', today.toISOString())
  ]);

  return {
    totalUsers: totalUsers.count || 0,
    activeUsers: activeUsers.count || 0,
    pendingSubmissions: pendingSubmissions.count || 0,
    overdueDeadlines: overdueDeadlines.count || 0,
    dueTodayDeadlines: dueTodayDeadlines.count || 0,
    formsCompletedToday: formsCompletedToday.count || 0
  };
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
  submissionId: string,
  newStatus: string,
  adminId: string,
  notes?: string
) {
  // Get current status
  const { data: submission } = await supabase
    .from('submissions')
    .select('admin_status')
    .eq('id', submissionId)
    .single();

  // Update submission
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      admin_status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId
    })
    .eq('id', submissionId);

  if (updateError) throw updateError;

  // Log status change
  await supabase.from('submission_status_history').insert({
    submission_id: submissionId,
    old_status: submission?.admin_status,
    new_status: newStatus,
    changed_by: adminId,
    notes
  });

  // Log admin activity
  await logAdminActivity({
    admin_id: adminId,
    action_type: 'update',
    entity_type: 'submission',
    entity_id: submissionId,
    metadata: { status: newStatus, notes }
  });
}

/**
 * Add internal note
 */
export async function addInternalNote(
  submissionId: string,
  userId: string,
  authorId: string,
  noteType: string,
  content: string,
  isFlagged = false
) {
  const { data, error } = await supabase
    .from('internal_notes')
    .insert({
      submission_id: submissionId,
      user_id: userId,
      author_id: authorId,
      note_type: noteType,
      content,
      is_flagged: isFlagged
    })
    .select()
    .single();

  if (!error) {
    await logAdminActivity({
      admin_id: authorId,
      action_type: 'note',
      entity_type: 'submission',
      entity_id: submissionId,
      metadata: { note_type: noteType, flagged: isFlagged }
    });
  }

  return { data, error };
}

/**
 * Log admin activity
 */
async function logAdminActivity(activity: {
  admin_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  metadata?: any;
}) {
  await supabase.from('admin_activity_log').insert(activity);
}
```

---

## 📋 Example Components

### Admin Submissions Table
```typescript
// src/components/admin/SubmissionsTable.tsx

interface SubmissionsTableProps {
  filters: SubmissionFilters;
  onFilterChange: (filters: SubmissionFilters) => void;
}

export function SubmissionsTable({ filters, onFilterChange }: SubmissionsTableProps) {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['admin-submissions', filters],
    queryFn: () => getAllSubmissions(filters)
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateSubmissionStatus(id, status, currentAdminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      toast.success('Status updated');
    }
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <SubmissionFilters
        filters={filters}
        onChange={onFilterChange}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kit Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions?.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.user.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {submission.kit.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={submission.admin_status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={submission.priority} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/submissions/${submission.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <StatusDropdown
                      currentStatus={submission.admin_status}
                      onStatusChange={(status) => updateStatus({ id: submission.id, status })}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Internal Notes Panel
```typescript
// src/components/admin/InternalNotesPanel.tsx

interface InternalNotesPanelProps {
  submissionId: string;
  userId: string;
  notes: InternalNote[];
}

export function InternalNotesPanel({ submissionId, userId, notes }: InternalNotesPanelProps) {
  const { user: currentAdmin } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'review' | 'follow_up' | 'issue' | 'resolved'>('review');
  const [isFlagged, setIsFlagged] = useState(false);

  const { mutate: addNote } = useMutation({
    mutationFn: () =>
      addInternalNote(submissionId, userId, currentAdmin.id, noteType, newNote, isFlagged),
    onSuccess: () => {
      setNewNote('');
      setIsFlagged(false);
      queryClient.invalidateQueries({ queryKey: ['submission-detail', submissionId] });
      toast.success('Note added');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Internal Notes
          <Badge variant="secondary">{notes.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Note */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="review">Review</option>
              <option value="follow_up">Follow Up</option>
              <option value="issue">Issue</option>
              <option value="resolved">Resolved</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFlagged}
                onChange={(e) => setIsFlagged(e.target.checked)}
              />
              <Flag className="h-4 w-4 text-red-600" />
              Flag Important
            </label>
          </div>
          
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note... (not visible to user)"
            className="w-full border rounded p-2 text-sm"
            rows={3}
          />
          
          <Button
            onClick={() => addNote()}
            disabled={!newNote.trim()}
            size="sm"
          >
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`border rounded p-3 ${note.is_flagged ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getNoteTypeVariant(note.note_type)}>
                    {note.note_type}
                  </Badge>
                  {note.is_flagged && (
                    <Flag className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{note.content}</p>
              
              <div className="text-xs text-gray-500">
                by {note.author.raw_user_meta_data?.full_name || note.author.email}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔍 Advanced Features

### 1. Bulk Actions
```typescript
// Select multiple submissions and apply actions
- Assign to attorney
- Change priority
- Update status
- Send reminder
- Export data
```

### 2. Search
```typescript
// Global search across:
- User names/emails
- Submission IDs
- Form responses
- Document names
- Internal notes
```

### 3. Filters and Saved Views
```typescript
// Save filter combinations as views:
- "My Queue" - Assigned to me, pending
- "Urgent This Week" - Priority urgent, due within 7 days
- "Needs Follow-up" - Flagged for follow-up
- Custom views
```

### 4. Notifications for Admins
```typescript
// Notify attorneys when:
- New submission assigned to them
- Status changed on their submission
- Deadline approaching for their submissions
- User adds comment/question
- Flagged items need attention
```

### 5. Performance Metrics
```typescript
// Track and display:
- Average time to first review
- Average time to completion
- Submissions per attorney
- User satisfaction scores
- Deadline miss rate
```

---

## 🎯 Permission Checks

### Client-Side Check
```typescript
// src/hooks/useAdminAuth.ts

export function useAdminAuth() {
  const { user } = useAuth();
  
  const isAdmin = user?.user_metadata?.role === 'admin';
  const isAttorney = user?.user_metadata?.role === 'attorney';
  const isAdminOrAttorney = isAdmin || isAttorney;
  
  const checkAdminAccess = () => {
    if (!isAdminOrAttorney) {
      throw new Error('Unauthorized: Admin access required');
    }
  };
  
  return {
    isAdmin,
    isAttorney,
    isAdminOrAttorney,
    checkAdminAccess
  };
}

// Usage in components
function AdminSubmissions() {
  const { checkAdminAccess } = useAdminAuth();
  
  useEffect(() => {
    checkAdminAccess();
  }, []);
  
  // Component code...
}
```

### Server-Side Check (Supabase Function)
```typescript
// supabase/functions/admin-action/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Get user from auth header
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: { user } } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '')
  );
  
  // Check role
  if (!['admin', 'attorney'].includes(user?.user_metadata?.role)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403 }
    );
  }
  
  // Proceed with admin action...
});
```

---

## 📱 Mobile Considerations

### Responsive Design
- Stacked layout on mobile
- Collapsible filters
- Swipe actions on table rows
- Bottom sheet for quick actions

### Priority Features for Mobile
1. View submissions list
2. Quick status updates
3. Add notes
4. View documents
5. Deadline alerts

---

## 🚀 Implementation Roadmap

### Phase 2.1 (Weeks 1-2)
- ✅ Set up admin routes and layout
- ✅ Implement RLS policies
- ✅ Create admin dashboard with stats
- ✅ Build submissions table with filters

### Phase 2.2 (Weeks 3-4)
- ✅ Submission detail view
- ✅ Internal notes system
- ✅ Status management
- ✅ Document viewer

### Phase 2.3 (Weeks 5-6)
- ✅ Deadline monitoring
- ✅ User management
- ✅ Activity logging
- ✅ Search functionality

### Phase 2.4 (Weeks 7-8)
- ✅ Advanced filters
- ✅ Bulk actions
- ✅ Reports and analytics
- ✅ Admin notifications

---

## 📈 Analytics & Reporting

### Available Reports
1. **Submission Trends**
   - Submissions per day/week/month
   - By kit type
   - By status

2. **Attorney Performance**
   - Submissions reviewed
   - Average review time
   - User satisfaction

3. **Deadline Compliance**
   - On-time completion rate
   - Missed deadlines by type
   - Trends over time

4. **User Engagement**
   - Active users
   - Kit purchases
   - Form completion rates

---

## 🔒 Security Best Practices

1. **Audit Logging**: Log all admin actions
2. **Data Masking**: Sensitive data partially hidden
3. **Session Timeout**: Auto-logout after inactivity
4. **IP Restrictions** (optional): Limit admin access to office IPs
5. **2FA**: Require for admin accounts
6. **Export Controls**: Log and limit bulk data exports

---

## ✅ Summary

This admin/attorney system provides:

✅ **Complete submission management** with filtering and sorting  
✅ **Internal notes and collaboration** tools  
✅ **Deadline monitoring** across all users  
✅ **User management** capabilities  
✅ **Robust security** with RLS and audit logging  
✅ **Analytics and reporting** for insights  
✅ **Scalable architecture** for future expansion  

**Ready for Phase 2 implementation!**
