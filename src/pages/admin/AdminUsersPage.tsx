import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { adminQueriesService } from '@/services/adminQueriesService'

interface User {
    id: string
    email: string
    created_at: string
    last_sign_in_at?: string
    raw_user_meta_data?: {
        full_name?: string
        phone?: string
    }
    app_metadata?: {
        role?: string
    }
    _count?: {
        projects: number
        submissions: number
    }
}

export function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadUsers()
    }, [searchQuery])

    const loadUsers = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await adminQueriesService.getAllUsers({
                search: searchQuery || undefined,
            })

            if (fetchError) throw fetchError

            setUsers(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">
                    View and manage all users on the platform
                </p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Projects
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Active
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">
                                            {user.raw_user_meta_data?.full_name || 'Unknown User'}
                                        </div>
                                        <div className="text-gray-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {user.app_metadata?.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user._count?.projects || 0} projects, {user._count?.submissions || 0} submissions
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.last_sign_in_at
                                        ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                                        : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                                        View
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-900">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="text-gray-600">No users found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
