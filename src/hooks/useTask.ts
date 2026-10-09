import { useCallback } from 'react'
import type { Task, TaskMode } from '../types'
import { useTaskStore } from '../stores/taskStore'
import { useChatStore } from '../stores/chatStore'
import { useResultStore } from '../stores/resultStore'

interface UseTaskReturn {
  createAndSelect: (
    title: string,
    mode: TaskMode,
    modelId: string,
    workspacePath?: string
  ) => Promise<string>
  update: (id: string, updates: Partial<Task>) => Promise<void>
  remove: (id: string) => Promise<void>
  archive: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
}

export function useTask(): UseTaskReturn {
  const taskStore = useTaskStore
  const chatStore = useChatStore
  const resultStore = useResultStore

  const createAndSelect = useCallback(
    async (title: string, mode: TaskMode, modelId: string, workspacePath?: string) => {
      const wsPath = workspacePath ?? `~/openbudy-workspace/${Date.now()}/`
      const id = await taskStore.getState().createTask(title, mode, modelId, wsPath)
      taskStore.getState().selectTask(id)
      // 预初始化空消息列表
      chatStore.getState().loadMessages(id)
      resultStore.getState().clear()
      return id
    },
    [taskStore, chatStore, resultStore]
  )

  const update = useCallback(
    (id: string, updates: Partial<Task>) =>
      taskStore.getState().updateTask(id, updates),
    [taskStore]
  )

  const remove = useCallback(
    async (id: string) => {
      // 清理相关 store 数据
      await chatStore.getState().clearMessages(id)
      resultStore.getState().clear()
      await taskStore.getState().deleteTask(id)
    },
    [taskStore, chatStore, resultStore]
  )

  const archive = useCallback(
    (id: string) => taskStore.getState().archiveTask(id),
    [taskStore]
  )

  const togglePin = useCallback(
    (id: string) => taskStore.getState().togglePin(id),
    [taskStore]
  )

  return { createAndSelect, update, remove, archive, togglePin }
}
