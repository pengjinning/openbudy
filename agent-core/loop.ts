import type {
  AgentEvent,
  AgentLLMRequestEvent,
  AgentLLMResponseEvent,
  DebugLLMMessage,
  ModelConfig,
  ToolCall,
  ToolResult,
} from '../src/types'
import { buildAgentSystemPrompt } from './planner'
import { chatStreamViaPiAi } from './llm/pi-ai'
import type { LLMMessage } from './llm/client'
import { toolRegistry } from './tools/registry'
import { executeTools } from './executor'
import {
  MAX_ITERATIONS,
  TIMEOUT_MS,
  createTimer,
} from './monitor'

export interface AgentLoopParams {
  taskId: string
  userMessage: string
  modelConfig: ModelConfig
  workspacePath: string
  historyMessages: Array<{
    role: string
    content: string
    toolCalls?: ToolCall[]
    toolResults?: ToolResult[]
  }>
  signal?: AbortSignal
}

/**
 * 构造事件
 */
function emit(
  taskId: string,
  type: AgentEvent['type'],
  data: unknown
): AgentEvent {
  return { type, taskId, data, timestamp: Date.now() }
}

/**
 * 将 history 转换为 OpenAI 消息格式
 */
function historyToLLMMessages(
  history: AgentLoopParams['historyMessages']
): LLMMessage[] {
  const messages: LLMMessage[] = []
  for (const h of history) {
    // user / assistant 普通消息
    if (h.role === 'user' || h.role === 'assistant') {
      const msg: LLMMessage = { role: h.role, content: h.content }
      if (h.role === 'assistant' && h.toolCalls && h.toolCalls.length > 0) {
        msg.tool_calls = h.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments),
          },
        }))
      }
      messages.push(msg)
    }

    // 工具结果消息（每个 toolResult 一条 role=tool 消息）
    if (h.toolResults && h.toolResults.length > 0) {
      for (const tr of h.toolResults) {
        messages.push({
          role: 'tool',
          content: tr.output,
          tool_call_id: tr.toolCallId,
        })
      }
    }
  }
  return messages
}

/**
 * Agent Loop 主控制器
 *
 * 流程：
 * 1. 构建 messages: [system, ...history, user]
 * 2. ask 模式不传 tools
 * 3. 循环（最多 30 次）：
 *    a. 检查 signal 与超时
 *    b. 调用 chatStream()，逐 chunk 处理：text → onEvent('text_delta')；tool_call → 收集；done → break
 *    c. 无 tool_calls → onEvent('task_complete') 并 return
 *    d. 执行工具 → onEvent('tool_result')
 *    e. 将 tool results 追加到 messages
 *    f. 继续循环
 * 4. 超过 MAX_ITERATIONS → onEvent('error')
 */
