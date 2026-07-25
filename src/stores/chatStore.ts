import { create } from 'zustand'
import type { Message, MessageRole, ToolCall, ToolResult } from '../types'
import { db } from '../services/db'

interface ChatState {
  messagesByTask: Record<string, Message[]>
  streamingTasks: Set<string>

  loadMessages: (taskId: string) => Promise<void>
  addMessage: (taskId: string, message: Message) => Promise<void>
  appendTextDelta: (taskId: string, content: string) => void
  addToolCall: (taskId: string, toolCall: ToolCall) => void
  addToolResult: (taskId: string, toolResult: ToolResult) => void
  setStreaming: (taskId: string, streaming: boolean) => void
  clearMessages: (taskId: string) => Promise<void>
  createAssistantMessage: (taskId: string) => Promise<string>
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function persistMessage(message: Message): Promise<void> {
  await db.messages.put(message)
}

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByTask: {},
  streamingTasks: new Set<string>(),

  loadMessages: async (taskId) => {
    const messages = await db.messages
      .where('taskId')
      .equals(taskId)
      .sortBy('createdAt')
    set({
      messagesByTask: {
        ...get().messagesByTask,
        [taskId]: messages,
      },
    })
  },

  addMessage: async (taskId, message) => {
    await persistMessage(message)
    const current = get().messagesByTask[taskId] ?? []
    set({
      messagesByTask: {
        ...get().messagesByTask,
        [taskId]: [...current, message],
      },
    })
  },

  appendTextDelta: (taskId, content) => {
    const current = get().messagesByTask[taskId] ?? []
    if (current.length === 0) return
    const last = current[current.length - 1]
    if (last.role !== 'assistant') return
    const updated: Message = { ...last, content: last.content + content }
    const nextList = [...current.slice(0, -1), updated]
    set({
      messagesByTask: {
        ...get().messagesByTask,
        [taskId]: nextList,
      },
    })
    // 异步持久化
    void persistMessage(updated)
  },

  addToolCall: (taskId, toolCall) => {
    const current = get().messagesByTask[taskId] ?? []
    if (current.length === 0) return
    const last = current[current.length - 1]
    if (last.role !== 'assistant') return
    const toolCalls = [...(last.toolCalls ?? []), toolCall]
    const updated: Message = { ...last, toolCalls }
    const nextList = [...current.slice(0, -1), updated]
    set({
      messagesByTask: {
        ...get().messagesByTask,
        [taskId]: nextList,
      },
    })
    void persistMessage(updated)
  },

  addToolResult: (taskId, toolResult) => {
    const current = get().messagesByTask[taskId] ?? []
    if (current.length === 0) return
    const last = current[current.length - 1]
    if (last.role !== 'assistant') return
    const toolResults = [...(last.toolResults ?? []), toolResult]
    const updated: Message = { ...last, toolResults }
    const nextList = [...current.slice(0, -1), updated]
    set({
      messagesByTask: {
        ...get().messagesByTask,
        [taskId]: nextList,
      },
    })
    void persistMessage(updated)
  },

  setStreaming: (taskId, streaming) => {
    const next = new Set(get().streamingTasks)
    if (streaming) {
      next.add(taskId)
    } else {
      next.delete(taskId)
    }
    set({ streamingTasks: next })
  },

  clearMessages: async (taskId) => {
    await db.messages.where('taskId').equals(taskId).delete()
    const nextMap = { ...get().messagesByTask }
    delete nextMap[taskId]
    set({ messagesByTask: nextMap })
  },

  createAssistantMessage: async (taskId) => {
    const message: Message = {
      id: generateId(),
      taskId,
      role: 'assistant' as MessageRole,
      content: '',
      createdAt: Date.now(),
    }
    await get().addMessage(taskId, message)
    return message.id
  },
}))
