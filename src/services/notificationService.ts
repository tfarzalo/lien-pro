// =====================================================
// Notification Service Outline
// Framework for email and in-app notifications
// =====================================================

/**
 * This is an OUTLINE for implementing reminder notifications.
 * To fully implement, you will need to:
 * 1. Set up an email service (SendGrid, AWS SES, Resend, etc.)
 * 2. Create notification templates
 * 3. Set up background jobs/cron to check deadlines
 * 4. Implement in-app notification storage
 */

import { supabase } from '@/lib/supabaseClient';
import { Deadline } from '@/lib/deadlineCalculator';
import { getDeadlinesNeedingReminders } from '@/services/deadlinesService';

// =====================================================
// Types
// =====================================================

export interface NotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled?: boolean;
  reminderDays: number[]; // e.g., [7, 3, 1] for 7, 3, and 1 day before
  criticalOnly: boolean;
}

export interface InAppNotification {
  id: string;
  userId: string;
  deadlineId?: string;
  type: 'deadline_reminder' | 'deadline_overdue' | 'deadline_due_today' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

// =====================================================
// Email Notification Service
// =====================================================

/**
 * STEP 1: Configure your email service provider
 * Example using SendGrid:
 * 
 * import sgMail from '@sendgrid/mail';
 * sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 * 
 * Or using Resend:
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 */

/**
 * Sends an email reminder for an upcoming deadline
 */
export async function sendDeadlineReminderEmail(
  userEmail: string,
  userName: string,
  deadline: Deadline
): Promise<{ success: boolean; error?: Error }> {
  try {
    // STEP 2: Build the email content
    const emailData = buildDeadlineReminderEmail(userName, deadline);

    // STEP 3: Send the email using your provider
    // Example with SendGrid:
    /*
    await sgMail.send({
      to: userEmail,
      from: 'notifications@yourapp.com',
      subject: emailData.subject,
      text: emailData.textBody,
      html: emailData.htmlBody,
    });
    */

    // Example with Resend:
    /*
    await resend.emails.send({
      from: 'Lien Professor <notifications@lienprofessor.com>',
      to: userEmail,
      subject: emailData.subject,
      html: emailData.htmlBody,
    });
    */

    // For now, just log (replace with actual sending)
    console.log(`[Email] Sending to ${userEmail}:`, emailData.subject);

    // STEP 4: Log the notification in database
    await logNotificationSent({
      userId: deadline.userId,
      deadlineId: deadline.id,
      type: 'email',
      status: 'sent',
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending deadline reminder email:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Builds the email template for a deadline reminder
 */
function buildDeadlineReminderEmail(userName: string, deadline: Deadline): EmailTemplate {
  const daysUntil = Math.ceil(
    (new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const urgencyLabel =
    deadline.severity === 'critical' ? 'URGENT' : deadline.severity === 'high' ? 'Important' : '';

  const subject = `${urgencyLabel} Deadline Reminder: ${deadline.title} - ${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 30px; }
        .deadline-card { background: white; border-left: 4px solid ${deadline.severity === 'critical' ? '#dc2626' : '#f59e0b'}; padding: 20px; margin: 20px 0; }
        .urgent { color: #dc2626; font-weight: bold; }
        .button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Lien Professor Deadline Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>This is a reminder about an ${deadline.severity === 'critical' ? '<span class="urgent">URGENT</span>' : 'important'} deadline:</p>
          
          <div class="deadline-card">
            <h2>${deadline.title}</h2>
            <p><strong>Due Date:</strong> ${new Date(deadline.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time Remaining:</strong> ${daysUntil} day${daysUntil !== 1 ? 's' : ''}</p>
            <p><strong>Description:</strong> ${deadline.description}</p>
            ${deadline.legalReference ? `<p><strong>Legal Reference:</strong> ${deadline.legalReference}</p>` : ''}
          </div>

          ${deadline.actionItems && deadline.actionItems.length > 0 ? `
            <h3>Action Items:</h3>
            <ul>
              ${deadline.actionItems.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View in Dashboard</a>
          
          <p style="margin-top: 30px;">Don't miss this deadline! Log in to your account to mark it complete or view more details.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lien Professor. All rights reserved.</p>
          <p>You're receiving this because you have deadline reminders enabled.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Hi ${userName},

This is a reminder about an ${deadline.severity === 'critical' ? 'URGENT' : 'important'} deadline:

${deadline.title}
Due Date: ${new Date(deadline.dueDate).toLocaleDateString()}
Time Remaining: ${daysUntil} day${daysUntil !== 1 ? 's' : ''}

Description: ${deadline.description}

${deadline.legalReference ? `Legal Reference: ${deadline.legalReference}\n` : ''}

${deadline.actionItems && deadline.actionItems.length > 0 ? `
Action Items:
${deadline.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}
` : ''}

View in Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Don't miss this deadline! Log in to your account to mark it complete or view more details.

--
© ${new Date().getFullYear()} Lien Professor
Manage notification preferences: ${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications
  `;

  return { subject, htmlBody, textBody };
}

// =====================================================
// In-App Notification Service
// =====================================================

/**
 * Creates an in-app notification for a deadline
 */
export async function createInAppNotification(
  userId: string,
  deadline: Deadline,
  notificationType: 'reminder' | 'overdue' | 'due_today'
): Promise<{ success: boolean; error?: Error }> {
  try {
    const daysUntil = Math.ceil(
      (new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    let title = '';
    let message = '';

    switch (notificationType) {
      case 'reminder':
        title = `Deadline Reminder: ${deadline.title}`;
        message = `You have ${daysUntil} day${daysUntil !== 1 ? 's' : ''} until this deadline.`;
        break;
      case 'overdue':
        title = `Overdue: ${deadline.title}`;
        message = `This deadline was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago.`;
        break;
      case 'due_today':
        title = `Due Today: ${deadline.title}`;
        message = 'This deadline is due today. Take action now!';
        break;
    }

    // Insert into notifications table
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      deadline_id: deadline.id,
      type: `deadline_${notificationType}`,
      title,
      message,
      action_url: `/deadlines/${deadline.id}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Log the notification
    await logNotificationSent({
      userId,
      deadlineId: deadline.id,
      type: 'in_app',
      status: 'delivered',
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Gets unread notifications for a user
 */
export async function getUnreadNotifications(
  userId: string
): Promise<{ data: InAppNotification[] | null; error?: Error }> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as InAppNotification[] };
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: Error }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error as Error };
  }
}

// =====================================================
// Background Job / Cron Logic
// =====================================================

/**
 * STEP 5: Set up a background job to check deadlines and send reminders
 * 
 * Options:
 * 1. Vercel Cron Jobs (https://vercel.com/docs/cron-jobs)
 * 2. AWS EventBridge + Lambda
 * 3. GitHub Actions scheduled workflows
 * 4. Supabase Edge Functions with pg_cron
 * 5. Dedicated cron service like EasyCron
 * 
 * Example Vercel cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-deadlines",
 *     "schedule": "0 9 * * *"  // Run daily at 9 AM
 *   }]
 * }
 */

/**
 * Main function to check deadlines and send reminders
 * This would be called by your cron job
 */
export async function processDeadlineReminders(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  let processed = 0;
  let sent = 0;
  let errors = 0;

  try {
    // STEP 6: Get all users with notification preferences
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, notification_preferences');

    if (usersError) throw usersError;

    // STEP 7: For each user, check their deadlines
    for (const user of users || []) {
      processed++;

      try {
        // Get user's notification preferences
        const prefs: NotificationPreferences = user.notification_preferences || {
          emailEnabled: true,
          inAppEnabled: true,
          reminderDays: [7, 3, 1],
          criticalOnly: false,
        };

        if (!prefs.emailEnabled && !prefs.inAppEnabled) {
          continue; // Skip if all notifications disabled
        }

        // Get deadlines that need reminders
        const maxDays = Math.max(...prefs.reminderDays);
        const { data: deadlines } = await getDeadlinesNeedingReminders(user.id, maxDays);

        if (!deadlines || deadlines.length === 0) continue;

        // STEP 8: Filter deadlines based on reminder days
        for (const deadline of deadlines) {
          const daysUntil = Math.ceil(
            (new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          // Check if we should send a reminder today
          if (!prefs.reminderDays.includes(daysUntil)) continue;

          // Check if critical only filter applies
          if (prefs.criticalOnly && deadline.severity !== 'critical') continue;

          // Check if we already sent a reminder today
          const alreadySent = await checkIfReminderSentToday(user.id, deadline.id || '');
          if (alreadySent) continue;

          // Send email notification
          if (prefs.emailEnabled && user.email) {
            await sendDeadlineReminderEmail(user.email, user.full_name || 'User', deadline);
          }

          // Create in-app notification
          if (prefs.inAppEnabled) {
            const type = daysUntil === 0 ? 'due_today' : 'reminder';
            await createInAppNotification(user.id, deadline, type);
          }

          sent++;
        }
      } catch (error) {
        console.error(`Error processing reminders for user ${user.id}:`, error);
        errors++;
      }
    }

    console.log(`Deadline reminders processed: ${processed} users, ${sent} reminders sent, ${errors} errors`);
    return { processed, sent, errors };
  } catch (error) {
    console.error('Error in processDeadlineReminders:', error);
    return { processed, sent, errors };
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Logs a notification in the database for tracking
 */
async function logNotificationSent(data: {
  userId: string;
  deadlineId?: string;
  type: 'email' | 'in_app' | 'push';
  status: 'sent' | 'delivered' | 'failed';
}): Promise<void> {
  try {
    await supabase.from('notification_logs').insert({
      user_id: data.userId,
      deadline_id: data.deadlineId,
      notification_type: data.type,
      status: data.status,
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

/**
 * Checks if a reminder was already sent today for a deadline
 */
async function checkIfReminderSentToday(userId: string, deadlineId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('notification_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('deadline_id', deadlineId)
      .gte('sent_at', today.toISOString())
      .limit(1);

    if (error) throw error;

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking if reminder sent:', error);
    return false;
  }
}

// =====================================================
// Database Schema Requirements
// =====================================================

/**
 * STEP 9: Create these tables in your Supabase database:
 * 
 * -- Notifications table (in-app notifications)
 * CREATE TABLE notifications (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,
 *   type VARCHAR(50) NOT NULL,
 *   title VARCHAR(255) NOT NULL,
 *   message TEXT NOT NULL,
 *   action_url VARCHAR(500),
 *   is_read BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   read_at TIMESTAMP WITH TIME ZONE
 * );
 * 
 * CREATE INDEX idx_notifications_user ON notifications(user_id);
 * CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
 * 
 * -- Notification logs (for tracking sent notifications)
 * CREATE TABLE notification_logs (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,
 *   notification_type VARCHAR(20) NOT NULL,
 *   status VARCHAR(20) NOT NULL,
 *   sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);
 * CREATE INDEX idx_notification_logs_deadline ON notification_logs(deadline_id);
 * CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
 * 
 * -- Add notification preferences to users table
 * ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{
 *   "emailEnabled": true,
 *   "inAppEnabled": true,
 *   "reminderDays": [7, 3, 1],
 *   "criticalOnly": false
 * }'::jsonb;
 */
