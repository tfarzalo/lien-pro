// =====================================================
// Admin Queries Service
// Database queries for admin/attorney interface
// =====================================================

import { supabase } from '@/lib/supabaseClient';

// =====================================================
// Types
// =====================================================

export interface SubmissionFilters {
    status?: string;
    priority?: string;
    assignedTo?: string;
    kitType?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    hasFlags?: boolean;
    search?: string;
}

export interface AdminDashboardStats {
    totalUsers: number;
    activeUsers: number;
    pendingSubmissions: number;
    inReviewSubmissions: number;
    overdueDeadlines: number;
    dueTodayDeadlines: number;
    dueThisWeekDeadlines: number;
    formsCompletedToday: number;
    avgReviewTime: number;
}

export interface InternalNote {
    id: string;
    submission_id: string;
    user_id: string;
    author_id: string;
    note_type: 'review' | 'follow_up' | 'issue' | 'resolved';
    content: string;
    is_flagged: boolean;
    created_at: string;
    updated_at: string;
    author?: {
        email: string;
        raw_user_meta_data?: { full_name?: string };
    };
}

export interface StatusHistoryEntry {
    id: string;
    submission_id: string;
    old_status: string | null;
    new_status: string;
    changed_by: string;
    notes: string | null;
    created_at: string;
    changed_by_user?: {
        email: string;
        raw_user_meta_data?: { full_name?: string };
    };
}

// =====================================================
// Submissions Queries
// =====================================================

/**
 * Get all submissions with filters (admin/attorney only)
 */
