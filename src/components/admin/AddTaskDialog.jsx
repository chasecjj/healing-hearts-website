import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTeamTasks } from '../../stores/teamTasks'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const PROJECT_COLORS = [
  '#58a6ff', '#3fb950', '#f59e0b', '#ef4444',
  '#a78bfa', '#f97316', '#06b6d4', '#ec4899',
]

const inputStyle = {
  width: '100%',
  backgroundColor: '#30363d',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 12px',
  color: '#e6edf3',
  fontSize: '0.85rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238b949e' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
  cursor: 'pointer',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  fontFamily: 'ui-monospace, monospace',
  fontWeight: 600,
  color: '#8b949e',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '6px',
}

export function AddTaskDialog({ open, onClose }) {
  const { createTask } = useTeamTasks()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectName, setProjectName] = useState('General')
  const [projectColor, setProjectColor] = useState('#58a6ff')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('normal')
  const [saving, setSaving] = useState(false)
  const [team, setTeam] = useState([])

  useEffect(() => {
    if (open) {
      supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .eq('role', 'admin')
        .then(({ data }) => setTeam(data || []))
        .catch(() => {})
    }
  }, [open])

  // Escape closes
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const assigneeRecord = team.find((m) => m.email === assigneeEmail)
      await createTask({
        title: title.trim(),
        description: description.trim(),
        project_name: projectName || 'General',
        project_color: projectColor,
        due_date: dueDate || null,
        priority,
        assignee_email: assigneeEmail || null,
        assignee_name: assigneeRecord?.full_name || assigneeEmail || null,
      })
      toast('Task created')
      // Reset form
      setTitle('')
      setDescription('')
      setProjectName('General')
      setProjectColor('#58a6ff')
      setAssigneeEmail('')
      setDueDate('')
      setPriority('normal')
      onClose()
    } catch (err) {
      console.error('Failed to create task:', err)
      toast.error('Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const canSave = title.trim() && !saving

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 60,
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New Task"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#161b22',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 61,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'inherit', fontSize: '1.1rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>
              New Task
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              placeholder="What needs to be done?"
              style={inputStyle}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
            />
          </div>

          {/* Project name + color */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Project</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="General"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setProjectColor(c)}
                    title={c}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: projectColor === c ? '2px solid #e6edf3' : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Priority + Due Date */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={selectStyle}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label style={labelStyle}>Assignee</label>
            <select value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)} style={selectStyle}>
              <option value="">Unassigned</option>
              {team.map((m) => (
                <option key={m.email || m.id} value={m.email}>{m.full_name || m.email}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #484f58',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#8b949e',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                background: canSave ? '#58a6ff' : '#30363d',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                color: canSave ? '#0a0e14' : '#8b949e',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: canSave ? 'pointer' : 'default',
              }}
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
