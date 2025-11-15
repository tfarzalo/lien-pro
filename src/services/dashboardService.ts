// =====================================================
// Dashboard Service
// Aggregated data access for user dashboard
// =====================================================

import { supabase } from '@/lib/supabaseClient'
import type {
    DashboardData,
    Project,
    Deadline,
    UserKitWithKit,
    OrderWithItems,
    Assessment,
    Profile,
} from '@/types/database'

/**
 * Get comprehensive dashboard data for a user
 */
export async function getUserDashboardData(userId: string): Promise<DashboardData> {
    try {
        // Fetch all data in parallel
        const [
            profileResult,
            projectsResult,
            deadlinesResult,
            kitsResult,
            ordersResult,
            assessmentsResult,
        ] = await Promise.allSettled([
            // User profile
            supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single(),

            // Active projects
            supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['draft', 'active', 'lien_filed'])
                .order('updated_at', { ascending: false })
                .limit(10),

            // Upcoming deadlines (next 30 days)
            supabase
                .from('deadlines')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'pending')
                .gte('due_date', new Date().toISOString().split('T')[0])
                .lte('due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .order('due_date', { ascending: true })
                .limit(5),

            // Owned kits
            supabase
                .from('user_kits')
                .select(`
          *,
          lien_kit:lien_kits(*)
        `)
                .eq('user_id', userId)
                .eq('is_active', true),

            // Recent orders
            supabase
                .from('orders')
                .select(`
          *,
          order_items(
            *,
            lien_kit:lien_kits(*)
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5),

            // Recent assessments
            supabase
                .from('assessments')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5),
        ])

        // Extract data or use defaults
        const user = profileResult.status === 'fulfilled' && profileResult.value.data
            ? profileResult.value.data as Profile
            : null

        const activeProjects = projectsResult.status === 'fulfilled' && projectsResult.value.data
            ? projectsResult.value.data as Project[]
            : []

        const upcomingDeadlines = deadlinesResult.status === 'fulfilled' && deadlinesResult.value.data
            ? deadlinesResult.value.data as Deadline[]
            : []

        const ownedKits = kitsResult.status === 'fulfilled' && kitsResult.value.data
            ? kitsResult.value.data as UserKitWithKit[]
            : []

        const recentOrders = ordersResult.status === 'fulfilled' && ordersResult.value.data
            ? ordersResult.value.data as OrderWithItems[]
            : []

        const assessments = assessmentsResult.status === 'fulfilled' && assessmentsResult.value.data
            ? assessmentsResult.value.data as Assessment[]
            : []

        if (!user) {
            throw new Error('User profile not found')
        }

        return {
            user,
            activeProjects,
            upcomingDeadlines,
            ownedKits,
            recentOrders,
            assessments,
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        throw error
    }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<{
    totalProjects: number
    activeProjects: number
    upcomingDeadlines: number
    ownedKits: number
    completedAssessments: number
}> {
    const [
        projectsResult,
        deadlinesResult,
        kitsResult,
        assessmentsResult,
    ] = await Promise.allSettled([
        supabase
            .from('projects')
            .select('id, status', { count: 'exact', head: true })
            .eq('user_id', userId),

        supabase
            .from('deadlines')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'pending')
            .gte('due_date', new Date().toISOString().split('T')[0]),

        supabase
            .from('user_kits')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true),

        supabase
            .from('assessments')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed'),
    ])

    return {
        totalProjects: projectsResult.status === 'fulfilled' ? (projectsResult.value.count || 0) : 0,
        activeProjects: projectsResult.status === 'fulfilled' ? (projectsResult.value.count || 0) : 0,
        upcomingDeadlines: deadlinesResult.status === 'fulfilled' ? (deadlinesResult.value.count || 0) : 0,
        ownedKits: kitsResult.status === 'fulfilled' ? (kitsResult.value.count || 0) : 0,
        completedAssessments: assessmentsResult.status === 'fulfilled' ? (assessmentsResult.value.count || 0) : 0,
    }
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(userId: string, limit: number = 10) {
    // This would combine various activities into a timeline
    // For now, we'll just return recent projects and deadlines
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

    const { data: deadlines, error: deadlinesError } = await supabase
        .from('deadlines')
        .select('id, title, due_date, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (projectsError || deadlinesError) {
        throw new Error('Error fetching activity')
    }

    // Combine and sort by date
    const activities = [
        ...(projects || []).map(p => ({
            type: 'project' as const,
            id: p.id,
            title: p.name,
            date: p.updated_at,
            status: p.status,
        })),
        ...(deadlines || []).map(d => ({
            type: 'deadline' as const,
            id: d.id,
            title: d.title,
            date: d.created_at,
            status: d.status,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)

    return activities
}
