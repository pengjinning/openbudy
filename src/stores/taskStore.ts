import { create } from 'zustand'
import type { Task, TaskMode, TaskStatus } from '../types'
import { db } from '../services/db'

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  searchQuery: string
  filterStatus: TaskStatus | 'all'
  loading: boolean

  loadTasks: () => Promise<void>
  createTask: (
    title: string,
    mode: TaskMode,
    modelId: string,
    workspacePath: string
  ) => Promise<string>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  selectTask: (id: string | null) => void
  archiveTask: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterStatus: (status: TaskStatus | 'all') => void
}

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  searchQuery: '',
  filterStatus: 'all',
  loading: false,

  loadTasks: async () => {
    set({ loading: true })
    try {
      const tasks = await db.tasks.orderBy('updatedAt').reverse().toArray()
      set({ tasks })
    } finally {
      set({ loading: false })
    }
  },

  createTask: async (title, mode, modelId, workspacePath) => {
    const now = Date.now()
    const task: Task = {
      id: generateId(),
      title,
      mode,
      status: 'planning',
      workspacePath,
      modelId,
      createdAt: now,
      updatedAt: now,
      pinned: false,
    }
    await db.tasks.put(task)
    set({ tasks: [task, ...get().tasks] })
    return task.id
  },

  updateTask: async (id, updates) => {
    const existing = await db.tasks.get(id)
    if (!existing) return
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    }
    await db.tasks.put(updated)
    set({
      tasks: get().tasks.map((t) => (t.id === id ? updated : t)),
    })
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id)
    // 同步删除关联消息和产物
    await db.messages.where('taskId').equals(id).delete()
    await db.artifacts.where('taskId').equals(id).delete()
    const remaining = get().tasks.filter((t) => t.id !== id)
    const nextSelected =
      get().selectedTaskId === id
        ? (remaining[0]?.id ?? null)
        : get().selectedTaskId
    set({ tasks: remaining, selectedTaskId: nextSelected })
  },

  selectTask: (id) => set({ selectedTaskId: id }),

  archiveTask: async (id) => {
    await get().updateTask(id, { status: 'archived' })
  },

  togglePin: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    await get().updateTask(id, { pinned: !task.pinned })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterStatus: (status) => set({ filterStatus: status }),
}))
