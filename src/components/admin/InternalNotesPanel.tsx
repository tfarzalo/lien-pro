import { useState } from 'react'
import { format } from 'date-fns'

interface InternalNote {
  id: string
  submission_id: string
  created_by: string
  content: string
  created_at: string
  author?: {
    email: string
    full_name?: string
  }
}

interface InternalNotesPanelProps {
  notes: InternalNote[]
  onAddNote: (content: string) => Promise<void>
  onRefresh?: () => void
}

export function InternalNotesPanel({ 
  notes, 
  onAddNote, 
  onRefresh 
}: InternalNotesPanelProps) {
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newNote.trim()) {
      setError('Please enter a note')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      await onAddNote(newNote.trim())
      setNewNote('')
      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Internal Notes</h3>
          <span className="text-sm text-gray-500">{notes.length} notes</span>
        </div>
      </div>

      {/* New Note Form */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note (only visible to staff)..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isAdding}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setNewNote('')
                setError(null)
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isAdding}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !newNote.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      <div className="divide-y divide-gray-200">
        {notes.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No internal notes yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Add notes to track progress, decisions, or communicate with the team
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {note.author?.full_name || note.author?.email || 'Unknown User'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
