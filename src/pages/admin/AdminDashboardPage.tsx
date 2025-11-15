// =====================================================
// Admin Dashboard Page
// Main dashboard for attorneys/admins
// =====================================================

import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { getAdminDashboardStats, getAllSubmissions, getAllDeadlinesForAdmin } from '@/services/adminQueriesService';
import { format, formatDistanceToNow } from 'date-fns';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check admin access
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'attorney';

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const { data } = await getAdminDashboardStats();
      return data;
    },
    enabled: isAdmin,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch recent submissions
  const { data: recentSubmissions } = useQuery({
    queryKey: ['admin-recent-submissions'],
    queryFn: async () => {
      const { data } = await getAllSubmissions({});
      return data?.slice(0, 5) || [];
    },
    enabled: isAdmin,
  });

  // Fetch urgent deadlines
  const { data: urgentDeadlines } = useQuery({
    queryKey: ['admin-urgent-deadlines'],
    queryFn: async () => {
      const { data } = await getAllDeadlinesForAdmin({ overdueOnly: true });
      return data?.slice(0, 5) || [];
    },
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="danger">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access the admin dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Monitor and manage all user submissions and deadlines</p>
        </div>

        {/* Urgent Alerts */}
        {stats && (stats.overdueDeadlines > 0 || stats.pendingSubmissions > 10) && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention Needed</AlertTitle>
            <AlertDescription>
              {stats.overdueDeadlines > 0 && (
                <span className="block">
                  <strong>{stats.overdueDeadlines}</strong> deadline{stats.overdueDeadlines > 1 ? 's are' : ' is'} overdue
                </span>
              )}
              {stats.pendingSubmissions > 10 && (
                <span className="block">
                  <strong>{stats.pendingSubmissions}</strong> submissions pending review
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.activeUsers || 0} active this month`}
            icon={Users}
            color="blue"
            trend="+12%"
            isLoading={statsLoading}
          />
          <StatCard
            title="Pending Review"
            value={stats?.pendingSubmissions || 0}
            subtitle={`${stats?.inReviewSubmissions || 0} in review`}
            icon={FileText}
            color="warning"
            onClick={() => navigate('/admin/submissions?status=pending')}
            isLoading={statsLoading}
          />
          <StatCard
            title="Overdue Deadlines"
            value={stats?.overdueDeadlines || 0}
            subtitle={`${stats?.dueTodayDeadlines || 0} due today`}
            icon={AlertTriangle}
            color="danger"
            onClick={() => navigate('/admin/deadlines?filter=overdue')}
            isLoading={statsLoading}
          />
          <StatCard
            title="Avg Review Time"
            value={`${stats?.avgReviewTime || 0}h`}
            subtitle="Last 30 days"
            icon={Clock}
            color="success"
            isLoading={statsLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Submissions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Submissions
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/submissions')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubmissions?.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/submissions/${submission.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">
                            {submission.user?.full_name || submission.user?.email}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {submission.lien_kit?.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {formatDistanceToNow(new Date(submission.purchase_date), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(submission.status)}>
                          {submission.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!recentSubmissions || recentSubmissions.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>No recent submissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgent Deadlines */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-danger-600" />
                  Urgent Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgentDeadlines?.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="p-3 border-l-4 border-danger-500 bg-danger-50 rounded cursor-pointer hover:bg-danger-100 transition-colors"
                      onClick={() => navigate(`/admin/deadlines/${deadline.id}`)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900">{deadline.title}</p>
                        <Badge variant="danger" className="text-xs">
                          OVERDUE
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        {deadline.user?.full_name || deadline.user?.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        Due: {format(new Date(deadline.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                  {(!urgentDeadlines || urgentDeadlines.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success-300" />
                      <p className="text-sm">No urgent deadlines</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate('/admin/deadlines')}
                >
                  View All Deadlines
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/submissions')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All Submissions
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/deadlines')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Monitor Deadlines
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/reports')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// =====================================================
// Sub-Components
// =====================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'warning' | 'danger' | 'success';
  trend?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  onClick,
  isLoading,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600',
    success: 'bg-success-100 text-success-600',
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <span className="text-sm font-medium text-success-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_review':
      return 'primary';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
}
