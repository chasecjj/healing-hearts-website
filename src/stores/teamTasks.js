import { create } from 'zustand'
import { supabase } from '../lib/supabase'

/**
 * Normalize a Supabase team_tasks row to the PHEDRIS Task shape so
 * ported UI components work without structural changes.
 */
function normalize(row) {
  return {
    id: row.id, // string UUID
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    project: {
      id: row.project_name || 'General',
      name: row.project_name || 'General',
      color: row.project_color || '#58a6ff',
    },
    assignee: row.assignee_email
      ? {
          email: row.assignee_email,
          name: row.assignee_name || row.assignee_email,
          avatar: '',
        }
      : null,
    due_date: row.due_date || null,
    created: row.created_at,
    updated: row.updated_at,
    labels: Array.isArray(row.labels) ? row.labels : [],
  }
}

export const useTeamTasks = create((set, get) => ({
  tasks: [],
  loading: false,
  filters: { hideCompleted: false },
  selectedTask: null,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('team_tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ tasks: (data || []).map(normalize), loading: false })
    } catch (err) {
      console.error('fetchTasks failed:', err)
      set({ loading: false })
    }
  },

  createTask: async (data) => {
    const row = {
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'normal',
      project_name: data.project_name || 'General',
      project_color: data.project_color || '#58a6ff',
      assignee_id: data.assignee_id || null,
      assignee_name: data.assignee_name || null,
      assignee_email: data.assignee_email || null,
      due_date: data.due_date || null,
      labels: data.labels || [],
    }
    const { data: created, error } = await supabase
      .from('team_tasks')
      .insert(row)
      .select()
      .single()
    if (error) throw error
    get().fetchTasks()
    return normalize(created)
  },

  updateTask: async (id, updates) => {
    const row = {}
    if (updates.title !== undefined) row.title = updates.title
    if (updates.description !== undefined) row.description = updates.description
    if (updates.status !== undefined) row.status = updates.status
    if (updates.priority !== undefined) row.priority = updates.priority
    if (updates.due_date !== undefined) row.due_date = updates.due_date || null
    if (updates.assignee_email !== undefined) row.assignee_email = updates.assignee_email || null
    if (updates.assignee_name !== undefined) row.assignee_name = updates.assignee_name || null
    if (updates.project_name !== undefined) row.project_name = updates.project_name
    if (updates.project_color !== undefined) row.project_color = updates.project_color

    const { error } = await supabase.from('team_tasks').update(row).eq('id', id)
    if (error) {
      console.error('updateTask failed:', error)
      throw error
    }
    set({ selectedTask: null })
    get().fetchTasks()
  },

  updateTaskStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }))
    const { error } = await supabase.from('team_tasks').update({ status }).eq('id', id)
    if (error) {
      console.error('updateTaskStatus failed:', error)
      get().fetchTasks()
    }
  },

  deleteTask: async (id) => {
    const taskIndex = get().tasks.findIndex((t) => t.id === id)
    const task = get().tasks[taskIndex]
    if (!task) return null

    // Optimistic removal
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
    }))

    const { error } = await supabase.from('team_tasks').delete().eq('id', id)
    if (error) {
      console.error('deleteTask failed, restoring task:', error)
      const tasks = [...get().tasks]
      tasks.splice(taskIndex, 0, task)
      set({ tasks })
    }
    return task
  },

  selectTask: (task) => set({ selectedTask: task }),

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }))
  },
}))