export async function getAllSubmissions(filters: SubmissionFilters = {}) {
    try {
        let query = supabase
            .from('user_kits')
            .select(`
        *,
        user:users!user_id (
          id,
          email,
          full_name,
          created_at,
          last_sign_in_at
        ),
        lien_kit:lien_kits!lien_kit_id (
          id,
          name,
          category,
          description
        )
      `)
            .order('purchase_date', { ascending: false });

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        if (filters.kitType) {
            query = query.eq('lien_kit_id', filters.kitType);
        }
        if (filters.dateFrom) {
            query = query.gte('purchase_date', filters.dateFrom);
        }
        if (filters.dateTo) {
            query = query.lte('purchase_date', filters.dateTo);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Get submission detail with all related data
 */
export async function getSubmissionDetail(submissionId: string) {
    try {
        const { data, error } = await supabase
            .from('user_kits')
            .select(`
        *,
        user:users!user_id (*),
        lien_kit:lien_kits!lien_kit_id (*)
      `)
            .eq('id', submissionId)
            .single();

        if (error) throw error;

        // Get related deadlines
        const { data: deadlines } = await supabase
            .from('deadlines')
            .select('*')
            .eq('user_id', data.user_id)
            .order('due_date', { ascending: true });

        // Get internal notes if table exists
        const { data: notes } = await supabase
            .from('internal_notes')
            .select(`
        *,
        author:auth.users!author_id (
          email,
          raw_user_meta_data
        )
      `)
            .eq('user_kit_id', submissionId)
            .order('created_at', { ascending: false })
            .limit(50);

        return {
            data: {
                ...data,
                deadlines: deadlines || [],
                internal_notes: notes || [],
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching submission detail:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(filters: {
    search?: string;
    activeOnly?: boolean;
    dateFrom?: string;
    dateTo?: string;
} = {}) {
    try {
        let query = supabase
            .from('users')
            .select(`
        *,
        user_kits:user_kits(count)
      `)
            .order('created_at', { ascending: false });

        if (filters.search) {
            query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
        }

        if (filters.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
        }

        if (filters.dateTo) {
            query = query.lte('created_at', filters.dateTo);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Get user detail with activity
 */
export async function getUserDetail(userId: string) {
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // Get user's kits
        const { data: userKits } = await supabase
            .from('user_kits')
            .select(`
        *,
        lien_kit:lien_kits!lien_kit_id (*)
      `)
            .eq('user_id', userId)
            .order('purchase_date', { ascending: false });

        // Get user's deadlines
        const { data: deadlines } = await supabase
            .from('deadlines')
            .select('*')
            .eq('user_id', userId)
            .order('due_date', { ascending: true });

        // Get user's assessments
        const { data: assessments } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return {
            data: {
                ...user,
                user_kits: userKits || [],
                deadlines: deadlines || [],
                assessments: assessments || [],
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching user detail:', error);
        return { data: null, error: error as Error };
    }
}

// =====================================================
// Dashboard Statistics
// =====================================================

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<{
    data: AdminDashboardStats | null;
    error: Error | null;
}> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const [
            totalUsersResult,
            activeUsersResult,
            userKitsResult,
            deadlinesResult,
            dueTodayResult,
            dueThisWeekResult,
        ] = await Promise.all([
            // Total users
            supabase.from('users').select('id', { count: 'exact', head: true }),

            // Active users (signed in within 30 days)
            supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .gte('last_sign_in_at', thirtyDaysAgo.toISOString()),

            // User kits for pending/in review count
            supabase.from('user_kits').select('id, status, purchase_date'),

            // All active deadlines
            supabase
                .from('deadlines')
                .select('id, due_date, status')
                .neq('status', 'completed'),

            // Deadlines due today
            supabase
                .from('deadlines')
                .select('id', { count: 'exact', head: true })
                .gte('due_date', today.toISOString())
                .lt('due_date', tomorrow.toISOString())
                .neq('status', 'completed'),

            // Deadlines due this week
            supabase
                .from('deadlines')
                .select('id', { count: 'exact', head: true })
                .gte('due_date', today.toISOString())
                .lt('due_date', sevenDaysFromNow.toISOString())
                .neq('status', 'completed'),
        ]);

        // Calculate stats
        const userKits = userKitsResult.data || [];
        const deadlines = deadlinesResult.data || [];

        const pendingSubmissions = userKits.filter(
            (k) => k.status === 'pending' || k.status === 'in_progress'
        ).length;

        const inReviewSubmissions = userKits.filter((k) => k.status === 'in_review').length;

        const formsCompletedToday = userKits.filter((k) => {
            const purchaseDate = new Date(k.purchase_date);
            return purchaseDate >= today;
        }).length;

        const overdueDeadlines = deadlines.filter((d) => {
            const dueDate = new Date(d.due_date);
            return dueDate < new Date();
        }).length;

        // Calculate average review time (mock for now)
        const avgReviewTime = 24; // hours

        const stats: AdminDashboardStats = {
            totalUsers: totalUsersResult.count || 0,
            activeUsers: activeUsersResult.count || 0,
            pendingSubmissions,
            inReviewSubmissions,
            overdueDeadlines,
            dueTodayDeadlines: dueTodayResult.count || 0,
            dueThisWeekDeadlines: dueThisWeekResult.count || 0,
            formsCompletedToday,
            avgReviewTime,
        };

        return { data: stats, error: null };
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        return { data: null, error: error as Error };
    }
}

// =====================================================
// Internal Notes
// =====================================================

/**
 * Add internal note to a submission
 */
export async function addInternalNote(
    userKitId: string,
    userId: string,
    authorId: string,
    noteType: 'review' | 'follow_up' | 'issue' | 'resolved',
    content: string,
    isFlagged = false
): Promise<{ data: InternalNote | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('internal_notes')
            .insert({
                user_kit_id: userKitId,
                user_id: userId,
                author_id: authorId,
                note_type: noteType,
                content,
                is_flagged: isFlagged,
            })
            .select()
            .single();

        if (error) throw error;

        // Log admin activity
        await logAdminActivity({
            admin_id: authorId,
            action_type: 'note',
            entity_type: 'user_kit',
            entity_id: userKitId,
            metadata: { note_type: noteType, flagged: isFlagged },
        });

        return { data: data as InternalNote, error: null };
    } catch (error) {
        console.error('Error adding internal note:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Get internal notes for a submission
 */
export async function getInternalNotes(
    userKitId: string
): Promise<{ data: InternalNote[] | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('internal_notes')
            .select(`
        *,
        author:auth.users!author_id (
          email,
          raw_user_meta_data
        )
      `)
            .eq('user_kit_id', userKitId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { data: data as unknown as InternalNote[], error: null };
    } catch (error) {
        console.error('Error fetching internal notes:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Update internal note
 */
export async function updateInternalNote(
    noteId: string,
    updates: { content?: string; is_flagged?: boolean }
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('internal_notes')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', noteId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error('Error updating internal note:', error);
        return { error: error as Error };
    }
}

// =====================================================
// Status Management
// =====================================================

/**
 * Update user kit status
 */
export async function updateUserKitStatus(
    userKitId: string,
    newStatus: string,
    adminId: string,
    notes?: string
): Promise<{ error: Error | null }> {
    try {
        // Get current status
        const { data: userKit } = await supabase
            .from('user_kits')
            .select('status')
            .eq('id', userKitId)
            .single();

        // Update status
        const { error: updateError } = await supabase
            .from('user_kits')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userKitId);

        if (updateError) throw updateError;

        // Log status change
        await supabase.from('status_history').insert({
            user_kit_id: userKitId,
            old_status: userKit?.status,
            new_status: newStatus,
            changed_by: adminId,
            notes,
        });

        // Log admin activity
        await logAdminActivity({
            admin_id: adminId,
            action_type: 'update',
            entity_type: 'user_kit',
            entity_id: userKitId,
            metadata: { status: newStatus, notes },
        });

        return { error: null };
    } catch (error) {
        console.error('Error updating user kit status:', error);
        return { error: error as Error };
    }
}

// =====================================================
// Activity Logging
// =====================================================

/**
 * Log admin activity
 */
export async function logAdminActivity(activity: {
    admin_id: string;
    action_type: string;
    entity_type: string;
    entity_id: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        await supabase.from('admin_activity_log').insert(activity);
    } catch (error) {
        console.error('Error logging admin activity:', error);
    }
}

/**
 * Get admin activity log
 */
export async function getAdminActivityLog(filters: {
    adminId?: string;
    entityType?: string;
    entityId?: string;
    actionType?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
} = {}) {
    try {
        let query = supabase
            .from('admin_activity_log')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.adminId) query = query.eq('admin_id', filters.adminId);
        if (filters.entityType) query = query.eq('entity_type', filters.entityType);
        if (filters.entityId) query = query.eq('entity_id', filters.entityId);
        if (filters.actionType) query = query.eq('action_type', filters.actionType);
        if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
        if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
        if (filters.limit) query = query.limit(filters.limit);

        const { data, error } = await query;

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Error fetching admin activity log:', error);
        return { data: null, error: error as Error };
    }
}

// =====================================================
// Deadline Monitoring
// =====================================================

/**
 * Get all deadlines for admin monitoring
 */
export async function getAllDeadlinesForAdmin(filters: {
    status?: string;
    severity?: string;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    overdueOnly?: boolean;
} = {}) {
    try {
        let query = supabase
            .from('deadlines')
            .select(`
        *,
        user:users!user_id (
          id,
          email,
          full_name
        )
      `)
            .order('due_date', { ascending: true });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.severity) query = query.eq('severity', filters.severity);
        if (filters.userId) query = query.eq('user_id', filters.userId);
        if (filters.dateFrom) query = query.gte('due_date', filters.dateFrom);
        if (filters.dateTo) query = query.lte('due_date', filters.dateTo);
        if (filters.overdueOnly) {
            query = query.lt('due_date', new Date().toISOString()).neq('status', 'completed');
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Error fetching deadlines for admin:', error);
        return { data: null, error: error as Error };
    }
}

// =====================================================
// Search
// =====================================================

/**
 * Global admin search
 */
export async function adminGlobalSearch(searchTerm: string) {
    try {
        const [usersResult, kitsResult, deadlinesResult] = await Promise.all([
            // Search users
            supabase
                .from('users')
                .select('id, email, full_name, created_at')
                .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
                .limit(10),

            // Search user kits
            supabase
                .from('user_kits')
                .select(`
          id,
          user_id,
          purchase_date,
          status,
          lien_kit:lien_kits!lien_kit_id (name),
          user:users!user_id (email, full_name)
        `)
                .limit(10),

            // Search deadlines
            supabase
                .from('deadlines')
                .select(`
          id,
          title,
          due_date,
          status,
          user:users!user_id (email, full_name)
        `)
                .ilike('title', `%${searchTerm}%`)
                .limit(10),
        ]);

        return {
            data: {
                users: usersResult.data || [],
                submissions: kitsResult.data || [],
                deadlines: deadlinesResult.data || [],
            },
            error: null,
        };
    } catch (error) {
        console.error('Error performing global search:', error);
        return { data: null, error: error as Error };
    }
}

// =====================================================
// Export all functions as a service object
// =====================================================

export const adminQueriesService = {
    // Dashboard
    getAdminDashboardStats,

    // Submissions
    getAllSubmissions,
    getSubmissionDetail,
    updateUserKitStatus,

    // Users
    getAllUsers,
    getUserDetail,

    // Deadlines
    getAllDeadlines: getAllDeadlinesForAdmin,

    // Internal Notes
    getInternalNotes,
    addInternalNote,
    updateInternalNote,

    // Activity Log
    logAdminActivity,
    getAdminActivityLog,

    // Search
    globalSearch: adminGlobalSearch,
};

export default adminQueriesService;
