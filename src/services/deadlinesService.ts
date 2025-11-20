import { supabase } from '@/lib/supabaseClient';
import {
    calculateDeadlines,
    recalculateDeadlines,
    Deadline,
    ProjectData,
    AssessmentData,
} from '@/lib/deadlineCalculator';

// =====================================================
// Deadline Service
// Handles all deadline-related database operations
// =====================================================

/**
 * Creates and stores deadlines for a project
 */
export async function createProjectDeadlines(
    assessmentData: AssessmentData,
    projectData: ProjectData,
    userId: string
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    try {
        // Calculate deadlines
        const deadlines = calculateDeadlines(assessmentData, projectData, userId);

        if (deadlines.length === 0) {
            return { data: [], error: null };
        }

        // Prepare for database insert
        const deadlinesForDb = deadlines.map(deadline => ({
            project_id: deadline.projectId,
            user_id: deadline.userId,
            type: deadline.type,
            title: deadline.title,
            description: deadline.description,
            due_date: deadline.dueDate,
            severity: deadline.severity,
            status: deadline.status,
            is_optional: deadline.isOptional,
            legal_reference: deadline.legalReference,
            action_items: deadline.actionItems,
        }));

        // Insert into database
        const { data, error } = await supabase
            .from('deadlines')
            .insert(deadlinesForDb)
            .select();

        if (error) throw error;

        return { data: data as unknown as Deadline[], error: null };
    } catch (error) {
        console.error('Error creating project deadlines:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Updates deadlines when project data changes
 */
export async function updateProjectDeadlines(
    projectId: string,
    userId: string,
    assessmentData: AssessmentData,
    projectData: ProjectData
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    try {
        // Get existing deadlines
        const { data: existingDeadlines, error: fetchError } = await supabase
            .from('deadlines')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (fetchError) throw fetchError;

        // Recalculate with preserved completion status
        const updatedDeadlines = recalculateDeadlines(
            existingDeadlines as unknown as Deadline[],
            assessmentData,
            projectData,
            userId
        );

        // Delete old deadlines
        const { error: deleteError } = await supabase
            .from('deadlines')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Insert new deadlines
        const deadlinesForDb = updatedDeadlines.map(deadline => ({
            project_id: deadline.projectId,
            user_id: deadline.userId,
            type: deadline.type,
            title: deadline.title,
            description: deadline.description,
            due_date: deadline.dueDate,
            severity: deadline.severity,
            status: deadline.status,
            is_optional: deadline.isOptional,
            legal_reference: deadline.legalReference,
            action_items: deadline.actionItems,
        }));

        const { data, error } = await supabase
            .from('deadlines')
            .insert(deadlinesForDb)
            .select();

        if (error) throw error;

        return { data: data as unknown as Deadline[], error: null };
    } catch (error) {
        console.error('Error updating project deadlines:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Gets all deadlines for a user
 */
export async function getUserDeadlines(
    userId: string
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('deadlines')
            .select(`
        *,
        projects (
          project_name,
          property_address
        )
      `)
            .eq('user_id', userId)
            .order('due_date', { ascending: true });

        if (error) throw error;

        return { data: data as unknown as Deadline[], error: null };
    } catch (error) {
        console.error('Error fetching user deadlines:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Gets deadlines for a specific project
 */
export async function getProjectDeadlines(
    projectId: string,
    userId: string
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('deadlines')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .order('due_date', { ascending: true });

        if (error) throw error;

        return { data: data as unknown as Deadline[], error: null };
    } catch (error) {
        console.error('Error fetching project deadlines:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Gets upcoming deadlines (within specified days)
 */
export async function getUpcomingDeadlines(
    userId: string,
    daysAhead: number = 30
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);

        const { data, error } = await supabase
            .from('deadlines')
            .select(`
        *,
        projects (
          project_name,
          property_address
        )
      `)
            .eq('user_id', userId)
            .gte('due_date', today.toISOString())
            .lte('due_date', futureDate.toISOString())
            .neq('status', 'completed')
            .order('due_date', { ascending: true });

        if (error) throw error;

        return { data: data as unknown as Deadline[], error: null };
    } catch (error) {
        console.error('Error fetching upcoming deadlines:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Gets overdue deadlines
 */
export async function getOverdueDeadlines(
    userId: string
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    try {
        const today = new Date();

        const { data, error } = await supabase
            .from('deadlines')
            .select(`
        *,
        projects (
          project_name,
          property_address
        )
      `)
            .eq('user_id', userId)
            .lt('due_date', today.toISOString())
            .neq('status', 'completed')
            .order('due_date', { ascending: true });

        if (error) throw error;

        return { data: data as unknown as Deadline[], error: null };
    } catch (error) {
        console.error('Error fetching overdue deadlines:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Marks a deadline as completed
 */
export async function markDeadlineCompleted(
    deadlineId: string,
    userId: string
): Promise<{ data: Deadline | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('deadlines')
            .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', deadlineId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return { data: data as unknown as Deadline, error: null };
    } catch (error) {
        console.error('Error marking deadline completed:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Deletes deadlines for a project
 */
export async function deleteProjectDeadlines(
    projectId: string,
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('deadlines')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error('Error deleting project deadlines:', error);
        return { error: error as Error };
    }
}

/**
 * Gets deadline statistics for dashboard
 */
export async function getDeadlineStats(
    userId: string
): Promise<{
    data: {
        total: number;
        upcoming: number;
        dueSoon: number;
        overdue: number;
        completed: number;
    } | null;
    error: Error | null;
}> {
    try {
        const { data, error } = await supabase
            .from('deadlines')
            .select('status, due_date')
            .eq('user_id', userId);

        if (error) throw error;

        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const stats = {
            total: data.length,
            upcoming: 0,
            dueSoon: 0,
            overdue: 0,
            completed: 0,
        };

        data.forEach((deadline: any) => {
            if (deadline.status === 'completed') {
                stats.completed++;
            } else {
                const dueDate = new Date(deadline.due_date);
                if (dueDate < today) {
                    stats.overdue++;
                } else if (dueDate <= sevenDaysFromNow) {
                    stats.dueSoon++;
                } else {
                    stats.upcoming++;
                }
            }
        });

        return { data: stats, error: null };
    } catch (error) {
        console.error('Error fetching deadline stats:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Updates deadline status based on current date (batch operation)
 */
export async function updateDeadlineStatuses(
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const { data: deadlines, error: fetchError } = await supabase
            .from('deadlines')
            .select('id, due_date, status')
            .eq('user_id', userId)
            .neq('status', 'completed');

        if (fetchError) throw fetchError;

        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        // Update statuses
        const updates = deadlines.map((deadline: any) => {
            const dueDate = new Date(deadline.due_date);
            let newStatus: Deadline['status'] = 'upcoming';

            if (dueDate < today) {
                newStatus = 'overdue';
            } else if (dueDate <= sevenDaysFromNow) {
                newStatus = 'due_soon';
            }

            return supabase
                .from('deadlines')
                .update({ status: newStatus })
                .eq('id', deadline.id);
        });

        await Promise.all(updates);

        return { error: null };
    } catch (error) {
        console.error('Error updating deadline statuses:', error);
        return { error: error as Error };
    }
}

/**
 * Fetches deadlines by project ID
 */
export async function fetchDeadlinesByProject(
    projectId: string
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    return getProjectDeadlines(projectId, ''); // Note: might need userId too
}

/**
 * Fetches deadlines by user ID
 */
export async function fetchDeadlinesByUser(
    userId: string
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    return getUserDeadlines(userId);
}

/**
 * Updates a single deadline's status
 */
export async function updateDeadlineStatus(
    deadlineId: string,
    status: 'pending' | 'completed' | 'overdue' | 'upcoming' | 'due_soon'
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('deadlines')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', deadlineId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error updating deadline status:', error);
        return { error: error as Error };
    }
}

/**
 * Deletes a deadline
 */
export async function deleteDeadline(
    deadlineId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('deadlines')
            .delete()
            .eq('id', deadlineId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting deadline:', error);
        return { error: error as Error };
    }
}

/**
 * Gets dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<{
    data: {
        total: number;
        completed: number;
        overdue: number;
        upcoming: number;
        critical: number;
    } | null;
    error: Error | null;
}> {
    try {
        const { data: allDeadlines, error } = await fetchDeadlinesByUser(userId);
        if (error) throw error;

        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        const stats = {
            total: allDeadlines?.length || 0,
            completed: allDeadlines?.filter((d) => d.status === 'completed').length || 0,
            overdue:
                allDeadlines?.filter(
                    (d) => d.status !== 'completed' && new Date(d.dueDate) < today
                ).length || 0,
            upcoming:
                allDeadlines?.filter(
                    (d) =>
                        d.status !== 'completed' &&
                        new Date(d.dueDate) >= today &&
                        new Date(d.dueDate) <= next30Days
                ).length || 0,
            critical:
                allDeadlines?.filter((d) => d.status !== 'completed' && d.severity === 'critical')
                    .length || 0,
        };

        return { data: stats, error: null };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Gets deadlines that need reminders (upcoming within X days and not completed)
 */
export async function getDeadlinesNeedingReminders(
    userId: string,
    daysAhead: number = 7
): Promise<{ data: Deadline[] | null; error: Error | null }> {
    try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);

        const { data, error } = await supabase
            .from('deadlines')
            .select(`
        *,
        projects (
          project_name,
          property_address
        )
      `)
            .eq('user_id', userId)
            .gte('due_date', today.toISOString())
            .lte('due_date', futureDate.toISOString())
            .neq('status', 'completed')
            .order('due_date', { ascending: true });

        if (error) throw error;

        return { data: data as unknown as Deadline[], error: null };
    } catch (error) {
        console.error('Error fetching deadlines needing reminders:', error);
        return { data: null, error: error as Error };
    }
}
