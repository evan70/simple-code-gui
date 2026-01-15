import React from 'react'
import ReactDOM from 'react-dom'

interface CreateTaskModalProps {
  show: boolean
  onClose: () => void
  onCreate: () => void
  title: string
  setTitle: (title: string) => void
  type: 'task' | 'bug' | 'feature' | 'epic' | 'chore'
  setType: (type: 'task' | 'bug' | 'feature' | 'epic' | 'chore') => void
  priority: number
  setPriority: (priority: number) => void
  description: string
  setDescription: (description: string) => void
  labels: string
  setLabels: (labels: string) => void
}

export function CreateTaskModal({
  show, onClose, onCreate,
  title, setTitle,
  type, setType,
  priority, setPriority,
  description, setDescription,
  labels, setLabels
}: CreateTaskModalProps) {
  if (!show) return null

  return ReactDOM.createPortal(
    <div className="beads-modal-overlay" onClick={onClose}>
      <div className="beads-modal" onClick={(e) => e.stopPropagation()}>
        <div className="beads-modal-header">
          <h3>Create Task</h3>
          <button className="beads-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="beads-modal-body">
          <div className="beads-form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) {
                  e.preventDefault()
                  onCreate()
                }
                if (e.key === 'Escape') onClose()
              }}
            />
          </div>
          <div className="beads-form-row">
            <div className="beads-form-group">
              <label htmlFor="task-type">Type</label>
              <select id="task-type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="epic">Epic</option>
                <option value="chore">Chore</option>
              </select>
            </div>
            <div className="beads-form-group">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={priority} onChange={(e) => setPriority(parseInt(e.target.value))}>
                <option value="0">P0 - Critical</option>
                <option value="1">P1 - High</option>
                <option value="2">P2 - Medium</option>
                <option value="3">P3 - Low</option>
                <option value="4">P4 - Lowest</option>
              </select>
            </div>
          </div>
          <div className="beads-form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="beads-form-group">
            <label htmlFor="task-labels">Labels</label>
            <input
              id="task-labels"
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="Comma-separated labels..."
            />
          </div>
        </div>
        <div className="beads-modal-footer">
          <button className="beads-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="beads-btn-create" onClick={onCreate} disabled={!title.trim()}>Create</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
