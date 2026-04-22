import { useState } from 'react'
import { Toaster } from 'sonner'
import { useTeamTasks } from '../../stores/teamTasks'
import { TaskDetailPanel } from '../../components/admin/TaskDetailPanel'
import TeamKanban from './TeamKanban'
import TeamTaskList from './TeamTaskList'

const VIEWS = [
  { id: 'kanban', label: 'Kanban' },
  { id: 'list',   label: 'List' },
]

export default function TasksLayout() {
  const [activeView, setActiveView] = useState('kanban')
  const { selectedTask, selectTask } = useTeamTasks()

  return (
    <div className="w-full min-h-screen bg-background">
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '120px 24px 48px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '1.25rem', color: '#e6edf3', margin: 0 }}>
            Team Tasks
          </h1>

          {/* View toggle tabs */}
          <div style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: '#21262d', borderRadius: '8px', padding: '3px', gap: '2px',
          }}>
            {VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                style={{
                  padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', fontWeight: 600,
                  letterSpacing: '0.03em', transition: 'all 0.15s ease',
                  backgroundColor: activeView === view.id ? '#30363d' : 'transparent',
                  color: activeView === view.id ? '#e6edf3' : '#8b949e',
                }}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active view */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeView === 'kanban' ? <TeamKanban /> : <TeamTaskList />}
        </div>
      </div>

      {/* Task detail panel (slide-over, rendered when a task is selected) */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => selectTask(null)}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            backgroundColor: '#21262d',
            border: '1px solid #30363d',
            color: '#e6edf3',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.8rem',
          },
        }}
      />
    </div>
  )
}
