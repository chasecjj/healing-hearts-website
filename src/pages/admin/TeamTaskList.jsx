import { useEffect, useState, useCallback, useRef } from 'react'
import { useTeamTasks } from '../../stores/teamTasks'
import { useFilteredTasks } from '../../hooks/useFilteredTasks'
import { TaskFilterBar } from '../../components/admin/TaskFilterBar'
import { toast } from 'sonner'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 }
const STATUS_ORDER   = { todo: 0, in_progress: 1, in_review: 2, done: 3 }
const STATUS_LABEL   = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nameToColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash) % 360}, 45%, 55%)`
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDueDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function compare(a, b, key, dir) {
  let result = 0
  switch (key) {
    case 'title':    result = a.title.localeCompare(b.title); break
    case 'priority': result = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break
    case 'status':   result = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; break
    case 'due_date':
      if (!a.due_date && !b.due_date) result = 0
      else if (!a.due_date) result = 1
      else if (!b.due_date) result = -1
      else result = a.due_date.localeCompare(b.due_date)
      break
    case 'project':  result = a.project.name.localeCompare(b.project.name); break
    case 'assignee': result = (a.assignee?.name ?? '').localeCompare(b.assignee?.name ?? ''); break
    default: result = 0
  }
  return dir === 'asc' ? result : -result
}

function groupByProject(tasks) {
  const map = new Map()
  for (const task of tasks) {
    const key = task.project.name
    if (!map.has(key)) {
      map.set(key, { projectName: key, projectColor: task.project.color, tasks: [] })
    }
    map.get(key).tasks.push(task)
  }
  return Array.from(map.values())
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityFlag({ priority }) {
  const colors = { urgent: '#ef4444', high: '#f59e0b', normal: '#8b949e', low: '#484f58' }
  const color = colors[priority]
  const isFilled = priority === 'urgent' || priority === 'high'
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }} aria-label={`Priority: ${priority}`}>
      <path
        d="M3 2v12M3 2h8l-2 3.5L11 9H3"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill={isFilled ? color : 'none'}
        fillOpacity={priority === 'urgent' ? 0.3 : priority === 'high' ? 0.15 : 0}
      />
    </svg>
  )
}

function TaskCheckbox({ checked, onChange }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      role="checkbox"
      aria-checked={checked}
      style={{
        width: '18px', height: '18px', borderRadius: '6px',
        background: checked ? '#3fb950' : 'transparent',
        border: checked ? 'none' : '2px solid #484f58',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
        padding: 0, outline: 'none',
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.85)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function AssigneeAvatar({ assignee }) {
  if (!assignee) {
    return <span style={{ color: '#484f58', fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem' }}>--</span>
  }
  const ini = getInitials(assignee.name)
  const bgColor = nameToColor(assignee.name)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title={assignee.name}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', backgroundColor: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.6rem', fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: '#fff',
        flexShrink: 0, letterSpacing: '0.02em',
      }}>
        {ini}
      </div>
      <span style={{ fontSize: '0.78rem', color: '#8b949e', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        {assignee.name}
      </span>
    </div>
  )
}

function ColHeader({ label, sortKey, current, dir, onClick, width }) {
  const active = current === sortKey
  return (
    <th
      onClick={() => onClick(sortKey)}
      style={{
        padding: '10px 16px', textAlign: 'left',
        fontSize: '0.65rem', fontFamily: 'ui-monospace, monospace',
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: active ? '#58a6ff' : '#484f58',
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
        background: 'transparent', width: width ?? 'auto',
      }}
      role="columnheader"
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      {active && <span style={{ marginLeft: '4px', fontSize: '0.55rem', opacity: 0.8 }}>{dir === 'asc' ? '▲' : '▼'}</span>}
    </th>
  )
}

function ProjectGroupHeader({ name, color, count, collapsed, onToggle }) {
  return (
    <tr>
      <td colSpan={7} style={{ padding: 0 }}>
        <button
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '12px 16px', background: '#161b22', border: 'none',
            cursor: 'pointer', textAlign: 'left', outline: 'none',
          }}
          aria-expanded={!collapsed}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.15s ease', flexShrink: 0 }}>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#8b949e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
          <span style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', color: '#e6edf3', letterSpacing: '0.01em' }}>
            {name}
          </span>
          <span style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', fontWeight: 500,
            color: '#8b949e', backgroundColor: '#30363d', borderRadius: '6px', padding: '1px 8px', lineHeight: '1.5',
          }}>
            {count}
          </span>
        </button>
      </td>
    </tr>
  )
}

function TaskRow({ task, rowIndex, onSelect, onToggleStatus }) {
  const [hovered, setHovered] = useState(false)
  const isDone = task.status === 'done'
  const delay = Math.min(rowIndex * 0.03, 0.45)

  return (
    <tr
      onClick={() => onSelect(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#21262d' : rowIndex % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
        transition: 'background-color 0.12s ease',
        cursor: 'pointer',
        animation: `fadeInUp 0.3s ease ${delay}s both`,
        borderBottom: '1px solid rgba(65,71,82,0.1)',
      }}
    >
      <td style={{ padding: '10px 12px 10px 16px', width: '42px' }}>
        <TaskCheckbox checked={isDone} onChange={() => onToggleStatus(task.id, task.status)} />
      </td>
      <td style={{
        padding: '10px 16px',
        color: isDone ? '#484f58' : '#e6edf3',
        fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 500,
        maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.6 : 1,
      }}>
        {task.title}
      </td>
      <td style={{ padding: '10px 16px', width: '50px' }}>
        <PriorityFlag priority={task.priority} />
      </td>
      <td style={{
        padding: '10px 16px', fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
        color: task.due_date && new Date(task.due_date) < new Date() && !isDone ? '#da3633' : '#8b949e',
        fontWeight: task.due_date && new Date(task.due_date) < new Date() && !isDone ? 600 : 400,
        whiteSpace: 'nowrap', width: '80px',
      }}>
        {task.due_date ? formatDueDate(task.due_date) : '—'}
      </td>
      <td style={{ padding: '10px 16px', width: '100px' }}>
        <span style={{
          fontSize: '0.68rem', fontFamily: 'ui-monospace, monospace', fontWeight: 500,
          color: task.status === 'done' ? '#3fb950' : task.status === 'in_progress' ? '#58a6ff' : task.status === 'in_review' ? '#f59e0b' : '#8b949e',
        }}>
          {STATUS_LABEL[task.status]}
        </span>
      </td>
      <td style={{ padding: '10px 16px', width: '140px' }}>
        <span style={{
          display: 'inline-block',
          backgroundColor: task.project.color + '1A',
          border: `1px solid ${task.project.color}33`,
          color: task.project.color,
          borderRadius: '6px', padding: '2px 8px',
          fontSize: '0.65rem', fontFamily: 'ui-monospace, monospace', fontWeight: 500,
          whiteSpace: 'nowrap', lineHeight: '1.6',
        }}>
          {task.project.name}
        </span>
      </td>
      <td style={{ padding: '10px 16px', width: '160px' }}>
        <AssigneeAvatar assignee={task.assignee} />
      </td>
    </tr>
  )
}

function InlineNewTaskRow({ projectName }) {
  const { createTask } = useTeamTasks()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = async () => {
    const title = value.trim()
    if (!title) { setEditing(false); setValue(''); return }
    try {
      await createTask({ title, project_name: projectName })
      setValue('')
      inputRef.current?.focus()
    } catch {
      toast.error('Failed to create task')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit() }
    else if (e.key === 'Escape') { setEditing(false); setValue('') }
  }

  const handleBlur = () => {
    if (!value.trim()) { setEditing(false); setValue('') }
    else handleSubmit()
  }

  if (editing) {
    return (
      <tr style={{ borderBottom: '1px solid rgba(65,71,82,0.1)' }}>
        <td colSpan={7} style={{ padding: '6px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: '#58a6ff' }}>
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Task name..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 500, color: '#e6edf3', padding: '4px 0',
              }}
            />
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr
      onClick={() => setEditing(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#30363d' : 'transparent',
        transition: 'background-color 0.12s ease', cursor: 'pointer',
        borderBottom: '1px solid rgba(65,71,82,0.1)',
      }}
    >
      <td colSpan={7} style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#484f58' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 400 }}>New Task</span>
        </div>
      </td>
    </tr>
  )
}

function GroupRows({ group, isCollapsed, onToggle, onSelect, onToggleStatus }) {
  return (
    <>
      <ProjectGroupHeader
        name={group.projectName}
        color={group.projectColor}
        count={group.tasks.length}
        collapsed={isCollapsed}
        onToggle={onToggle}
      />
      {!isCollapsed && group.tasks.map((task, idx) => (
        <TaskRow
          key={task.id}
          task={task}
          rowIndex={idx}
          onSelect={onSelect}
          onToggleStatus={onToggleStatus}
        />
      ))}
      {!isCollapsed && <InlineNewTaskRow projectName={group.projectName} />}
    </>
  )
}

// ─── TeamTaskList ─────────────────────────────────────────────────────────────

export default function TeamTaskList() {
  const { loading, fetchTasks, selectTask, updateTaskStatus } = useTeamTasks()
  const [sortKey, setSortKey] = useState('due_date')
  const [sortDir, setSortDir] = useState('asc')
  const [collapsed, setCollapsed] = useState(new Set())

  useEffect(() => {
    fetchTasks()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return key
      }
      setSortDir('asc')
      return key
    })
  }, [])

  const toggleCollapse = useCallback((projectName) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(projectName)) next.delete(projectName)
      else next.add(projectName)
      return next
    })
  }, [])

  const handleToggleStatus = useCallback(
    (taskId, currentStatus) => {
      const nextStatus = currentStatus === 'done' ? 'todo' : 'done'
      updateTaskStatus(taskId, nextStatus)
      if (nextStatus === 'done') {
        toast('Task completed', {
          action: { label: 'Undo', onClick: () => updateTaskStatus(taskId, 'todo') },
        })
      }
    },
    [updateTaskStatus]
  )

  const filtered = useFilteredTasks()
  const sorted = [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir))
  const groups = groupByProject(sorted)

  if (loading) {
    return <div style={{ color: '#8b949e', fontSize: '0.875rem', padding: '32px 0' }}>Loading…</div>
  }

  return (
    <div>
      <TaskFilterBar />
      <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'inherit' }} role="grid">
          <thead>
            <tr style={{ backgroundColor: '#161b22', borderTop: '1px solid rgba(65,71,82,0.2)', borderBottom: '1px solid rgba(65,71,82,0.2)' }}>
              <th style={{ width: '42px', padding: '10px 12px 10px 16px' }} />
              <ColHeader label="Title"    sortKey="title"    current={sortKey} dir={sortDir} onClick={handleSort} />
              <ColHeader label="Priority" sortKey="priority" current={sortKey} dir={sortDir} onClick={handleSort} width="50px" />
              <ColHeader label="Due"      sortKey="due_date" current={sortKey} dir={sortDir} onClick={handleSort} width="80px" />
              <ColHeader label="Status"   sortKey="status"   current={sortKey} dir={sortDir} onClick={handleSort} width="100px" />
              <ColHeader label="Project"  sortKey="project"  current={sortKey} dir={sortDir} onClick={handleSort} width="140px" />
              <ColHeader label="Assignee" sortKey="assignee" current={sortKey} dir={sortDir} onClick={handleSort} width="160px" />
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: '#8b949e', fontSize: '0.85rem' }}>
                  No tasks found.
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <GroupRows
                  key={group.projectName}
                  group={group}
                  isCollapsed={collapsed.has(group.projectName)}
                  onToggle={() => toggleCollapse(group.projectName)}
                  onSelect={selectTask}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}