export async function start(
  params: AgentLoopParams,
  onEvent: (event: AgentEvent) => void
): Promise<void> {
  const {
    taskId,
    userMessage,
    modelConfig,
    workspacePath,
    historyMessages,
    signal,
  } = params

  const timer = createTimer(TIMEOUT_MS)

  // 1. 构建 messages（系统提示由 Agent 自主决策何时用工具，不再区分手动模式）
  const systemPrompt = buildAgentSystemPrompt(workspacePath)
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...historyToLLMMessages(historyMessages),
    { role: 'user', content: userMessage },
  ]

  // 2. 始终提供全部工具，是否调用由模型根据提示词自主判断
  const tools = toolRegistry.getToolDefinitions()

  // 状态变更：running
  onEvent(
    emit(taskId, 'status_change', {
      status: 'running',
      message: '任务开始',
    })
  )

  let iteration = 0
  while (iteration < MAX_ITERATIONS) {
    // a. 检查取消与超时
    if (signal?.aborted) {
      onEvent(
        emit(taskId, 'error', { message: '任务已被用户取消' })
      )
      onEvent(
        emit(taskId, 'status_change', { status: 'stopped', message: '已取消' })
      )
      return
    }
    if (timer.expired()) {
      onEvent(
        emit(taskId, 'error', {
          message: `任务超时（${TIMEOUT_MS / 1000}s）`,
        })
      )
      onEvent(
        emit(taskId, 'status_change', { status: 'failed', message: '超时' })
      )
      return
    }

    iteration += 1

    // 思考中事件
    onEvent(emit(taskId, 'thinking', { iteration }))

    // b. 流式调用 LLM
    let assistantText = ''
    let assistantToolCalls: Array<{
      id: string
      name: string
      arguments: string
    }> = []
    let finishReason: string | undefined

    // 调试：发送本次请求的全量 payload（system + history + user 输入 + tools 定义）
    const debugRequest: AgentLLMRequestEvent = {
      iteration,
      model: {
        id: modelConfig.id,
        name: modelConfig.name,
        provider: modelConfig.provider,
        baseUrl: modelConfig.baseUrl,
      },
      systemPrompt,
      messages: messages.slice(1).map((m): DebugLLMMessage => {
        const copy: DebugLLMMessage = { role: m.role, content: m.content }
        if (m.tool_calls) copy.tool_calls = m.tool_calls
        if (m.tool_call_id) copy.tool_call_id = m.tool_call_id
        return copy
      }),
      tools: tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters,
      })),
    }
    onEvent(emit(taskId, 'llm_request', debugRequest))

    const llmStartAt = Date.now()

    try {
      for await (const chunk of chatStreamViaPiAi(messages, modelConfig, tools, signal)) {
        if (chunk.type === 'text' && chunk.content) {
          assistantText += chunk.content
          onEvent(
            emit(taskId, 'text_delta', {
              content: chunk.content,
              messageId: `msg-${taskId}-${iteration}`,
            })
          )
        } else if (chunk.type === 'tool_call' && chunk.toolCall) {
          assistantToolCalls.push(chunk.toolCall)
          // 解析 arguments（容错）
          let parsedArgs: Record<string, unknown> = {}
          try {
            parsedArgs = chunk.toolCall.arguments
              ? JSON.parse(chunk.toolCall.arguments)
              : {}
          } catch {
            parsedArgs = { _raw: chunk.toolCall.arguments }
          }
          onEvent(
            emit(taskId, 'tool_call', {
              toolCallId: chunk.toolCall.id,
              toolName: chunk.toolCall.name,
              arguments: parsedArgs,
            })
          )
        } else if (chunk.type === 'done') {
          finishReason = chunk.finishReason
          // 调试：记录本次响应的完整内容（文本 / 工具调用 / 用量 / 思考）
          const debugResponse: AgentLLMResponseEvent = {
            iteration,
            model: {
              id: modelConfig.id,
              name: modelConfig.name,
              provider: modelConfig.provider,
            },
            text: assistantText,
            thinking: chunk.thinking,
            toolCalls: assistantToolCalls.map((tc) => {
              let parsedArgs: Record<string, unknown> = {}
              try {
                parsedArgs = tc.arguments ? JSON.parse(tc.arguments) : {}
              } catch {
                parsedArgs = { _raw: tc.arguments }
              }
              return { id: tc.id, name: tc.name, arguments: parsedArgs }
            }),
            finishReason: chunk.finishReason,
            usage: chunk.usage,
            durationMs: chunk.durationMs ?? Date.now() - llmStartAt,
          }
          onEvent(emit(taskId, 'llm_response', debugResponse))
        }
      }
    } catch (err) {
      // 调试：请求失败也记录，便于排查
      const errMsg =
        err instanceof Error && err.name === 'AbortError'
          ? '任务已被用户取消'
          : err instanceof Error
            ? err.message
            : String(err)
      onEvent(
        emit(taskId, 'llm_response', {
          iteration,
          model: {
            id: modelConfig.id,
            name: modelConfig.name,
            provider: modelConfig.provider,
          },
          text: assistantText,
          toolCalls: [],
          error: errMsg,
          durationMs: Date.now() - llmStartAt,
        } satisfies AgentLLMResponseEvent)
      )
      if (err instanceof Error && err.name === 'AbortError') {
        onEvent(emit(taskId, 'error', { message: '任务已被用户取消' }))
        onEvent(
          emit(taskId, 'status_change', { status: 'stopped', message: '已取消' })
        )
        return
      }
      const msg = err instanceof Error ? err.message : String(err)
      onEvent(emit(taskId, 'error', { message: `LLM 调用失败：${msg}` }))
      onEvent(
        emit(taskId, 'status_change', { status: 'failed', message: msg })
      )
      return
    }

    // c. 没有工具调用 → 任务完成
    if (assistantToolCalls.length === 0 || finishReason === 'stop') {
      // 将 assistant 文本消息加入历史
      if (assistantText) {
        messages.push({ role: 'assistant', content: assistantText })
      }
      onEvent(
        emit(taskId, 'step_complete', {
          iteration,
          text: assistantText,
          toolCalls: [],
        })
      )
      onEvent(emit(taskId, 'task_complete', { finalText: assistantText }))
      onEvent(
        emit(taskId, 'status_change', { status: 'completed', message: '已完成' })
      )
      return
    }

    // d. 将 assistant 的工具调用消息追加到历史（OpenAI 协议要求先放 assistant 消息）
    messages.push({
      role: 'assistant',
      content: assistantText,
      tool_calls: assistantToolCalls.map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: { name: tc.name, arguments: tc.arguments },
      })),
    })

    // e. 执行工具
    const toolCalls: ToolCall[] = assistantToolCalls.map((tc) => {
      let parsedArgs: Record<string, unknown> = {}
      try {
        parsedArgs = tc.arguments ? JSON.parse(tc.arguments) : {}
      } catch {
        parsedArgs = { _raw: tc.arguments }
      }
      return { id: tc.id, name: tc.name, arguments: parsedArgs }
    })

    const toolResults: ToolResult[] = await executeTools(toolCalls, {
      workspacePath,
      taskId,
      signal,
    })

    // 每个 tool_result 都发事件
    for (const tr of toolResults) {
      onEvent(
        emit(taskId, 'tool_result', {
          toolCallId: tr.toolCallId,
          toolName: tr.name,
          output: tr.output,
          isError: tr.isError ?? false,
        })
      )
    }

    // f. 将工具结果追加到 messages（每个结果一条 role=tool 消息）
    for (const tr of toolResults) {
      messages.push({
        role: 'tool',
        content: tr.output,
        tool_call_id: tr.toolCallId,
      })
    }

    onEvent(
      emit(taskId, 'step_complete', {
        iteration,
        text: assistantText,
        toolCalls,
      })
    )

    // 继续循环，让 LLM 基于工具结果继续生成
  }

  // 4. 超过最大迭代次数
  onEvent(
    emit(taskId, 'error', {
      message: `任务超过最大迭代次数 ${MAX_ITERATIONS}，已停止`,
    })
  )
  onEvent(
    emit(taskId, 'status_change', {
      status: 'failed',
      message: '达到最大迭代次数',
    })
  )
}
