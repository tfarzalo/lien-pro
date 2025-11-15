# 🎯 Quick Start Guide - Deadline System

## What You Have Now

✅ **Complete Deadline Engine** - Calculates all Texas lien law deadlines automatically  
✅ **Database Service** - Stores and manages deadlines in Supabase  
✅ **Beautiful UI Component** - Displays deadlines with filtering, sorting, and highlighting  
✅ **Notification Framework** - Outline for email and in-app reminders  
✅ **Full Documentation** - See `DEADLINE_SYSTEM_IMPLEMENTATION.md`  
✅ **Integration Examples** - See `INTEGRATION_EXAMPLES.tsx`

---

## 📂 Files Created

```
src/
├── lib/
│   └── deadlineCalculator.ts           ✅ READY - Core deadline calculation
├── services/
│   ├── deadlinesService.ts             ✅ READY - Database operations
│   └── notificationService.ts          📝 OUTLINE - Notification framework
└── components/
    └── deadlines/
        └── DeadlinesList.tsx           ✅ READY - Display component

Root:
├── DEADLINE_SYSTEM_IMPLEMENTATION.md   📖 Full implementation guide
└── INTEGRATION_EXAMPLES.tsx            💡 Copy/paste examples
```

---

## 🚀 How to Use (3 Steps)

### Step 1: After User Completes Assessment

```typescript
import { createProjectDeadlines } from '@/services/deadlinesService';

// In your assessment completion handler
const { data: deadlines } = await createProjectDeadlines(
  assessmentData,    // From your assessment form
  projectData,       // Project details with dates
  userId            // Current user ID
);

console.log(`Created ${deadlines.length} deadlines`);
```

### Step 2: Display in Dashboard

```typescript
import { DeadlinesList } from '@/components/deadlines/DeadlinesList';
import { fetchDeadlinesByUser } from '@/services/deadlinesService';

function Dashboard() {
  const { user } = useAuth();
  
  // Fetch deadlines
  const { data: deadlines } = useQuery({
    queryKey: ['deadlines', user?.id],
    queryFn: async () => {
      const { data } = await fetchDeadlinesByUser(user.id);
      return data || [];
    }
  });

  return (
    <div>
      <h2>Your Deadlines</h2>
      <DeadlinesList
        deadlines={deadlines || []}
        showFilters={true}
        onDeadlineClick={(deadline) => {
          console.log('Clicked:', deadline.title);
        }}
      />
    </div>
  );
}
```

### Step 3: (Optional) Set Up Notifications

See `DEADLINE_SYSTEM_IMPLEMENTATION.md` section "Part 4: Notification System"

---

## 💡 Key Functions Reference

### Deadline Calculator (`src/lib/deadlineCalculator.ts`)

```typescript
// Calculate all deadlines for a project
const deadlines = calculateDeadlines(assessmentData, projectData, userId);

// Recalculate when data changes
const updated = recalculateDeadlines(existingDeadlines, newProjectData);

// Get deadline status
const status = getDeadlineStatus(deadline);  // 'overdue', 'due_soon', 'upcoming'

// Get severity
const severity = getDeadlineSeverity(deadlineType, daysUntil);  // 'critical', 'high', etc.
```

### Deadlines Service (`src/services/deadlinesService.ts`)

```typescript
// Create
await createProjectDeadlines(assessmentData, projectData, userId);

// Read
await fetchDeadlinesByUser(userId);
await fetchDeadlinesByProject(projectId);
await getDeadlinesNeedingReminders(userId, 7);

// Update
await updateProjectDeadlines(projectId, userId, newAssessmentData, newProjectData);
await updateDeadlineStatus(deadlineId, 'completed');

// Delete
await deleteDeadline(deadlineId);

// Stats
await getDashboardStats(userId);
```

### Deadlines List Component (`src/components/deadlines/DeadlinesList.tsx`)

```typescript
<DeadlinesList
  deadlines={deadlines}
  showFilters={true}        // Show filter buttons
  maxItems={10}             // Limit display count
  compact={false}           // Compact vs full view
  onDeadlineClick={(deadline) => {
    // Handle click
  }}
/>
```

---

## 🎨 Visual Features

### Automatic Color Coding
- 🔴 **Red** - Overdue deadlines
- 🟠 **Orange** - Due today or critical/urgent
- 🔵 **Blue** - High priority
- ⚪ **White** - Normal priority
- ⚫ **Gray** - Completed

### Filtering Options
- All Deadlines
- Overdue Only
- Urgent (Critical Severity)
- Upcoming (Next 30 Days)
- Completed

### Sorting Options
- By Due Date
- By Severity
- By Status

---

## 📊 Deadline Types Calculated

| Type | Description | Texas Law Reference |
|------|-------------|-------------------|
| **Preliminary Notice** | 15 days from first furnishing | Property Code §53.056 |
| **Monthly Notice** | 15th of each month for retainage | Property Code §53.057 |
| **Retainage Notice** | Before final payment | Property Code §53.057 |
| **Mechanics Lien** | 4th month after last furnishing | Property Code §53.052 |
| **Bond Claim** | 15 days after completion (public) | Property Code §2253.041 |
| **Payment Demand** | Before filing lien | Property Code §53.056 |
| **Lawsuit Filing** | Within 2 years of lien | Property Code §53.158 |
| **Payment Due** | Custom payment deadlines | N/A |

