import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useTeamTasks } from '../../stores/teamTasks'
import { useFilteredTasks } from '../../hooks/useFilteredTasks'
import { TaskFilterBar } from '../../components/admin/TaskFilterBar'
import { AddTaskDialog } from '../../components/admin/AddTaskDialog'
import { toast } from 'sonner'

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS = [
  { status: 'todo',        label: 'To Do',      color: '#8b949e' },
  { status: 'in_progress', label: 'In Progress', color: '#58a6ff' },
  { status: 'in_review',   label: 'In Review',   color: '#f59e0b' },
  { status: 'done',        label: 'Done',        color: '#3fb950' },
]

const PRIORITY_COLOR = {
  urgent: '#ef4444',
  high:   '#f59e0b',
  normal: '#484f58',
  low:    '#484f58',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nameToHue(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

function initials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase()
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

// ─── KanbanCard ───────────────────────────────────────────────────────────────

function KanbanCard({ task, onClick, isDragging = false, isOverlay = false }) {
  const [hovered, setHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task },
    disabled: isOverlay,
  })

  const hue = task.assignee ? nameToHue(task.assignee.name) : 0
  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  const transformStyle = transform && !isOverlay
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {}

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      onClick={!isDragging ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...(isOverlay ? {} : { ...listeners, ...attributes })}
      style={{
        position: 'relative',
        backgroundColor: isDragging || isOverlay || hovered ? '#30363d' : '#21262d',
        borderRadius: '8px',
        padding: '14px',
        borderLeft: `3px solid ${task.project.color}`,
        boxShadow: isDragging || isOverlay ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        cursor: isDragging || isOverlay ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'background-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        ...(isDragging ? {
          ...transformStyle,
          opacity: 0.7,
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.02)` : 'scale(1.02)',
          zIndex: 999,
        } : transformStyle),
        ...(isOverlay ? { opacity: 0.95, transform: 'scale(1.02)', zIndex: 999 } : {}),
      }}
    >
      {/* Priority dot */}
      <span title={task.priority} style={{
        position: 'absolute', top: '10px', right: '10px',
        width: '8px', height: '8px', borderRadius: '50%',
        backgroundColor: PRIORITY_COLOR[task.priority], flexShrink: 0,
      }} />

      {/* Project pill */}
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          backgroundColor: task.project.color + '2a', color: task.project.color,
          borderRadius: '6px', padding: '2px 7px',
          fontSize: '0.625rem', fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.03em', lineHeight: '1.4',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: task.project.color, flexShrink: 0 }} />
          {task.project.name}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: '0.85rem', color: '#e6edf3', lineHeight: '1.45', paddingRight: '18px' }}>
        {task.title}
      </div>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {task.labels.map((lbl) => (
            <span key={lbl.name} style={{
              backgroundColor: lbl.color + '2a', color: lbl.color,
              borderRadius: '4px', padding: '1px 5px',
              fontSize: '0.6rem', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.02em',
            }}>
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
        {formattedDate ? (
          <span style={{
            fontSize: '0.68rem', fontFamily: 'ui-monospace, monospace',
            color: isOverdue ? '#da3633' : '#8b949e',
            opacity: isOverdue ? 1 : 0.75, fontWeight: isOverdue ? 600 : 400,
          }}>
            {formattedDate}
          </span>
        ) : <span />}

        {task.assignee && (
          <span title={task.assignee.name} style={{
            width: '22px', height: '22px', borderRadius: '50%',
            backgroundColor: `hsl(${hue} 45% 28%)`, color: `hsl(${hue} 70% 75%)`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.575rem', fontFamily: 'ui-monospace, monospace',
            fontWeight: 700, letterSpacing: '0.02em', flexShrink: 0,
          }}>
            {initials(task.assignee.name)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

function KanbanColumn({ status, label, labelColor, tasks, onTaskClick, onAddTask, activeTaskId, isDropTarget }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const columnBg = isOver || isDropTarget ? '#30363d' : '#21262d'

  return (
    <div style={{
      flex: '0 0 auto', width: '260px',
      backgroundColor: columnBg, borderRadius: '8px', padding: '12px',
      display: 'flex', flexDirection: 'column', minHeight: '200px',
      overflow: 'hidden', transition: 'background-color 0.15s ease',
    }}>
      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
        <span style={{
          fontSize: '0.68rem', fontFamily: 'ui-monospace, monospace', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.09em', color: labelColor,
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.625rem', fontFamily: 'ui-monospace, monospace',
          color: labelColor, backgroundColor: labelColor + '22',
          borderRadius: '10px', padding: '1px 7px', lineHeight: '1.6',
        }}>
          {tasks.length}
        </span>
        {onAddTask && (
          <button
            onClick={onAddTask}
            title="Add task"
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              padding: '3px 6px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: labelColor, opacity: 0.6,
              transition: 'opacity 150ms ease, background 150ms ease',
              fontSize: '1rem', lineHeight: 1, flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = labelColor + '22' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="kanban-cards"
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}
      >
        {tasks.length === 0 ? (
          <div style={{
            margin: 'auto 0', padding: '18px 12px', borderRadius: '8px',
            border: '1px dashed #484f58', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.72rem', color: '#484f58', fontStyle: 'italic' }}>
              Nothing here yet
            </span>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div key={task.id} style={{ animation: `fadeInUp 0.25s ease ${Math.min(index * 0.05, 0.45)}s both` }}>
              <KanbanCard
                task={task}
                onClick={onTaskClick ? () => onTaskClick(task) : undefined}
                isDragging={activeTaskId === task.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── TeamKanban ───────────────────────────────────────────────────────────────

export default function TeamKanban() {
  const { tasks, loading, fetchTasks, selectTask, updateTaskStatus, filters } = useTeamTasks()
  const filtered = useFilteredTasks()
  const [activeTask, setActiveTask] = useState(null)
  const [overColumnStatus, setOverColumnStatus] = useState(null)
  const [addTaskOpen, setAddTaskOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    fetchTasks()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tasksByStatus = (status) => filtered.filter((t) => t.status === status)

  function handleDragStart(event) {
    const task = tasks.find((t) => t.id === event.active.id) ?? null
    setActiveTask(task)
  }

  function handleDragOver(event) {
    setOverColumnStatus(event.over ? event.over.id : null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveTask(null)
    setOverColumnStatus(null)
    if (!over) return

    const taskId = active.id
    const newStatus = over.id
    const task = tasks.find((t) => t.id === taskId)

    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus)
      if (newStatus === 'done') {
        toast('Task completed', {
          action: { label: 'Undo', onClick: () => updateTaskStatus(taskId, 'todo') },
        })
      }
    }
  }

  function handleDragCancel() {
    setActiveTask(null)
    setOverColumnStatus(null)
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TaskFilterBar />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className="kanban-board"
          style={{
            display: 'flex', gap: '12px', flex: 1,
            overflowX: 'auto', overflowY: 'hidden',
            paddingBottom: '12px', alignItems: 'stretch',
          }}
        >
          {COLUMNS.map((col) => {
            const doneHidden = col.status === 'done' && filters.hideCompleted && tasks.some((t) => t.status === 'done')
            return (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                labelColor={col.color}
                tasks={doneHidden ? [] : tasksByStatus(col.status)}
                onTaskClick={selectTask}
                onAddTask={col.status === 'todo' ? () => setAddTaskOpen(true) : undefined}
                activeTaskId={activeTask?.id ?? null}
                isDropTarget={overColumnStatus === col.status}
              />
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <AddTaskDialog open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />

      <style>{`
        .kanban-board, .kanban-cards {
          scrollbar-width: thin;
          scrollbar-color: #31353c transparent;
        }
        .kanban-board::-webkit-scrollbar, .kanban-cards::-webkit-scrollbar { width: 6px; height: 6px; }
        .kanban-board::-webkit-scrollbar-thumb, .kanban-cards::-webkit-scrollbar-thumb { background-color: #31353c; border-radius: 3px; }
        .kanban-board::-webkit-scrollbar-track, .kanban-cards::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}
