import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTeamTasks } from '../../stores/teamTasks'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.14)' },
  high:   { label: 'High',   color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  normal: { label: 'Normal', color: '#58a6ff', bg: 'rgba(88,166,255,0.12)' },
  low:    { label: 'Low',    color: '#8b949e', bg: 'rgba(139,148,158,0.12)' },
}

const STATUS_ORDER = ['todo', 'in_progress', 'in_review', 'done']
const STATUS_CONFIG = {
  todo:        { label: 'To Do' },
  in_progress: { label: 'In Progress' },
  in_review:   { label: 'In Review' },
  done:        { label: 'Done' },
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

function FieldLabel({ children }) {
  return (
    <label style={{
      display: 'block',
      fontFamily: 'inherit',
      fontWeight: 700,
      fontSize: '0.65rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: '#8b949e',
      marginBottom: '7px',
    }}>
      {children}
    </label>
  )
}

function MetaField({ label, value }) {
  return (
    <div>
      <span style={{
        display: 'block',
        fontFamily: 'inherit',
        fontWeight: 700,
        fontSize: '0.62rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#8b949e',
        marginBottom: '2px',
      }}>{label}</span>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem', color: '#8b949e' }}>
        {value}
      </span>
    </div>
  )
}

function ConfirmDeleteDialog({ open, taskTitle, onConfirm, onCancel }) {
  if (!open) return null
  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 70 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#1c2128',
          borderRadius: '10px',
          padding: '24px',
          width: '360px',
          zIndex: 71,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <h3 style={{ color: '#e6edf3', fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>Delete Task</h3>
        <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '0 0 20px', lineHeight: 1.5 }}>
          Are you sure you want to delete &ldquo;{taskTitle}&rdquo;? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #484f58', background: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: '#da3633', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
          >
            Delete
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

export function TaskDetailPanel({ task, onClose }) {
  const { updateTask, deleteTask, createTask } = useTeamTasks()

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [priority, setPriority] = useState(task.priority)
  const [status, setStatus] = useState(task.status)
  const [assigneeEmail, setAssigneeEmail] = useState(task.assignee?.email ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [team, setTeam] = useState([])
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const panelRef = useRef(null)

  // Re-sync form when task changes
  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description)
    setPriority(task.priority)
    setStatus(task.status)
    setAssigneeEmail(task.assignee?.email ?? '')
    setDueDate(task.due_date ?? '')
  }, [task.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch admin team members via Supabase
  useEffect(() => {
    supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('role', 'admin')
      .then(({ data }) => setTeam(data || []))
      .catch(() => {})
  }, [])

  // Escape key closes
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [onClose])

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Focus trap
  const handlePanelKeyDown = (e) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(
      panelRef.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')
    )
    if (!focusable.length) { e.preventDefault(); return }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const assigneeRecord = team.find((m) => m.email === assigneeEmail)
      await updateTask(task.id, {
        title,
        description,
        priority,
        status,
        assignee_email: assigneeEmail || null,
        assignee_name: assigneeRecord?.full_name || assigneeEmail || null,
        due_date: dueDate || null,
      })
      toast('Task saved')
    } catch (err) {
      console.error('Save failed:', err)
      toast.error('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  function cycleStatus() {
    const idx = STATUS_ORDER.indexOf(status)
    setStatus(STATUS_ORDER[(idx + 1) % STATUS_ORDER.length])
  }

  const isDone = status === 'done'
  const priorityCfg = PRIORITY_CONFIG[priority]

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 54,
        }}
      />

      {/* Slide-over panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Task: ${task.title}`}
        onKeyDown={handlePanelKeyDown}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          backgroundColor: 'rgba(22,27,34,0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '-4px 0 30px rgba(0,0,0,0.5)',
          borderRadius: '8px 0 0 8px',
          zIndex: 55,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '22px 24px 18px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Project pill */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              backgroundColor: task.project.color + '22', color: task.project.color,
              borderRadius: '4px', padding: '3px 9px',
              fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', letterSpacing: '0.03em',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: task.project.color, flexShrink: 0 }} />
              {task.project.name}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Copy link */}
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/admin/tasks/list?id=${task.id}`); toast('Link copied') }}
                title="Copy link"
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#8b949e', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6.5 9.5l3-3M8.5 4.5H12a1.5 1.5 0 011.5 1.5V10a1.5 1.5 0 01-1.5 1.5H8.5M7.5 11.5H4a1.5 1.5 0 01-1.5-1.5V6A1.5 1.5 0 014 4.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#8b949e', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Editable title */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              margin: 0, fontFamily: 'inherit', fontWeight: 700, fontSize: '1.1rem', color: '#e6edf3',
              lineHeight: '1.4', background: 'transparent', border: 'none',
              borderBottom: '1px solid transparent', outline: 'none', width: '100%', padding: '2px 0',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
            onBlur={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
          />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Priority + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              style={{
                display: 'inline-flex', alignItems: 'center',
                backgroundColor: priorityCfg.bg, color: priorityCfg.color,
                borderRadius: '4px', padding: '4px 20px 4px 10px',
                fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.04em', border: 'none', outline: 'none', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(priorityCfg.color)}' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
              }}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={cycleStatus}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.03em', transition: 'background 0.15s',
                backgroundColor: isDone ? 'rgba(34,197,94,0.16)' : status === 'in_progress' ? 'rgba(88,166,255,0.14)' : status === 'in_review' ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.06)',
                color: isDone ? '#3fb950' : status === 'in_progress' ? '#58a6ff' : status === 'in_review' ? '#f59e0b' : '#8b949e',
              }}
            >
              <span style={{ fontSize: '0.65rem' }}>
                {isDone ? '✓' : status === 'in_progress' ? '▶' : status === 'in_review' ? '◎' : '○'}
              </span>
              {STATUS_CONFIG[status].label}
            </button>
          </div>

          {/* Description */}
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description..."
              style={{
                width: '100%', boxSizing: 'border-box',
                backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                padding: '12px 14px', margin: 0,
                fontFamily: 'inherit', fontSize: '0.85rem', color: '#8b949e',
                lineHeight: '1.65', border: 'none', outline: 'none',
                resize: 'vertical', minHeight: '60px',
              }}
            />
          </div>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div>
              <FieldLabel>Labels</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {task.labels.map((label) => (
                  <span key={label.name} style={{
                    backgroundColor: label.color + '22', color: label.color,
                    borderRadius: '4px', padding: '3px 8px',
                    fontFamily: 'ui-monospace, monospace', fontSize: '0.68rem', letterSpacing: '0.03em',
                  }}>
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assignee */}
          <div>
            <FieldLabel>Assignee</FieldLabel>
            <select
              value={assigneeEmail}
              onChange={(e) => setAssigneeEmail(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 30px 8px 11px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: '#30363d',
                color: assigneeEmail ? '#e6edf3' : '#8b949e',
                fontFamily: 'inherit', fontSize: '0.83rem', cursor: 'pointer', outline: 'none',
                appearance: 'none', WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b949e' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
              }}
            >
              <option value="">Unassigned</option>
              {team.map((member) => (
                <option key={member.email || member.id} value={member.email}>
                  {member.full_name || member.email}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <FieldLabel>Due Date</FieldLabel>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 11px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: '#30363d',
                color: dueDate ? '#e6edf3' : '#8b949e',
                fontFamily: 'ui-monospace, monospace', fontSize: '0.83rem',
                outline: 'none', colorScheme: 'dark',
              }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {[{ label: 'Today', days: 0 }, { label: 'Tomorrow', days: 1 }, { label: 'Next Week', days: 7 }].map(({ label, days }) => (
                <button
                  key={label}
                  onClick={() => {
                    const d = new Date()
                    d.setDate(d.getDate() + days)
                    setDueDate(d.toISOString().split('T')[0])
                  }}
                  style={{ padding: '3px 8px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(255,255,255,0.06)', color: '#8b949e', fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '20px', paddingTop: '10px' }}>
            <MetaField label="Created" value={formatDate(task.created)} />
            <MetaField label="Updated" value={formatDate(task.updated)} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(218,54,51,0.3)', backgroundColor: 'transparent', color: '#da3633', fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Delete
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.10)', backgroundColor: 'transparent', color: '#8b949e', fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '8px 22px', borderRadius: '6px', border: 'none', backgroundColor: saving ? 'rgba(88,166,255,0.4)' : '#58a6ff', color: saving ? 'rgba(255,255,255,0.5)' : '#0a0e14', fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        taskTitle={task.title}
        onConfirm={async () => {
          setShowDeleteConfirm(false)
          const deleted = await deleteTask(task.id)
          if (!deleted) { onClose(); return }
          toast('Task deleted', {
            action: {
              label: 'Undo',
              onClick: () => createTask({
                title: deleted.title,
                description: deleted.description,
                project_name: deleted.project.name,
                project_color: deleted.project.color,
                priority: deleted.priority,
                due_date: deleted.due_date,
              }),
            },
          })
          onClose()
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>,
    document.body
  )
}