---

## 🗄️ Database Tables Needed

Run these SQL commands in your Supabase SQL editor:

```sql
-- 1. Deadlines Table
CREATE TABLE deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_optional BOOLEAN DEFAULT FALSE,
  legal_reference TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deadlines_user ON deadlines(user_id);
CREATE INDEX idx_deadlines_project ON deadlines(project_id);
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX idx_deadlines_status ON deadlines(status);

-- 2. Notifications Table (for in-app notifications)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- 3. Notification Logs (for tracking sent notifications)
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,
  notification_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
```

---

## 🧪 Test It

### 1. Test Deadline Calculation

```typescript
import { calculateDeadlines } from '@/lib/deadlineCalculator';

const testAssessment = {
  canFilePreliminaryNotice: true,
  canFileMonthlyNotice: true,
  canFileMechanicsLien: true,
  // ... other flags
};

const testProject = {
  projectId: 'test-123',
  projectType: 'commercial',
  propertyType: 'non_homestead',
  contractType: 'subcontractor',
  firstFurnishedDate: '2024-01-15',
  lastFurnishedDate: '2024-03-15',
  // ... other details
};

const deadlines = calculateDeadlines(testAssessment, testProject, 'user-123');
console.log('Calculated deadlines:', deadlines);
```

### 2. Test Database Operations

```typescript
// Create
const { data, error } = await createProjectDeadlines(
  assessmentData,
  projectData,
  'user-123'
);

// Fetch
const { data: myDeadlines } = await fetchDeadlinesByUser('user-123');
console.log('My deadlines:', myDeadlines);

// Update status
await updateDeadlineStatus('deadline-id-123', 'completed');
```

### 3. Test UI Component

```typescript
// Create a test page
function TestDeadlines() {
  const testDeadlines = [
    {
      id: '1',
      title: 'File Preliminary Notice',
      description: 'Must file within 15 days',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      severity: 'critical',
      status: 'upcoming',
      // ... other fields
    },
    // Add more test deadlines
  ];

  return <DeadlinesList deadlines={testDeadlines} showFilters={true} />;
}
```

---

## ⚠️ Important Notes

### 1. Assessment Data Required
The deadline calculator needs assessment results to know which deadlines apply. Make sure to save assessment data when user completes the questionnaire.

### 2. Project Dates Required
Key dates needed:
- `firstFurnishedDate` - When work/materials first provided
- `lastFurnishedDate` - When work/materials last provided (can be updated)
- `contractDate` - When contract was signed
- `noticeOfCompletionDate` - If received

### 3. Status Updates
Deadlines should be updated when:
- Project dates change → Recalculate all deadlines
- User marks deadline complete → Update status
- Deadline passes → Cron job updates to 'overdue'

### 4. Notifications
The notification system is provided as an outline. To implement:
1. Choose email service (SendGrid, Resend, etc.)
2. Set up cron job (Vercel Cron, GitHub Actions, etc.)
3. Customize email templates
4. Configure user preferences

---

## 📚 Documentation

- **Full Implementation Guide**: `DEADLINE_SYSTEM_IMPLEMENTATION.md`
- **Integration Examples**: `INTEGRATION_EXAMPLES.tsx`
- **Core Logic**: `src/lib/deadlineCalculator.ts` (well-commented)
- **Service Functions**: `src/services/deadlinesService.ts` (well-commented)
- **UI Component**: `src/components/deadlines/DeadlinesList.tsx`

---

## 🆘 Common Issues

### Deadlines Not Showing
1. Check if `createProjectDeadlines()` was called after assessment
2. Verify user ID matches between creation and fetch
3. Check database table exists and has data

### Wrong Deadlines
1. Verify assessment data flags are correct
2. Check project dates are in ISO format
3. Review project type/property type/contract type values

### UI Not Displaying Correctly
1. Ensure all UI components (Card, Button, Badge, Alert) are available
2. Check Tailwind CSS classes are configured
3. Verify date-fns is installed: `npm install date-fns`

---

## ✅ Next Steps

1. **Run database migrations** (create tables)
2. **Test deadline calculation** with sample data
3. **Integrate into dashboard** using examples
4. **Set up email service** when ready for notifications
5. **Configure cron job** for automated reminders
6. **Customize UI** to match your design system

---

## 🎉 You're All Set!

You now have a production-ready deadline tracking system that:
- ✅ Automatically calculates Texas lien law deadlines
- ✅ Stores them securely in your database
- ✅ Displays them beautifully with filtering and highlighting
- ✅ Has a framework ready for email/in-app notifications

**Questions?** Check the full implementation guide or the commented code in each file.

**Ready to deploy?** Follow the deployment checklist in `DEADLINE_SYSTEM_IMPLEMENTATION.md`.

---

Made with ❤️ for Texas construction professionals
