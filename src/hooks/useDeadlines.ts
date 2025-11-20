import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssessmentData, ProjectData } from '@/lib/deadlineCalculator';
import {
    createProjectDeadlines,
    updateProjectDeadlines,
    fetchDeadlinesByProject,
    fetchDeadlinesByUser,
    updateDeadlineStatus,
    deleteDeadline,
    getDashboardStats,
    getDeadlinesNeedingReminders,
} from '@/services/deadlinesService';

// =====================================================
// Fetch Hooks
// =====================================================

/**
 * Hook to fetch all deadlines for the current user
 */
export function useUserDeadlines(userId: string | undefined) {
    return useQuery({
        queryKey: ['deadlines', 'user', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');
            const { data, error } = await fetchDeadlinesByUser(userId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch deadlines for a specific project
 */
export function useProjectDeadlines(projectId: string | undefined) {
    return useQuery({
        queryKey: ['deadlines', 'project', projectId],
        queryFn: async () => {
            if (!projectId) throw new Error('Project ID required');
            const { data, error } = await fetchDeadlinesByProject(projectId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook to get dashboard statistics including deadline counts
 */
export function useDeadlineStats(userId: string | undefined) {
    return useQuery({
        queryKey: ['deadlines', 'stats', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');
            const { data, error } = await getDashboardStats(userId);
            if (error) throw error;
            return data;
        },
        enabled: !!userId,
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}

/**
 * Hook to get deadlines that need reminders
 */
export function useDeadlinesNeedingReminders(userId: string | undefined, daysAhead = 7) {
    return useQuery({
        queryKey: ['deadlines', 'reminders', userId, daysAhead],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');
            const { data, error } = await getDeadlinesNeedingReminders(userId, daysAhead);
            if (error) throw error;
            return data || [];
        },
        enabled: !!userId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

// =====================================================
// Mutation Hooks
// =====================================================

/**
 * Hook to create deadlines for a project
 */
export function useCreateDeadlines() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            assessmentData,
            projectData,
            userId,
        }: {
            assessmentData: AssessmentData;
            projectData: ProjectData;
            userId: string;
        }) => {
            const { data, error } = await createProjectDeadlines(assessmentData, projectData, userId);
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            // Invalidate relevant queries to refetch
            queryClient.invalidateQueries({ queryKey: ['deadlines', 'user', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['deadlines', 'project', variables.projectData.projectId] });
            queryClient.invalidateQueries({ queryKey: ['deadlines', 'stats', variables.userId] });
        },
    });
}

/**
 * Hook to update deadlines when project data changes
 */
export function useUpdateDeadlines() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            projectId,
            userId,
            assessmentData,
            projectData,
        }: {
            projectId: string;
            userId: string;
            assessmentData: AssessmentData;
            projectData: ProjectData;
        }) => {
            const { data, error } = await updateProjectDeadlines(projectId, userId, assessmentData, projectData);
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deadlines', 'user', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['deadlines', 'project', variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ['deadlines', 'stats', variables.userId] });
        },
    });
}

/**
 * Hook to update a deadline's status
 */
export function useUpdateDeadlineStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            deadlineId,
            status,
            userId: _userId,
            projectId: _projectId,
        }: {
            deadlineId: string;
            status: 'pending' | 'completed' | 'overdue' | 'upcoming' | 'due_soon';
            userId?: string;
            projectId?: string;
        }) => {
            const { error } = await updateDeadlineStatus(deadlineId, status);
            if (error) throw error;
            return { deadlineId, status };
        },
        onSuccess: (_, variables) => {
            // Invalidate queries based on what we have
            if (variables.userId) {
                queryClient.invalidateQueries({ queryKey: ['deadlines', 'user', variables.userId] });
                queryClient.invalidateQueries({ queryKey: ['deadlines', 'stats', variables.userId] });
            }
            if (variables.projectId) {
                queryClient.invalidateQueries({ queryKey: ['deadlines', 'project', variables.projectId] });
            }
        },
    });
}

/**
 * Hook to delete a deadline
 */
export function useDeleteDeadline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            deadlineId,
            userId: _userId,
            projectId: _projectId,
        }: {
            deadlineId: string;
            userId?: string;
            projectId?: string;
        }) => {
            const { error } = await deleteDeadline(deadlineId);
            if (error) throw error;
            return { deadlineId };
        },
        onSuccess: (_, variables) => {
            if (variables.userId) {
                queryClient.invalidateQueries({ queryKey: ['deadlines', 'user', variables.userId] });
                queryClient.invalidateQueries({ queryKey: ['deadlines', 'stats', variables.userId] });
            }
            if (variables.projectId) {
                queryClient.invalidateQueries({ queryKey: ['deadlines', 'project', variables.projectId] });
            }
        },
    });
}

// =====================================================
// Helper Hooks
// =====================================================

/**
 * Hook to get upcoming deadlines (within next 30 days)
 */
export function useUpcomingDeadlines(userId: string | undefined, daysAhead = 30) {
    const { data: allDeadlines, ...query } = useUserDeadlines(userId);

    const upcomingDeadlines = allDeadlines?.filter((deadline) => {
        if (deadline.status === 'completed') return false;
        const dueDate = new Date(deadline.dueDate);
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);
        return dueDate >= today && dueDate <= futureDate;
    }) || [];

    return {
        ...query,
        data: upcomingDeadlines,
    };
}

/**
 * Hook to get overdue deadlines
 */
export function useOverdueDeadlines(userId: string | undefined) {
    const { data: allDeadlines, ...query } = useUserDeadlines(userId);

    const overdueDeadlines = allDeadlines?.filter((deadline) => {
        if (deadline.status === 'completed') return false;
        const dueDate = new Date(deadline.dueDate);
        const today = new Date();
        return dueDate < today;
    }) || [];

    return {
        ...query,
        data: overdueDeadlines,
    };
}

/**
 * Hook to get critical deadlines
 */
export function useCriticalDeadlines(userId: string | undefined) {
    const { data: allDeadlines, ...query } = useUserDeadlines(userId);

    const criticalDeadlines = allDeadlines?.filter((deadline) => {
        return deadline.status !== 'completed' && deadline.severity === 'critical';
    }) || [];

    return {
        ...query,
        data: criticalDeadlines,
    };
}
