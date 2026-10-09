import { useCallback, useEffect, useRef, useState } from 'react'
import { message as antdMessage } from 'antd'
import type {
  AgentEvent,
  AgentStatusChange,
  AgentTextDelta,
  AgentToolCallEvent,
  AgentToolResultEvent,
  Message,
  TaskStatus,
} from '../types'
import { ipc } from '../services/ipc'
import { useChatStore } from '../stores/chatStore'
import { useTaskStore } from '../stores/taskStore'
import { useSettingsStore } from '../stores/settingsStore'

interface UseAgentReturn {
  execute: (userMessage: string) => Promise<void>
  stop: () => void
  isRunning: boolean
}

export function useAgent(taskId: string | null): UseAgentReturn {
  const [isRunning, setIsRunning] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const chatStore = useChatStore
  const taskStore = useTaskStore
  const settingsStore = useSettingsStore

  // 监听 Agent 事件
  useEffect(() => {
    if (!taskId) {
      setIsRunning(false)
      return
    }

    // 检查是否正在流式输出
    const streaming = chatStore.getState().streamingTasks.has(taskId)
    setIsRunning(streaming)

    const unsubscribe = ipc.onAgentEvent((event) => {
      const agentEvent = event as AgentEvent
      if (agentEvent.taskId !== taskId) return

      switch (agentEvent.type) {
        case 'text_delta': {
          const data = agentEvent.data as AgentTextDelta
          chatStore.getState().appendTextDelta(taskId, data.content)
          break
        }
        case 'tool_call': {
          const data = agentEvent.data as AgentToolCallEvent
          chatStore.getState().addToolCall(taskId, {
            id: data.toolCallId,
            name: data.toolName,
            arguments: data.arguments,
          })
          break
        }
        case 'tool_result': {
          const data = agentEvent.data as AgentToolResultEvent
          chatStore.getState().addToolResult(taskId, {
            toolCallId: data.toolCallId,
            name: data.toolName,
            output: data.output,
            isError: data.isError,
          })
          break
        }
        case 'status_change': {
          const data = agentEvent.data as AgentStatusChange
          void taskStore.getState().updateTask(taskId, {
            status: data.status as TaskStatus,
          })
          break
        }
        case 'task_complete': {
          chatStore.getState().setStreaming(taskId, false)
          void taskStore.getState().updateTask(taskId, { status: 'completed' })
          setIsRunning(false)
          break
        }
        case 'error': {
          const data = agentEvent.data as { message?: string }
          chatStore.getState().setStreaming(taskId, false)
          void taskStore.getState().updateTask(taskId, { status: 'failed' })
          setIsRunning(false)
          antdMessage.error(data?.message ?? 'Agent 执行失败')
          break
        }
        default:
          break
      }
    })

    unsubscribeRef.current = unsubscribe
    return () => {
      unsubscribe()
      unsubscribeRef.current = null
    }
  }, [taskId, chatStore, taskStore])

  const execute = useCallback(
    async (userMessage: string) => {
      if (!taskId) {
        antdMessage.warning('请先选择一个任务')
        return
      }
      if (!userMessage.trim()) {
        antdMessage.warning('请输入消息内容')
        return
      }

      const task = taskStore.getState().tasks.find((t) => t.id === taskId)
      if (!task) {
        antdMessage.error('任务不存在')
        return
      }

      const modelsConfig = settingsStore.getState().modelsConfig
      // 优先用任务绑定的模型，其次全局默认模型
      const modelConfig =
        modelsConfig.models.find((m) => m.id === task.modelId) ??
        modelsConfig.models.find((m) => m.id === modelsConfig.defaultModel) ??
        modelsConfig.models[0]
      if (!modelConfig) {
        antdMessage.error('未配置任何模型，请先在设置中添加模型')
        return
      }
      if (!modelConfig.apiKey) {
        antdMessage.error(
          `模型 ${modelConfig.name || modelConfig.id} 未配置 API Key，请在设置中填写`
        )
        return
      }

      // 1. 添加用户消息
      const userMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        taskId,
        role: 'user',
        content: userMessage,
        createdAt: Date.now(),
      }
      await chatStore.getState().addMessage(taskId, userMsg)

      // 2. 创建 assistant 占位消息
      await chatStore.getState().createAssistantMessage(taskId)

      // 3. 标记流式输出 + 任务状态
      chatStore.getState().setStreaming(taskId, true)
      setIsRunning(true)
      await taskStore.getState().updateTask(taskId, { status: 'running' })

      // 4. 收集历史消息
      const history = chatStore.getState().messagesByTask[taskId] ?? []
      const historyMessages = history
        .filter((m) => m.id !== userMsg.id)
        .map((m) => ({
          role: m.role,
          content: m.content,
          toolCalls: m.toolCalls,
          toolResults: m.toolResults,
        }))

      // 5. 调用 ipc 执行
      const result = await ipc.agentExecute({
        taskId,
        userMessage,
        mode: task.mode,
        modelConfig,
        workspacePath: task.workspacePath,
        historyMessages,
      })

      if (!result.success) {
        chatStore.getState().setStreaming(taskId, false)
        setIsRunning(false)
        await taskStore.getState().updateTask(taskId, { status: 'failed' })
        antdMessage.error(result.error ?? 'Agent 执行失败')
      }
    },
    [taskId, chatStore, taskStore, settingsStore]
  )

  const stop = useCallback(() => {
    if (!taskId) return
    ipc.agentStop(taskId)
    chatStore.getState().setStreaming(taskId, false)
    setIsRunning(false)
    void taskStore.getState().updateTask(taskId, { status: 'stopped' })
  }, [taskId, chatStore, taskStore])

  return { execute, stop, isRunning }
}
