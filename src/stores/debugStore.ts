import { create } from 'zustand'
import type {
  AgentLLMRequestEvent,
  AgentLLMResponseEvent,
} from '../types'

/** 单条 LLM 请求/响应对（一次迭代） */
export interface LLMTraceEntry {
  /** 唯一 id（taskId-iteration-requestTime） */
  id: string
  taskId: string
  iteration: number
  timestamp: number
  request?: AgentLLMRequestEvent
  response?: AgentLLMResponseEvent
}

/** 每个 trace 条目允许的最大数量，超出后丢弃最旧的（避免长任务内存膨胀） */
const MAX_TRACES_PER_TASK = 200

interface DebugState {
  tracesByTask: Record<string, LLMTraceEntry[]>

  addRequest: (taskId: string, request: AgentLLMRequestEvent) => void
  addResponse: (taskId: string, response: AgentLLMResponseEvent) => void
  clearTask: (taskId: string) => void
  clearAll: () => void
}

function appendTrace(
  list: LLMTraceEntry[],
  entry: LLMTraceEntry
): LLMTraceEntry[] {
  const next = [...list, entry]
  return next.length > MAX_TRACES_PER_TASK
    ? next.slice(next.length - MAX_TRACES_PER_TASK)
    : next
}

/**
 * 匹配策略：响应优先挂到同 iteration 且尚无响应的条目上；
 * 若该 iteration 已有完整配对（流式重放等场景），则新建条目。
 */
function upsert(
  list: LLMTraceEntry[],
  taskId: string,
  iteration: number,
  patch: Pick<LLMTraceEntry, 'request' | 'response'>
): LLMTraceEntry[] {
  // 从后往前找同 iteration 且对应槽位为空的条目
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const entry = list[i]
    if (entry.iteration !== iteration) continue
    if (patch.response && !entry.response) {
      const next = [...list]
      next[i] = { ...entry, response: patch.response }
      return next
    }
    if (patch.request && !entry.request) {
      const next = [...list]
      next[i] = { ...entry, request: patch.request }
      return next
    }
  }
  return appendTrace(list, {
    id: `trace-${taskId}-${iteration}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    taskId,
    iteration,
    timestamp: Date.now(),
    ...patch,
  })
}

export const useDebugStore = create<DebugState>((set, get) => ({
  tracesByTask: {},

  addRequest: (taskId, request) => {
    const current = get().tracesByTask[taskId] ?? []
    set({
      tracesByTask: {
        ...get().tracesByTask,
        [taskId]: upsert(current, taskId, request.iteration, {
          request,
        }),
      },
    })
  },

  addResponse: (taskId, response) => {
    const current = get().tracesByTask[taskId] ?? []
    set({
      tracesByTask: {
        ...get().tracesByTask,
        [taskId]: upsert(current, taskId, response.iteration, {
          response,
        }),
      },
    })
  },

  clearTask: (taskId) => {
    const nextMap = { ...get().tracesByTask }
    delete nextMap[taskId]
    set({ tracesByTask: nextMap })
  },

  clearAll: () => set({ tracesByTask: {} }),
}))
