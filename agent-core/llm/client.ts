import type { ModelConfig, ToolDefinition } from '../../src/types'

/**
 * LLM 消息格式（OpenAI 兼容）
 */
export interface LLMMessage {
  role: string
  content: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
  tool_call_id?: string
}

/**
 * 流式输出 chunk
 */
export interface LLMChunk {
  type: 'text' | 'tool_call' | 'done'
  content?: string
  toolCall?: { id: string; name: string; arguments: string }
  finishReason?: string
  /** 调试信息（done chunk 携带）：token 用量与耗时 */
  usage?: {
    input: number
    output: number
    cacheRead: number
    cacheWrite: number
    totalTokens: number
    cost: {
      input: number
      output: number
      cacheRead: number
      cacheWrite: number
      total: number
    }
  }
  /** 调试信息（done chunk 携带）：推理模型思考过程 */
  thinking?: string
  /** 调试信息（done chunk 携带）：本次请求耗时 */
  durationMs?: number
}

/**
 * 调用 OpenAI 兼容的 chat completions 接口，流式返回 chunk
 *
 * 实现要点：
 * - POST 到 modelConfig.baseUrl，Authorization Bearer
 * - body 包含 stream: true, tool_choice: 'auto'
 * - 读取 ReadableStream，TextDecoder 逐 chunk 解析
 * - 按 \n 分行，过滤 data: 前缀
 * - [DONE] 表示结束
 * - tool_calls 可能跨多个 chunk 分片到达，按 index 缓冲拼接
 */
export async function* chatStream(
  messages: LLMMessage[],
  modelConfig: ModelConfig,
  tools?: ToolDefinition[],
  signal?: AbortSignal
): AsyncGenerator<LLMChunk> {
  const body: Record<string, unknown> = {
    model: modelConfig.id,
    messages,
    stream: true,
    max_tokens: modelConfig.maxOutputTokens,
  }

  if (tools && tools.length > 0 && modelConfig.supportsToolCalling) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const response = await fetch(modelConfig.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${modelConfig.apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(
      `LLM 请求失败: ${response.status} ${response.statusText}${errText ? ` - ${errText}` : ''}`
    )
  }

  if (!response.body) {
    throw new Error('LLM 响应无可读流')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  // 工具调用按 index 缓冲（index → 分片累积）
  const toolCallBuffer = new Map<
    number,
    { id: string; name: string; arguments: string }
  >()

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按行处理
      const lines = buffer.split('\n')
      // 保留最后未结束的一行
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue
        if (!line.startsWith('data:')) continue

        const data = line.slice(5).trim()
        if (data === '[DONE]') {
          yield { type: 'done', finishReason: 'stop' }
          return
        }

        let json: Record<string, unknown>
        try {
          json = JSON.parse(data)
        } catch {
          // 跳过无法解析的行（如 SSE 注释、心跳）
          continue
        }

        const choices = json.choices as
          | Array<{
              delta?: {
                content?: string
                tool_calls?: Array<{
                  index: number
                  id?: string
                  function?: { name?: string; arguments?: string }
                }>
              }
              finish_reason?: string | null
            }>
          | undefined

        const choice = choices?.[0]
        if (!choice) continue

        const delta = choice.delta
        const finishReason = choice.finish_reason

        // 文本内容
        if (delta?.content) {
          yield { type: 'text', content: delta.content }
        }

        // 工具调用分片
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = toolCallBuffer.get(tc.index) ?? {
              id: '',
              name: '',
              arguments: '',
            }
            if (tc.id) existing.id = tc.id
            if (tc.function?.name) existing.name = tc.function.name
            if (tc.function?.arguments) {
              existing.arguments += tc.function.arguments
            }
            toolCallBuffer.set(tc.index, existing)
          }
        }

        // finish_reason 触发输出
        if (finishReason === 'tool_calls') {
          // 按稳定 index 顺序输出
          const sorted = Array.from(toolCallBuffer.entries()).sort(
            (a, b) => a[0] - b[0]
          )
          for (const [, tc] of sorted) {
            if (tc.id && tc.name) {
              yield {
                type: 'tool_call',
                toolCall: {
                  id: tc.id,
                  name: tc.name,
                  arguments: tc.arguments,
                },
              }
            }
          }
          toolCallBuffer.clear()
          yield { type: 'done', finishReason: 'tool_calls' }
          return
        }

        if (finishReason === 'stop') {
          yield { type: 'done', finishReason: 'stop' }
          return
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
