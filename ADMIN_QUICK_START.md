# Admin Tools - Quick Start Guide

## Getting Started

This guide will help you quickly set up and start using the admin/attorney tools.

## 1. Setup (One-Time)

### Run Database Migration

```bash
# Navigate to your project directory
cd "Lien Professor App"

# Run the migration using Supabase CLI
supabase migration up

# Or manually run the SQL file in Supabase Dashboard:
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Paste contents of supabase/migrations/admin_tools_schema.sql
# 3. Click "Run"
```

### Assign Admin Roles

In Supabase Dashboard > SQL Editor, run:

```sql
-- Make yourself an admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Or create an attorney user
UPDATE profiles 
SET role = 'attorney' 
WHERE email = 'attorney@example.com';
```

## 2. Accessing Admin Tools

1. **Log in** to your account (with admin or attorney role)
2. **Navigate** to `/admin` in your browser
3. You'll see the admin dashboard immediately

### Quick Navigation

- **Dashboard**: `/admin` - Overview and stats
- **Submissions**: `/admin/submissions` - View all submissions
- **Deadlines**: `/admin/deadlines` - Monitor deadlines
- **Users**: `/admin/users` - Manage users

## 3. Common Tasks

### View Recent Submissions

1. Go to `/admin/submissions`
2. See all user submissions in a table
3. Click any row to see details

### Filter Submissions

1. Click "Filters" button
2. Select status, date range, or enter search term
3. Results update automatically

### Review a Submission

1. From submissions list, click on a submission
2. View all details:
   - User info
   - Project details
   - Form responses
   - Uploaded documents
   - Deadlines
3. Change status using dropdown
4. Add internal notes in the panel below

### Add Internal Notes

1. Open submission detail page
2. Scroll to "Internal Notes" section
3. Type your note in the text area
4. Click "Add Note"
5. Only staff can see these notes (not the user)

### Monitor Deadlines

1. Go to `/admin/deadlines`
2. View all deadlines with status indicators:
   - Red = Overdue
   - Yellow = Upcoming
   - Green = Completed
3. Filter by status using tabs at top
4. Click "Send Reminder" to notify user (coming soon)

### Search Users

1. Go to `/admin/users`
2. Type name or email in search box
3. View user stats (projects, submissions, last active)
4. Click "View" to see full user details (coming soon)

## 4. Understanding the Dashboard

### Statistics Cards

- **Total Users**: All registered users
- **Active Users**: Users active in last 30 days
- **Pending Submissions**: Awaiting review
- **In Review**: Currently being reviewed
- **Overdue Deadlines**: Past due date
- **Due Today**: Deadlines today
- **Due This Week**: Deadlines in next 7 days
- **Forms Completed Today**: Today's activity
- **Avg Review Time**: Average days to review

### Recent Submissions Widget

- Shows last 5 submissions
- Status indicators
- Quick "View Details" link

### Urgent Deadlines Widget

- Shows next 5 upcoming or overdue deadlines
- Priority levels (low, medium, high, urgent)
- User and project context

## 5. Status Workflow

Submissions typically follow this workflow:

1. **Draft** - User is still filling out forms
2. **Submitted** - User completed and submitted
3. **Under Review** - Attorney is reviewing
4. **Approved** - Ready to file
5. **Rejected** - Needs corrections

To change status:
1. Open submission detail
2. Select new status from dropdown at top
3. Status changes are logged automatically

## 6. Best Practices

### Internal Notes

- **Use note types appropriately:**
  - `review` - General review comments
  - `follow_up` - Action items
  - `issue` - Problems found
  - `resolved` - Issue fixed

- **Be detailed** - Include specific feedback
- **Flag important items** - Use flag for urgent matters
- **Tag next steps** - Indicate what needs to happen next

### Deadline Management

- **Check daily** - Review overdue deadlines first
- **Set reminders** - Send reminders 3-5 days before due
- **Update status** - Mark completed when filed
- **Note extensions** - Add note if deadline extended

