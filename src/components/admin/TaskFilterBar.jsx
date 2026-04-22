import { useMemo } from 'react'
import { useTeamTasks } from '../../stores/teamTasks'

const SELECT_STYLE = {
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundColor: '#30363d',
  color: '#8b949e',
  fontFamily: 'ui-monospace, monospace',
  fontSize: '0.75rem',
  borderRadius: '6px',
  border: 'none',
  padding: '4px 26px 4px 10px',
  cursor: 'pointer',
  outline: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23c0c7d4' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  backgroundSize: '10px 6px',
  lineHeight: 1.5,
  minWidth: '110px',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]

export function TaskFilterBar() {
  const { tasks, filters, setFilter } = useTeamTasks()

  // Derive unique project names from the current task list
  const projects = useMemo(() => {
    const seen = new Set()
    for (const t of tasks) {
      if (t.project?.name) seen.add(t.project.name)
    }
    return Array.from(seen).sort()
  }, [tasks])

  // Derive unique assignees (email → name)
  const assignees = useMemo(() => {
    const seen = new Map()
    for (const t of tasks) {
      if (t.assignee && !seen.has(t.assignee.email)) {
        seen.set(t.assignee.email, t.assignee.name)
      }
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [tasks])

  // Derive unique labels
  const labels = useMemo(() => {
    const seen = new Set()
    for (const t of tasks) {
      for (const l of t.labels) seen.add(l.name)
    }
    return Array.from(seen).sort()
  }, [tasks])

  const activeFilterCount = [
    filters.status,
    filters.project,
    filters.assignee,
    filters.priority,
    filters.label,
    filters.hideCompleted ? 'on' : undefined,
  ].filter(Boolean).length

  const filterDropdowns = (
    <>
      <select
        value={filters.status ?? ''}
        onChange={(e) => setFilter('status', e.target.value || undefined)}
        style={SELECT_STYLE}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={filters.project ?? ''}
        onChange={(e) => setFilter('project', e.target.value || undefined)}
        style={SELECT_STYLE}
        aria-label="Filter by project"
      >
        <option value="">All Projects</option>
        {projects.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      <select
        value={filters.assignee ?? ''}
        onChange={(e) => setFilter('assignee', e.target.value || undefined)}
        style={SELECT_STYLE}
        aria-label="Filter by assignee"
      >
        <option value="">All Assignees</option>
        {assignees.map(([email, name]) => (
          <option key={email} value={email}>{name}</option>
        ))}
      </select>

      <select
        value={filters.priority ?? ''}
        onChange={(e) => setFilter('priority', e.target.value || undefined)}
        style={SELECT_STYLE}
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {labels.length > 0 && (
        <select
          value={filters.label ?? ''}
          onChange={(e) => setFilter('label', e.target.value || undefined)}
          style={SELECT_STYLE}
          aria-label="Filter by label"
        >
          <option value="">All Labels</option>
          {labels.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      )}

      <button
        onClick={() => setFilter('hideCompleted', !filters.hideCompleted)}
        style={{
          ...SELECT_STYLE,
          backgroundColor: filters.hideCompleted ? 'rgba(88,166,255,0.15)' : '#30363d',
          color: filters.hideCompleted ? '#58a6ff' : '#8b949e',
          border: filters.hideCompleted ? '1px solid rgba(88,166,255,0.3)' : 'none',
          minWidth: 'auto',
          padding: '4px 12px',
        }}
      >
        {filters.hideCompleted ? '✓ ' : ''}Hide Done
      </button>
    </>
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      <input
        type="text"
        value={filters.search ?? ''}
        onChange={(e) => setFilter('search', e.target.value || undefined)}
        placeholder="Filter tasks..."
        style={{
          ...SELECT_STYLE,
          minWidth: '140px',
          backgroundImage: 'none',
          paddingRight: '10px',
        }}
      />
      {filterDropdowns}
      {activeFilterCount > 0 && (
        <button
          onClick={() => {
            setFilter('status', undefined)
            setFilter('project', undefined)
            setFilter('assignee', undefined)
            setFilter('priority', undefined)
            setFilter('label', undefined)
            setFilter('hideCompleted', false)
            setFilter('search', undefined)
          }}
          style={{
            ...SELECT_STYLE,
            minWidth: 'auto',
            padding: '4px 10px',
            backgroundColor: 'rgba(239,68,68,0.12)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          Clear ({activeFilterCount})
        </button>
      )}
    </div>
  )
}
