import { useMemo } from 'react'
import { useTeamTasks } from '../stores/teamTasks'

export function useFilteredTasks(tasks) {
  const { tasks: storeTasks, filters } = useTeamTasks()
  const source = tasks ?? storeTasks

  return useMemo(() => {
    let result = source

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status)
    }
    if (filters.project) {
      result = result.filter((t) => t.project.name === filters.project)
    }
    if (filters.assignee) {
      result = result.filter((t) => t.assignee?.email === filters.assignee)
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority)
    }
    if (filters.label) {
      result = result.filter((t) => t.labels.some((l) => l.name === filters.label))
    }
    if (filters.hideCompleted) {
      result = result.filter((t) => t.status !== 'done')
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((t) => (t.title ?? '').toLowerCase().includes(q))
    }
    return result
  }, [source, filters.status, filters.project, filters.assignee, filters.priority, filters.label, filters.hideCompleted, filters.search])
}
