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
          padding: '24px 24px 48px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Hero header */}
        <div className="relative rounded-3xl overflow-hidden mb-5 px-8 py-6 bg-primary/10 min-h-[120px] flex flex-col justify-center">
          <div className="absolute inset-0 z-0 opacity-30 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent blur-3xl" />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4">
            <h1 className="font-drama italic text-2xl text-primary m-0">Team Tasks</h1>

            {/* View toggle tabs */}
            <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-elevation-1">
              {VIEWS.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`px-4 py-1 rounded-md border-none cursor-pointer font-mono text-xs font-semibold tracking-wide transition-all duration-150 ${
                    activeView === view.id
                      ? 'bg-white text-foreground shadow-sm'
                      : 'bg-transparent text-foreground/40 hover:text-foreground/70'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
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
        theme="light"
        toastOptions={{
          style: {
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            color: '#2D2D2D',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.8rem',
          },
        }}
      />
    </div>
  )
}
