import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { adminQueriesService } from '@/services/adminQueriesService'

interface Deadline {
    id: string
    submission_id: string
    deadline_type: string
    deadline_date: string
    status: 'pending' | 'upcoming' | 'overdue' | 'completed'
    description?: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    user?: {
        email: string
        full_name?: string
    }
    project?: {
        name: string
        property_address?: string
    }
}

const STATUS_COLORS = {
    pending: 'bg-gray-100 text-gray-800',
    upcoming: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
}

const PRIORITY_COLORS = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
}

export function AdminDeadlinesPage() {
    const [deadlines, setDeadlines] = useState<Deadline[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming' | 'completed'>('all')

    useEffect(() => {
        loadDeadlines()
    }, [filter])

    const loadDeadlines = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await adminQueriesService.getAllDeadlines({
                status: filter === 'all' ? undefined : filter,
            })

            if (fetchError) throw fetchError

            setDeadlines(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load deadlines')
        } finally {
            setLoading(false)
        }
    }

    const filterOptions = [
        { value: 'all', label: 'All Deadlines' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'completed', label: 'Completed' },
    ]

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading deadlines...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Deadline Monitor</h1>
                <p className="text-gray-600 mt-1">
                    Track and manage all filing deadlines across the platform
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        {filterOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value as any)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === option.value
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Deadlines List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {deadlines.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-gray-600">No deadlines found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {deadlines.map((deadline) => (
                            <div
                                key={deadline.id}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {deadline.deadline_type.replace('_', ' ')}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[deadline.status]
                                                    }`}
                                            >
                                                {deadline.status}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[deadline.priority]
                                                    }`}
                                            >
                                                {deadline.priority}
                                            </span>
                                        </div>

                                        {deadline.description && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                {deadline.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Due:</span>{' '}
                                                <span className="font-medium text-gray-900">
                                                    {format(new Date(deadline.deadline_date), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            {deadline.user && (
                                                <div>
                                                    <span className="text-gray-500">User:</span>{' '}
                                                    <span className="text-gray-900">
                                                        {deadline.user.full_name || deadline.user.email}
                                                    </span>
                                                </div>
                                            )}
                                            {deadline.project && (
                                                <div>
                                                    <span className="text-gray-500">Project:</span>{' '}
                                                    <span className="text-gray-900">
                                                        {deadline.project.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                            View Details
                                        </button>
                                        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                            Send Reminder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
