// =====================================================
// React Query Hook for Dashboard
// =====================================================

import { useQuery } from '@tanstack/react-query'
import {
    getUserDashboardData,
    getDashboardStats,
    getRecentActivity,
} from '@/services/dashboardService'
import { useAuth } from '@/contexts/AuthContext'

// Query keys
export const dashboardKeys = {
    all: ['dashboard'] as const,
    data: (userId: string) => [...dashboardKeys.all, 'data', userId] as const,
    stats: (userId: string) => [...dashboardKeys.all, 'stats', userId] as const,
    activity: (userId: string, limit: number) => [...dashboardKeys.all, 'activity', userId, limit] as const,
}

/**
 * Hook to fetch comprehensive dashboard data
 */
export function useDashboard() {
    const { user } = useAuth()

    return useQuery({
        queryKey: dashboardKeys.data(user?.id || ''),
        queryFn: () => getUserDashboardData(user!.id),
        enabled: !!user?.id,
        staleTime: 1 * 60 * 1000, // 1 minute
    })
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
    const { user } = useAuth()

    return useQuery({
        queryKey: dashboardKeys.stats(user?.id || ''),
        queryFn: () => getDashboardStats(user!.id),
        enabled: !!user?.id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to fetch recent activity
 */
export function useRecentActivity(limit: number = 10) {
    const { user } = useAuth()

    return useQuery({
        queryKey: dashboardKeys.activity(user?.id || '', limit),
        queryFn: () => getRecentActivity(user!.id, limit),
        enabled: !!user?.id,
        staleTime: 1 * 60 * 1000, // 1 minute
    })
}
