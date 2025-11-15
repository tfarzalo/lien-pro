import { useState, useEffect } from 'react'
import { adminQueriesService } from '@/services/adminQueriesService'
import { SubmissionsTable } from '@/components/admin/SubmissionsTable'
import { SubmissionFilters, SubmissionFilters as FilterType } from '@/components/admin/SubmissionFilters'

export function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterType>({})

  useEffect(() => {
    loadSubmissions()
  }, [filters])

  const loadSubmissions = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await adminQueriesService.getAllSubmissions({
        status: filters.status,
        userId: filters.userId,
        dateFrom: filters.dateRange?.start,
        dateTo: filters.dateRange?.end,
        search: filters.searchQuery,
      })

      if (fetchError) throw fetchError

      setSubmissions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Submissions</h1>
        <p className="text-gray-600 mt-1">
          View and manage all user submissions across the platform
        </p>
      </div>

      {/* Filters */}
      <SubmissionFilters 
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Submissions Table */}
      <SubmissionsTable
        submissions={submissions}
        loading={loading}
        onRefresh={loadSubmissions}
      />
    </div>
  )
}