### Communication

- **Internal notes** - Use for staff communication
- **Email user** - Use "Send Email" button for client communication (coming soon)
- **Document decisions** - Log why status changed
- **Track time** - Note time spent on review

## 7. Keyboard Shortcuts (Coming Soon)

- `g d` - Go to Dashboard
- `g s` - Go to Submissions
- `g d l` - Go to Deadlines
- `g u` - Go to Users
- `/` - Focus search
- `Esc` - Close modals

## 8. Mobile Access

The admin tools are responsive and work on mobile devices:

- **Phone**: Navigation collapses to hamburger menu
- **Tablet**: Full layout with some optimization
- **Desktop**: Best experience with all features

## 9. Troubleshooting

### "Not authorized to access this page"

**Problem**: You see this when trying to access `/admin`

**Solution**: 
- Verify your user role in database
- Run: `SELECT role FROM profiles WHERE email = 'your-email@example.com';`
- Should return `admin` or `attorney`
- If not, run: `UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';`

### Data not loading

**Problem**: Empty tables or "Loading..." that never finishes

**Solution**:
- Check browser console for errors (F12 > Console)
- Verify Supabase connection
- Check RLS policies allow access
- Try logging out and back in

### Can't add internal notes

**Problem**: Error when adding notes

**Solution**:
- Ensure `internal_notes` table exists
- Check RLS policies allow insert for your role
- Verify submission ID is valid

## 10. Getting Help

### Documentation

- **Full Implementation Guide**: `ADMIN_TOOLS_IMPLEMENTATION.md`
- **Design Document**: `ADMIN_TOOLS_DESIGN.md`
- **Deadline System**: `DEADLINE_SYSTEM_IMPLEMENTATION.md`

### Support Contacts

- Technical issues: Contact development team
- Feature requests: Submit to product team
- Training: Request session with admin lead

## 11. What's Next?

### Coming Soon

- **Bulk actions** - Update multiple submissions at once
- **Email integration** - Send emails directly from admin panel
- **Advanced reports** - Custom analytics and exports
- **Saved filters** - Save commonly used filter combinations
- **Team management** - Assign submissions to specific attorneys
- **Notifications** - Get alerts for important events

### Future Enhancements

- **Mobile app** - Native iOS/Android app for attorneys
- **Calendar integration** - Sync deadlines with Google/Outlook
- **Document preview** - View PDFs without downloading
- **Client portal** - Let users track their own status
- **API access** - Integrate with third-party tools

## 12. Tips for Efficiency

### For Admins

1. **Start with dashboard** - Get overview of day's work
2. **Review overdue first** - Prioritize overdue deadlines
3. **Batch similar tasks** - Review all of one status at once
4. **Use filters** - Create focused work queues
5. **Add notes consistently** - Track decisions and reasoning

### For Attorneys

1. **Filter by "Submitted"** - See what needs review
2. **Add detailed notes** - Help team understand your review
3. **Flag issues** - Use flagged notes for important items
4. **Update status promptly** - Keep workflow moving
5. **Check deadlines daily** - Never miss a filing date

### Time-Saving Tricks

- **Use search liberally** - Find submissions quickly
- **Keep dashboard open** - Refresh for latest stats
- **Bookmark frequent filters** - (Coming soon)
- **Review in batches** - Set aside dedicated time
- **Use quick actions** - Skip unnecessary clicks

## Appendix: Common Queries

### Find all submissions needing review

1. Go to Submissions
2. Filter by status: "Submitted"
3. Sort by date (oldest first)

### Find user's submissions

1. Go to Users
2. Search for user's email
3. Click "View" to see all their submissions

### Check upcoming deadlines this week

1. Go to Deadlines
2. Click "Upcoming" tab
3. Look at next 7 days

### See who changed a submission status

1. Open submission detail
2. Check "Timeline" section (shows history)
3. Or view internal notes for details

---

**Need more help?** Check `ADMIN_TOOLS_IMPLEMENTATION.md` for complete documentation.
