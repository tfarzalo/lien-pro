import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

interface Submission {
  id: string
  project_id: string
  form_id: string
  user_id: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submitted_at: string | null
  updated_at: string
  user?: {
    email: string
    full_name?: string
  }
  project?: {
    name: string
    property_address?: string
  }
}

interface SubmissionsTableProps {
  submissions: Submission[]
  loading?: boolean
  onRefresh?: () => void
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function SubmissionsTable({ submissions, loading, onRefresh }: SubmissionsTableProps) {
  const navigate = useNavigate()
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  const toggleAll = () => {
    if (selectedRows.size === submissions.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(submissions.map(s => s.id)))
    }
  }

  const handleRowClick = (submissionId: string) => {
    navigate(`/admin/submissions/${submissionId}`)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading submissions...</p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No submissions found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {/* TODO: Implement bulk status update */}}
            >
              Update Status
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {/* TODO: Implement bulk export */}}
            >
              Export
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setSelectedRows(new Set())}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === submissions.length}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={(e) => {
                  // Don't navigate if clicking checkbox or action buttons
                  if (
                    (e.target as HTMLElement).closest('input[type="checkbox"]') ||
                    (e.target as HTMLElement).closest('button')
                  ) {
                    return
                  }
                  handleRowClick(submission.id)
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(submission.id)}
                    onChange={() => toggleRow(submission.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {submission.user?.full_name || 'Unknown User'}
                    </div>
                    <div className="text-gray-500">{submission.user?.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {submission.project?.name || 'Untitled Project'}
                    </div>
                    {submission.project?.property_address && (
                      <div className="text-gray-500 text-xs mt-1">
                        {submission.project.property_address}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[submission.status]
                    }`}
                  >
                    {submission.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.submitted_at
                    ? format(new Date(submission.submitted_at), 'MMM d, yyyy')
                    : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(submission.updated_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRowClick(submission.id)
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{submissions.length}</span> submissions
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
