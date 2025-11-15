// =====================================================
// Enhanced Dashboard Page with React Query Hooks
// =====================================================

import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { KitCard, DeadlineCard } from '@/components/ui/SpecializedCards'
import { Badge } from '@/components/ui/Badge'
import {
    useDashboard,
    useDashboardStats,
    useRecentActivity,
} from '@/hooks/useDashboard'
import {
    PlusCircle,
    Package,
    Bell,
    FileText,
    TrendingUp,
    Calendar,
    AlertCircle,
    CheckCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function EnhancedDashboardPage() {
    const navigate = useNavigate()

    // Fetch dashboard data
    const { data: dashboardData, isLoading, error } = useDashboard()
    const { data: stats } = useDashboardStats()
    const { data: recentActivity } = useRecentActivity(5)

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            </AppShell>
        )
    }

    if (error) {
        return (
            <AppShell>
                <div className="p-6">
                    <Alert variant="danger">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Dashboard</AlertTitle>
                        <AlertDescription>
                            {error instanceof Error ? error.message : 'Failed to load dashboard data'}
                        </AlertDescription>
                    </Alert>
                </div>
            </AppShell>
        )
    }

    const { user, activeProjects, upcomingDeadlines, ownedKits, recentOrders } =
        dashboardData || {}

    return (
        <AppShell>
            <div className="min-h-screen bg-slate-50">
                {/* Page Header */}
                <PageHeader
                    title={`Welcome back, ${user?.full_name || 'User'}!`}
                    subtitle="Manage your construction lien projects and deadlines"
                    actions={
                        <Button onClick={() => navigate('/assessment')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Start New Assessment
                        </Button>
                    }
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Active Projects"
                            value={stats?.activeProjects || 0}
                            icon={FileText}
                            trend="+12%"
                            trendUp={true}
                        />
                        <StatCard
                            title="Upcoming Deadlines"
                            value={stats?.upcomingDeadlines || 0}
                            icon={Calendar}
                            trend="Next 30 days"
                            trendUp={false}
                        />
                        <StatCard
                            title="Owned Kits"
                            value={stats?.ownedKits || 0}
                            icon={Package}
                            trend="All active"
                            trendUp={true}
                        />
                        <StatCard
                            title="Completed Assessments"
                            value={stats?.completedAssessments || 0}
                            icon={CheckCircle}
                            trend="+2 this month"
                            trendUp={true}
                        />
                    </div>

                    {/* Critical Deadlines Alert */}
                    {upcomingDeadlines && upcomingDeadlines.length > 0 && (
                        <Alert className="border-warning-200 bg-warning-50">
                            <Bell className="h-4 w-4 text-warning-600" />
                            <AlertTitle className="text-warning-800">
                                You have {upcomingDeadlines.length} upcoming deadline
                                {upcomingDeadlines.length !== 1 ? 's' : ''}
                            </AlertTitle>
                            <AlertDescription className="text-warning-700">
                                Don't miss critical filing dates. Review your deadlines below.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - 2 columns */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Upcoming Deadlines */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                                        <Bell className="mr-2 h-5 w-5 text-brand-600" />
                                        Upcoming Deadlines
                                    </h2>
                                    <Button variant="ghost" size="sm">
                                        View All
                                    </Button>
                                </div>

                                {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingDeadlines.map((deadline) => {
                                            const daysUntil = Math.ceil(
                                                (new Date(deadline.due_date).getTime() - new Date().getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )
                                            // Map 'critical' to 'urgent' for DeadlineCard
                                            const mappedPriority: 'low' | 'medium' | 'high' | 'urgent' =
                                                deadline.priority === 'critical' ? 'urgent' : deadline.priority as 'low' | 'medium' | 'high'
                                            return (
                                                <DeadlineCard
                                                    key={deadline.id}
                                                    title={deadline.title}
                                                    date={new Date(deadline.due_date).toLocaleDateString()}
                                                    daysRemaining={daysUntil}
                                                    priority={mappedPriority}
                                                    description={deadline.description || ''}
                                                />
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500">No upcoming deadlines</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </section>

                            {/* Active Projects */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                                        <FileText className="mr-2 h-5 w-5 text-brand-600" />
                                        Active Projects
                                    </h2>
                                    <Button variant="ghost" size="sm">
                                        View All
                                    </Button>
                                </div>

                                {activeProjects && activeProjects.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeProjects.map((project) => (
                                            <Card key={project.id} variant="elevated">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-slate-900 mb-1">
                                                                {project.name}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mb-3">
                                                                {project.property_owner_name || 'No owner specified'}
                                                            </p>
                                                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                                                                <span>
                                                                    Type: {project.project_type?.replace('_', ' ') || 'N/A'}
                                                                </span>
                                                                {project.contract_amount_cents && (
                                                                    <span>
                                                                        Value: ${(project.contract_amount_cents / 100).toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                project.status === 'active'
                                                                    ? 'success'
                                                                    : project.status === 'lien_filed'
                                                                        ? 'warning'
                                                                        : 'default'
                                                            }
                                                        >
                                                            {project.status}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 mb-4">No active projects</p>
                                            <Button variant="secondary" onClick={() => navigate('/assessment')}>
                                                Start Assessment
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </section>
                        </div>

                        {/* Sidebar - 1 column */}
                        <div className="space-y-8">
                            {/* My Lien Kits */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                                        <Package className="mr-2 h-5 w-5 text-brand-600" />
                                        My Lien Kits
                                    </h2>
                                </div>

                                {ownedKits && ownedKits.length > 0 ? (
                                    <div className="space-y-4">
                                        {ownedKits.slice(0, 3).map((userKit) => (
                                            <KitCard
                                                key={userKit.id}
                                                title={userKit.lien_kit.name}
                                                description={userKit.lien_kit.description || ''}
                                                price={userKit.lien_kit.price_cents}
                                                features={userKit.lien_kit.features || []}
                                                popular={userKit.lien_kit.is_popular}
                                                onSelect={() => console.log('View kit:', userKit.lien_kit_id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="p-6 text-center">
                                            <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                            <p className="text-sm text-slate-500 mb-3">No kits purchased yet</p>
                                            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                                                Browse Kits
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </section>

                            {/* Recent Activity */}
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
                                {recentActivity && recentActivity.length > 0 ? (
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                {recentActivity.map((activity, idx) => (
                                                    <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                                        <div className="flex-shrink-0 mt-1">
                                                            {activity.type === 'project' ? (
                                                                <FileText className="h-4 w-4 text-slate-400" />
                                                            ) : (
                                                                <Bell className="h-4 w-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                                {activity.title}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {new Date(activity.date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {activity.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="p-6 text-center">
                                            <p className="text-sm text-slate-500">No recent activity</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </section>

                            {/* Recent Orders */}
                            {recentOrders && recentOrders.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h2>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                {recentOrders.slice(0, 3).map((order) => (
                                                    <div key={order.id} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {order.order_number}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                ${(order.total_cents / 100).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                order.status === 'completed'
                                                                    ? 'success'
                                                                    : order.status === 'pending'
                                                                        ? 'warning'
                                                                        : 'default'
                                                            }
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}

// Statistics Card Component
interface StatCardProps {
    title: string
    value: number
    icon: React.ElementType
    trend?: string
    trendUp?: boolean
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
    return (
        <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {trend && (
                    <p className={`text-xs flex items-center mt-1 ${trendUp ? 'text-success-600' : 'text-slate-500'}`}>
                        {trendUp && <TrendingUp className="h-3 w-3 mr-1" />}
                        {trend}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
