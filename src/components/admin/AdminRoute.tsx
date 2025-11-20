import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface AdminRouteProps {
    /** If true, allows both admin and attorney roles. If false, only admin. */
    allowAttorney?: boolean
}

/**
 * Route guard component for admin/attorney-only routes
 * Redirects non-admin users to the dashboard
 */
export function AdminRoute({ allowAttorney = true }: AdminRouteProps) {
    const { user, isAdmin, isAttorney, loading } = useAdminAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Verifying permissions...</p>
                </div>
            </div>
        )
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Check permissions
    const hasPermission = isAdmin || (allowAttorney && isAttorney)

    if (!hasPermission) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
