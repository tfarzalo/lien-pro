import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'
import { adminQueriesService } from '@/services/adminQueriesService'
import { InternalNotesPanel } from '@/components/admin/InternalNotesPanel'

interface SubmissionDetail {
    id: string
    project_id: string
    form_id: string
    user_id: string
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
    form_data: Record<string, any>
    submitted_at: string | null
    created_at: string
    updated_at: string
    user?: {
        id: string
        email: string
        full_name?: string
        phone?: string
    }
    project?: {
        id: string
        name: string
        property_address?: string
        project_type?: string
    }
    documents?: Array<{
        id: string
        filename: string
        file_path: string
        uploaded_at: string
    }>
    deadlines?: Array<{
        id: string
        deadline_type: string
        deadline_date: string
        status: string
        description?: string
    }>
}

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
]

export function SubmissionDetailPage() {
    const { submissionId } = useParams<{ submissionId: string }>()
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
    const [notes, setNotes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        loadSubmission()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submissionId])

    const loadSubmission = async () => {
        if (!submissionId) return

        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await adminQueriesService.getSubmissionDetail(
                submissionId
            )

            if (fetchError) throw fetchError

            setSubmission(data as SubmissionDetail)

            // Load internal notes
            const { data: notesData } = await adminQueriesService.getInternalNotes(submissionId)
            setNotes(notesData || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load submission')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!submissionId || !submission) return

        setUpdating(true)
        try {
            // Get current user (admin) ID
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Update status in database
            const { error } = await adminQueriesService.updateUserKitStatus(
                submissionId,
                newStatus,
                user.id,
                `Status changed from ${submission.status} to ${newStatus}`
            )

            if (error) throw error

            // Reload submission
            await loadSubmission()

            // Log activity
            await adminQueriesService.logAdminActivity({
                admin_id: user.id,
                action_type: 'status_change',
                entity_type: 'submission',
                entity_id: submissionId,
                metadata: { old_status: submission?.status, new_status: newStatus },
            })
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    const handleAddNote = async (content: string) => {
        if (!submissionId) return

        // Get current user (admin) ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await adminQueriesService.addInternalNote(
            submissionId,
            submission?.user_id || '',
            user.id,
            'review',
            content
        )

        if (error) throw error

        // Reload notes
        await loadSubmission()
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading submission...</p>
                </div>
            </div>
        )
    }

    if (error || !submission) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error || 'Submission not found'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
                        <p className="text-sm text-gray-600 mt-1">ID: {submission.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={submission.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Info */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">User Information</h2>
                        </div>
                        <div className="px-6 py-4 space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-gray-900">{submission.user?.full_name || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900">{submission.user?.email || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                <p className="text-gray-900">{submission.user?.phone || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Project Info */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Project Information</h2>
                        </div>
                        <div className="px-6 py-4 space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Project Name</label>
                                <p className="text-gray-900">{submission.project?.name || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Property Address</label>
                                <p className="text-gray-900">{submission.project?.property_address || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Project Type</label>
                                <p className="text-gray-900">{submission.project?.project_type || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Data */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Form Responses</h2>
                        </div>
                        <div className="px-6 py-4">
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                                {JSON.stringify(submission.form_data, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Documents */}
                    {submission.documents && submission.documents.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                            </div>
                            <div className="px-6 py-4 space-y-2">
                                {submission.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{doc.filename}</p>
                                            <p className="text-sm text-gray-500">
                                                Uploaded {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <a
                                            href={doc.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Internal Notes */}
                    <InternalNotesPanel
                        notes={notes}
                        onAddNote={handleAddNote}
                        onRefresh={loadSubmission}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Timeline</h2>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Created</label>
                                <p className="text-gray-900">
                                    {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                                </p>
                            </div>
                            {submission.submitted_at && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                                    <p className="text-gray-900">
                                        {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                <p className="text-gray-900">
                                    {format(new Date(submission.updated_at), 'MMM d, yyyy h:mm a')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Deadlines */}
                    {submission.deadlines && submission.deadlines.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Deadlines</h2>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                {submission.deadlines.map((deadline) => (
                                    <div key={deadline.id} className="pb-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-900">
                                                {deadline.deadline_type.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${deadline.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    deadline.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {deadline.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {format(new Date(deadline.deadline_date), 'MMM d, yyyy')}
                                        </p>
                                        {deadline.description && (
                                            <p className="text-xs text-gray-500 mt-1">{deadline.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="px-6 py-4 space-y-2">
                            <button className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                Send Email to User
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                Generate Report
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
