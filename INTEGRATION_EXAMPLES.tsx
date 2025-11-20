// =====================================================
// Example: Integrating Deadlines into Dashboard
// This shows how to use the deadline system in your existing dashboard
// =====================================================

import { DeadlinesList } from '@/components/deadlines/DeadlinesList';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDeadlinesByUser, getDashboardStats } from '@/services/deadlinesService';
import { addDays, isPast } from 'date-fns';

/**
 * EXAMPLE 1: Full Dashboard Page with Deadlines
 */
export function DashboardWithDeadlines() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch all user deadlines
    const { data: allDeadlines, isLoading } = useQuery({
        queryKey: ['deadlines', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await fetchDeadlinesByUser(user.id);
            return data || [];
        },
        enabled: !!user?.id,
    });

    // Fetch dashboard statistics
    const { data: stats } = useQuery({
        queryKey: ['deadline-stats', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data } = await getDashboardStats(user.id);
            return data;
        },
        enabled: !!user?.id,
    });

    // Calculate urgent deadlines (overdue or due within 7 days)
    const urgentDeadlines = allDeadlines?.filter((d) => {
        if (d.status === 'completed') return false;
        const dueDate = new Date(d.dueDate);
        const sevenDaysFromNow = addDays(new Date(), 7);
        return isPast(dueDate) || dueDate <= sevenDaysFromNow;
    }) || [];

    // Calculate upcoming deadlines (next 30 days, excluding urgent)
    const upcomingDeadlines = allDeadlines?.filter((d) => {
        if (d.status === 'completed') return false;
        const dueDate = new Date(d.dueDate);
        const today = new Date();
        const thirtyDaysFromNow = addDays(today, 30);
        const sevenDaysFromNow = addDays(today, 7);
        return dueDate > sevenDaysFromNow && dueDate <= thirtyDaysFromNow;
    }) || [];

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-600 mt-1">Track your deadlines and stay compliant</p>
                    </div>
                    <Button onClick={() => navigate('/assessment')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                {/* Urgent Alert */}
                {urgentDeadlines.length > 0 && (
                    <Alert variant="danger">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            You have <strong>{urgentDeadlines.length}</strong> urgent deadline
                            {urgentDeadlines.length > 1 ? 's' : ''} that need immediate attention!
                        </AlertDescription>
                    </Alert>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Deadlines"
                        value={stats?.total || 0}
                        color="blue"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Overdue"
                        value={stats?.overdue || 0}
                        color="danger"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Upcoming"
                        value={stats?.upcoming || 0}
                        color="warning"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Completed"
                        value={stats?.completed || 0}
                        color="success"
                        isLoading={isLoading}
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - All Deadlines */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">All Deadlines</h2>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg"></div>
                                ))}
                            </div>
                        ) : (
                            <DeadlinesList
                                deadlines={allDeadlines || []}
                                showFilters={true}
                                onDeadlineClick={(deadline) => {
                                    console.log('Deadline clicked:', deadline);
                                    // Navigate to deadline detail page
                                    // navigate(`/deadlines/${deadline.id}`);
                                }}
                            />
                        )}
                    </div>

                    {/* Right Column - Quick Views */}
                    <div className="space-y-6">
                        {/* Urgent Deadlines Widget */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    🚨 Urgent Deadlines
                                </h3>
                                {urgentDeadlines.length > 0 ? (
                                    <DeadlinesList
                                        deadlines={urgentDeadlines}
                                        showFilters={false}
                                        maxItems={5}
                                        compact={true}
                                    />
                                ) : (
                                    <p className="text-slate-500 text-sm">No urgent deadlines</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Deadlines Widget */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    📅 Next 30 Days
                                </h3>
                                {upcomingDeadlines.length > 0 ? (
                                    <DeadlinesList
                                        deadlines={upcomingDeadlines}
                                        showFilters={false}
                                        maxItems={5}
                                        compact={true}
                                    />
                                ) : (
                                    <p className="text-slate-500 text-sm">No upcoming deadlines</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

/**
 * EXAMPLE 2: Adding Deadlines to Existing Dashboard Component
 * Shows minimal changes to integrate into EnhancedDashboardPageV2.tsx
 */
export function ExistingDashboardIntegration() {
    const { user } = useAuth();

    // Add this query to fetch deadlines
    const { data: deadlines } = useQuery({
        queryKey: ['deadlines', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await fetchDeadlinesByUser(user.id);
            return data || [];
        },
        enabled: !!user?.id,
    });

    const upcomingDeadlines = deadlines?.filter((d) => {
        if (d.status === 'completed') return false;
        const dueDate = new Date(d.dueDate);
        const thirtyDays = addDays(new Date(), 30);
        return dueDate <= thirtyDays;
    }) || [];

    return (
        <div>
            {/* ...your existing dashboard code... */}

            {/* Add this section where you want deadlines to appear */}
            <section className="mt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Deadlines</h2>
                <DeadlinesList
                    deadlines={upcomingDeadlines}
                    showFilters={true}
                    onDeadlineClick={(deadline) => {
                        console.log('Navigate to:', deadline.id);
                    }}
                />
            </section>
        </div>
    );
}

/**
 * EXAMPLE 3: Sidebar Widget - Compact Deadline View
 * Perfect for a sidebar or top banner
 */
export function DeadlinesSidebarWidget() {
    const { user } = useAuth();

    const { data: deadlines } = useQuery({
        queryKey: ['urgent-deadlines', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await fetchDeadlinesByUser(user.id);

            // Get only urgent deadlines (next 7 days or overdue)
            return data?.filter((d) => {
                if (d.status === 'completed') return false;
                const dueDate = new Date(d.dueDate);
                const sevenDays = addDays(new Date(), 7);
                return isPast(dueDate) || dueDate <= sevenDays;
            }).slice(0, 3) || []; // Limit to 3 most urgent
        },
        enabled: !!user?.id,
    });

    if (!deadlines || deadlines.length === 0) {
        return null; // Don't show widget if no urgent deadlines
    }

    return (
        <Card className="bg-warning-50 border-warning-200">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-warning-600" />
                    <h4 className="font-semibold text-slate-900">Action Needed</h4>
                </div>
                <DeadlinesList
                    deadlines={deadlines}
                    showFilters={false}
                    compact={true}
                />
            </CardContent>
        </Card>
    );
}

/**
 * EXAMPLE 4: Project Detail Page with Deadlines
 * Show deadlines specific to a single project
 */
export function ProjectDetailWithDeadlines({ projectId }: { projectId: string }) {
    const { user } = useAuth();

    const { data: projectDeadlines } = useQuery({
        queryKey: ['deadlines', 'project', projectId],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data } = await fetchDeadlinesByUser(user.id);
            return data?.filter((d) => d.projectId === projectId) || [];
        },
        enabled: !!user?.id,
    });

    return (
        <div>
            {/* ...project details... */}

            <section className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Project Deadlines</h3>
                <DeadlinesList
                    deadlines={projectDeadlines || []}
                    showFilters={true}
                />
            </section>
        </div>
    );
}

/**
 * EXAMPLE 5: Creating Deadlines After Assessment
 * Call this after user completes the assessment
 */
export async function handleAssessmentComplete(
    assessmentData: any,
    projectData: any,
    userId: string
) {
    // Import the service
    const { createProjectDeadlines } = await import('@/services/deadlinesService');

    try {
        // Create deadlines based on assessment
        const { data: deadlines, error } = await createProjectDeadlines(
            assessmentData,
            projectData,
            userId
        );

        if (error) {
            console.error('Error creating deadlines:', error);
            // Show error to user
            return { success: false, error };
        }

        console.log(`✅ Created ${deadlines?.length || 0} deadlines for project`);

        // Show success message to user
        // You might want to show a modal or notification here
        return { success: true, deadlines };
    } catch (error) {
        console.error('Failed to create deadlines:', error);
        return { success: false, error };
    }
}

/**
 * EXAMPLE 6: Updating Project and Recalculating Deadlines
 * Call when user updates project dates or information
 */
export async function handleProjectUpdate(
    projectId: string,
    userId: string,
    updatedAssessmentData: any,
    updatedProjectData: any
) {
    const { updateProjectDeadlines } = await import('@/services/deadlinesService');

    try {
        const { data: deadlines, error } = await updateProjectDeadlines(
            projectId,
            userId,
            updatedAssessmentData,
            updatedProjectData
        );

        if (error) throw error;

        console.log(`✅ Updated deadlines for project ${projectId}`);
        return { success: true, deadlines };
    } catch (error) {
        console.error('Failed to update deadlines:', error);
        return { success: false, error };
    }
}

// =====================================================
// Helper Component: Stat Card
// =====================================================

interface StatCardProps {
    title: string;
    value: number;
    color: 'blue' | 'danger' | 'warning' | 'success';
    isLoading?: boolean;
}

function StatCard({ title, value, color, isLoading }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        danger: 'bg-danger-100 text-danger-600',
        warning: 'bg-warning-100 text-warning-600',
        success: 'bg-success-100 text-success-600',
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
            </CardContent>
        </Card>
    );
}

/**
 * USAGE NOTES:
 * 
 * 1. Import the DeadlinesList component wherever you need to display deadlines
 * 2. Use React Query to fetch deadlines from the service
 * 3. Pass the deadlines to the DeadlinesList component
 * 4. Customize with props: showFilters, maxItems, compact, onDeadlineClick
 * 
 * 5. When a user completes an assessment:
 *    - Call createProjectDeadlines() with assessment and project data
 *    - This will calculate and store all relevant deadlines
 * 
 * 6. When a user updates project information:
 *    - Call updateProjectDeadlines() to recalculate deadlines
 *    - Old deadlines are deleted, new ones created
 * 
 * 7. The DeadlinesList component handles:
 *    - Filtering (all, overdue, urgent, upcoming, completed)
 *    - Sorting (by date, severity, status)
 *    - Visual highlighting (overdue = red, urgent = orange, etc.)
 *    - Expandable details with action items
 * 
 * 8. Notification system (notificationService.ts):
 *    - Currently an outline/framework
 *    - Implement by choosing an email provider (SendGrid, Resend, etc.)
 *    - Set up a cron job to run processDeadlineReminders() daily
 *    - See DEADLINE_SYSTEM_IMPLEMENTATION.md for full guide
 */
