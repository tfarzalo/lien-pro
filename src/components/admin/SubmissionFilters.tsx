import { useState } from 'react'

interface SubmissionFiltersProps {
    onFilterChange: (filters: SubmissionFilters) => void
    initialFilters?: SubmissionFilters
}

export interface SubmissionFilters {
    status?: string
    dateRange?: {
        start: string
        end: string
    }
    searchQuery?: string
    userId?: string
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
]

export function SubmissionFilters({ onFilterChange, initialFilters = {} }: SubmissionFiltersProps) {
    const [filters, setFilters] = useState<SubmissionFilters>(initialFilters)
    const [isExpanded, setIsExpanded] = useState(false)

    const handleFilterChange = (key: keyof SubmissionFilters, value: any) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleClearFilters = () => {
        const clearedFilters: SubmissionFilters = {}
        setFilters(clearedFilters)
        onFilterChange(clearedFilters)
    }

    const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

    return (
        <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search submissions, users, projects..."
                            value={filters.searchQuery || ''}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {activeFilterCount > 0 && (
                            <button
                                onClick={handleClearFilters}
                                className="text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Clear filters ({activeFilterCount})
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Filters
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateRange?.start || ''}
                                onChange={(e) =>
                                    handleFilterChange('dateRange', {
                                        ...filters.dateRange,
                                        start: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateRange?.end || ''}
                                onChange={(e) =>
                                    handleFilterChange('dateRange', {
                                        ...filters.dateRange,
                                        end: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
