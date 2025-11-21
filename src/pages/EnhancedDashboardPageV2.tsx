// =====================================================
// Enhanced User Dashboard Page
// Displays purchased kits, deadlines, and activity
// =====================================================

import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { useDashboard, useDashboardStats, useRecentActivity } from '@/hooks/useDashboard'
import { useUserKits } from '@/hooks/useLienKits'
import { useUserOrders } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
    Package,
    FileText,
    Download,
    Clock,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    PlayCircle,
    Eye,
    Calendar,
    ShoppingBag,
    Activity,
} from 'lucide-react'

export function EnhancedDashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    // Fetch dashboard data
    const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard()
    const { data: stats, isLoading: isStatsLoading } = useDashboardStats()
    const { data: recentActivity, isLoading: isActivityLoading } = useRecentActivity(10)
    const { data: userKits, isLoading: isKitsLoading } = useUserKits()
    const { data: orders, isLoading: isOrdersLoading } = useUserOrders()

    // Loading state
    if (isDashboardLoading || isStatsLoading) {
        return (
            <AppShell>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-32 bg-slate-200 rounded-lg"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="h-32 bg-slate-200 rounded-lg"></div>
                            <div className="h-32 bg-slate-200 rounded-lg"></div>
                            <div className="h-32 bg-slate-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </AppShell>
        )
    }

    // Get urgent deadlines
    const urgentDeadlines = dashboardData?.upcomingDeadlines?.filter(
        (d) => {
            const daysUntil = Math.floor(
                (new Date(d.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            return daysUntil <= 7
        }
    ) || []

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">
                {/* Page Header */}
                <PageHeader
                    title={`Welcome back, ${user?.user_metadata?.full_name || user?.email || 'User'}!`}
                    subtitle="Manage your lien kits, track deadlines, and stay compliant"
                    actions={
                        <Button onClick={() => navigate('/assessment')}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Take Assessment
                        </Button>
                    }
                />

                {/* Urgent Alert */}
                {urgentDeadlines.length > 0 && (
                    <Alert variant="danger">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Urgent Deadlines</AlertTitle>
                        <AlertDescription>
                            You have {urgentDeadlines.length} deadline{urgentDeadlines.length > 1 ? 's' : ''} due
                            within 7 days. Review them below to stay compliant.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Your Kits"
                        value={stats?.ownedKits || 0}
                        icon={Package}
                        color="brand"
                        isLoading={isStatsLoading}
                    />
                    <StatCard
                        title="Active Projects"
                        value={stats?.activeProjects || 0}
                        icon={FileText}
                        color="blue"
                        isLoading={isStatsLoading}
                    />
                    <StatCard
                        title="Upcoming Deadlines"
                        value={stats?.upcomingDeadlines || 0}
                        icon={Clock}
                        color="warning"
                        isLoading={isStatsLoading}
                    />
                    <StatCard
                        title="Completed Assessments"
                        value={stats?.completedAssessments || 0}
                        icon={CheckCircle}
                        color="success"
                        isLoading={isStatsLoading}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Kits and Projects */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Your Kits Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Your Kits</h2>
                                <Button variant="secondary" onClick={() => navigate('/kits')}>
                                    Browse All Kits
                                </Button>
                            </div>

                            {isKitsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : userKits && userKits.length > 0 ? (
                                <div className="space-y-4">
                                    {userKits.map((userKit) => (
                                        <KitCard
                                            key={userKit.id}
                                            userKit={userKit}
                                            onOpenForms={() => navigate(`/kits/${userKit.lien_kit_id}/forms`)}
                                            onViewInstructions={() => navigate(`/kits/${userKit.lien_kit_id}/instructions`)}
                                            onDownload={() => navigate(`/kits/${userKit.lien_kit_id}/download`)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Package}
                                    title="No Kits Yet"
                                    description="Take the assessment to get personalized kit recommendations, or browse our catalog."
                                    actionLabel="Take Assessment"
                                    onAction={() => navigate('/assessment')}
                                />
                            )}
                        </section>

                        {/* Recent Activity Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    {isActivityLoading ? (
                                        <div className="p-6 space-y-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded"></div>
                                            ))}
                                        </div>
                                    ) : recentActivity && recentActivity.length > 0 ? (
                                        <div className="divide-y divide-slate-200">
                                            {recentActivity.map((activity, index) => (
                                                <ActivityItem key={index} activity={activity} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">No recent activity</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    {/* Right Column - Deadlines and Orders */}
                    <div className="space-y-8">
                        {/* Deadlines Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Upcoming Deadlines</h2>
                            </div>

                            {dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboardData.upcomingDeadlines.map((deadline) => (
                                        <DeadlineCard key={deadline.id} deadline={deadline} />
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 text-sm">No upcoming deadlines</p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>

                        {/* Recent Orders Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/orders')}
                                >
                                    View All
                                </Button>
                            </div>

                            {isOrdersLoading ? (
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : orders && orders.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.slice(0, 3).map((order) => (
                                        <OrderCard key={order.id} order={order} />
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 text-sm">No orders yet</p>
                                    </CardContent>
                                </Card>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}

// =====================================================
// Component: Stat Card
// =====================================================

interface StatCardProps {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: 'brand' | 'blue' | 'warning' | 'success'
    isLoading?: boolean
}

function StatCard({ title, value, icon: Icon, color, isLoading }: StatCardProps) {
    const colorClasses = {
        brand: 'bg-brand-100 text-brand-600',
        blue: 'bg-blue-100 text-blue-600',
        warning: 'bg-warning-100 text-warning-600',
        success: 'bg-success-100 text-success-600',
    }

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
        )
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-slate-900">{value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// =====================================================
// Component: Kit Card
// =====================================================

interface KitCardProps {
    userKit: any // UserKitWithKit type
    onOpenForms: () => void
    onViewInstructions: () => void
    onDownload: () => void
}

function KitCard({ userKit, onOpenForms, onViewInstructions, onDownload }: KitCardProps) {
    const kit = userKit.lien_kit

    // Calculate progress (mock for now - would come from form completion data)
    const progress = userKit.progress || 0
    const isComplete = progress === 100

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{kit.name}</h3>
                            {kit.is_popular && (
                                <Badge variant="primary">Popular</Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{kit.description}</p>
                        <div className="flex items-center text-sm text-slate-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Purchased {new Date(userKit.purchase_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                            {isComplete ? 'Completed' : 'Progress'}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${isComplete ? 'bg-success-600' : 'bg-brand-600'
                                }`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={onOpenForms}>
                        <FileText className="mr-2 h-4 w-4" />
                        Open Forms
                    </Button>
                    <Button size="sm" variant="secondary" onClick={onViewInstructions}>
                        <Eye className="mr-2 h-4 w-4" />
                        Instructions
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>

                {progress < 100 && progress > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <Button variant="link" size="sm" onClick={onOpenForms} className="text-brand-600">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Continue where you left off
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// =====================================================
// Component: Deadline Card
// =====================================================

interface DeadlineCardProps {
    deadline: any // Deadline type
}

function DeadlineCard({ deadline }: DeadlineCardProps) {
    const daysUntil = Math.floor(
        (new Date(deadline.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    const getPriorityConfig = (days: number) => {
        if (days <= 3) {
            return {
                color: 'danger',
                icon: AlertCircle,
                badge: 'URGENT',
                bgColor: 'bg-danger-50',
                borderColor: 'border-danger-200',
            }
        } else if (days <= 7) {
            return {
                color: 'warning',
                icon: AlertTriangle,
                badge: 'High',
                bgColor: 'bg-warning-50',
                borderColor: 'border-warning-200',
            }
        } else {
            return {
                color: 'blue',
                icon: Clock,
                badge: 'Normal',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
            }
        }
    }

    const config = getPriorityConfig(daysUntil)
    const Icon = config.icon

    return (
        <Card className={`${config.bgColor} ${config.borderColor}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-2 flex-1">
                        <Icon className={`h-5 w-5 text-${config.color}-600 flex-shrink-0 mt-0.5`} />
                        <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{deadline.title}</h4>
                            {deadline.description && (
                                <p className="text-xs text-slate-600 mt-1">{deadline.description}</p>
                            )}
                        </div>
                    </div>
                    <Badge variant={config.color as any}>
                        {config.badge}
                    </Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-600">
                        {new Date(deadline.due_date).toLocaleDateString()}
                    </div>
                    <div className={`text-sm font-semibold text-${config.color}-700`}>
                        {daysUntil} {daysUntil === 1 ? 'day' : 'days'} left
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// =====================================================
// Component: Activity Item
// =====================================================

interface ActivityItemProps {
    activity: any // Activity type
}

function ActivityItem({ activity }: ActivityItemProps) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'purchase':
                return ShoppingBag
            case 'form_completed':
                return CheckCircle
            case 'deadline_created':
                return Clock
            case 'assessment':
                return FileText
            default:
                return Activity
        }
    }

    const Icon = getActivityIcon(activity.activity_type)

    return (
        <div className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 bg-brand-100 rounded-full flex items-center justify-center">
                        <Icon className="h-4 w-4 text-brand-600" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    {activity.description && (
                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )
}

// =====================================================
// Component: Order Card
// =====================================================

interface OrderCardProps {
    order: any // Order type
}

function OrderCard({ order }: OrderCardProps) {
    const navigate = useNavigate()

    const statusConfig = {
        completed: { label: 'Completed', color: 'success' },
        pending: { label: 'Pending', color: 'warning' },
        failed: { label: 'Failed', color: 'danger' },
    }

    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending

    return (
        <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/orders/${order.id}`)}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <p className="font-semibold text-slate-900 text-sm">{order.order_number}</p>
                        <p className="text-xs text-slate-600 mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <Badge variant={config.color as any}>
                        {config.label}
                    </Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                    <span className="text-xs text-slate-600">
                        {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                        ${(order.total_cents / 100).toFixed(2)}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}

// =====================================================
// Component: Empty State
// =====================================================

interface EmptyStateProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    actionLabel: string
    onAction: () => void
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <Card>
            <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 mb-6 max-w-sm mx-auto">{description}</p>
                <Button onClick={onAction}>{actionLabel}</Button>
            </CardContent>
        </Card>
    )
}
