/**
 * pi-ai 桥接层 — 基于 @earendil-works/pi-ai（参考 openclaw-mini 的 Provider 抽象）
 *
 * 设计决策（对齐 openclaw-mini src/provider/index.ts）：
 * - LLM SDK 适配交给 pi-ai 的 openai-completions 适配器（智谱为 OpenAI 兼容接口）
 * - 对外保持 openbudy 既有的 LLMMessage / LLMChunk 协议，loop.ts 无感切换
 * - 模型定义优先复用 pi-ai 内置目录（zai / zai-coding-cn / deepseek / openai...），
 *   未收录的自定义模型按 openai-completions 兜底构造（对齐 openclaw-mini buildModelDef）
 * - 智谱推理模型通过 thinkingFormat: "zai" 兼容设置正确开启思考流
 */
import type { ModelConfig, ToolDefinition } from '../../src/types'
import type {
  AssistantMessageEvent,
  Context,
  JsonObject,
  Message as PiMessage,
  Model,
  Tool as PiTool,
  UserMessage,
  AssistantMessage,
  ToolResultMessage,
} from '@earendil-works/pi-ai'
import { streamSimple } from '@earendil-works/pi-ai/api/openai-completions'
import { normalizeContext } from '@earendil-works/pi-ai/utils/transcript'
import { ZAI_MODELS } from '@earendil-works/pi-ai/providers/zai.models'
import { ZAI_CODING_CN_MODELS } from '@earendil-works/pi-ai/providers/zai-coding-cn.models'
import type { LLMChunk, LLMMessage } from './client'

/** 智谱开放平台预设（OpenAI 兼容接口，非 Coding Plan 专用端点） */
export const ZHIPU_PRESETS: ModelConfig[] = [
  {
    id: 'glm-4-flash',
    name: 'GLM-4-Flash（免费）',
    provider: 'zhipu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    supportsToolCalling: true,
  },
  {
    id: 'glm-4.6',
    name: 'GLM-4.6',
    provider: 'zhipu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    maxInputTokens: 200000,
    maxOutputTokens: 8192,
    supportsToolCalling: true,
  },
  {
    id: 'glm-4.7',
    name: 'GLM-4.7（推理）',
    provider: 'zhipu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    maxInputTokens: 204800,
    maxOutputTokens: 131072,
    supportsToolCalling: true,
  },
  {
    id: 'glm-5.3',
    name: 'GLM-5.3（推理）',
    provider: 'zhipu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    maxInputTokens: 1000000,
    maxOutputTokens: 131072,
    supportsToolCalling: true,
  },
]

/**
 * 将 openbudy 的 ModelConfig 转为 pi-ai 的 Model 定义
 *
 * 规则：
 * 1. zhipu provider → 在 zai / zai-coding-cn 目录中查找同名模型，
 *    覆盖 baseUrl 为用户配置值（兼容开放平台 / Coding Plan 两种端点），保留官方 compat（thinkingFormat: "zai"）
 * 2. 目录中已有同名模型的 provider（deepseek 等）→ 直接复用并覆盖 baseUrl
 * 3. 其余 → 按 openai-completions 兜底构造，智谱端点显式带 zai compat
 */
export function toPiModel(config: ModelConfig): Model<'openai-completions'> {
  let catalogModel: Model<'openai-completions'> | undefined

  if (config.provider === 'zhipu') {
    const cnCatalog = ZAI_CODING_CN_MODELS as Record<
      string,
      Model<'openai-completions'> | undefined
    >
    const zaiCatalog = ZAI_MODELS as Record<
      string,
      Model<'openai-completions'> | undefined
    >
    catalogModel = cnCatalog[config.id] ?? zaiCatalog[config.id]
  }

  if (catalogModel) {
    return {
      ...catalogModel,
      name: config.name || catalogModel.name,
      baseUrl: config.baseUrl,
    }
  }

  // 自定义模型兜底：OpenAI 兼容接口
  const isZhipu = config.provider === 'zhipu' || config.baseUrl.includes('bigmodel.cn')
  return {
    id: config.id,
    name: config.name,
    api: 'openai-completions',
    provider: config.provider,
    baseUrl: config.baseUrl,
    reasoning: /glm-(4\.7|5)/.test(config.id),
    input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: config.maxInputTokens,
    maxTokens: config.maxOutputTokens,
    type: 'chat',
    // 智谱非 Coding-Plan 端点对 OpenAI 非标字段容忍度低，显式声明 zai 兼容行为
    ...(isZhipu
      ? {
          compat: {
            supportsStore: false,
            supportsDeveloperRole: false,
            supportsReasoningEffort: true,
            maxTokensField: 'max_tokens' as const,
            thinkingFormat: 'zai' as const,
          },
        }
      : {}),
  }
}

/**
 * openbudy ToolDefinition (OpenAI function 格式) → pi-ai Tool
 * pi-ai 的 openai-completions 适配器直接消费 JSON Schema 参数
 */
export function toPiTool(def: ToolDefinition): PiTool {
  return {
    name: def.function.name,
    description: def.function.description,
    parameters: def.function.parameters as PiTool['parameters'],
  }
}

const EMPTY_USAGE = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  totalTokens: 0,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
}

/**
 * LLMMessage[]（OpenAI 风格，含 system/tool/tool_calls）→ pi-ai Message[]
 *
 * 转换规则：
 * - system → 忽略（systemPrompt 由 Context.systemPrompt 单独承载）
 * - user / assistant(纯文本) → UserMessage / AssistantMessage
 * - assistant + tool_calls → AssistantMessage，content 含 ToolCall[]
 * - role=tool → ToolResultMessage
 */
export function toPiMessages(messages: LLMMessage[], model: Model<'openai-completions'>): PiMessage[] {
  const result: PiMessage[] = []

  for (const msg of messages) {
    const timestamp = Date.now()

    if (msg.role === 'system') continue

    if (msg.role === 'user') {
      const userMsg: UserMessage = { role: 'user', content: msg.content, timestamp }
      result.push(userMsg)
      continue
    }

    if (msg.role === 'tool') {
      const toolResult: ToolResultMessage = {
        role: 'toolResult',
        toolCallId: msg.tool_call_id ?? '',
        toolName: '',
        content: [{ type: 'text', text: msg.content }],
        isError: false,
        timestamp,
      }
      result.push(toolResult)
      continue
    }

    // assistant
    const assistantMsg: AssistantMessage = {
      role: 'assistant',
      content: [{ type: 'text', text: msg.content ?? '' }],
      api: 'openai-completions',
      provider: model.provider,
      model: model.id,
      usage: EMPTY_USAGE,
      stopReason: 'stop',
      timestamp,
    }
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        let parsed: JsonObject = {}
        try {
          parsed = tc.function.arguments
            ? (JSON.parse(tc.function.arguments) as JsonObject)
            : {}
        } catch {
          parsed = { _raw: tc.function.arguments }
        }
        assistantMsg.content.push({
          type: 'toolCall',
          id: tc.id,
          name: tc.function.name,
          arguments: parsed,
        })
      }
    }
    result.push(assistantMsg)
  }

  return result
}

/** 从 Context 中提取 systemPrompt（messages[0] 若为 system） */
function extractSystemPrompt(messages: LLMMessage[]): { system: string; rest: LLMMessage[] } {
  if (messages.length > 0 && messages[0].role === 'system') {
    return { system: messages[0].content, rest: messages.slice(1) }
  }
  return { system: '', rest: messages }
}

/**
 * 流式调用 LLM（pi-ai 驱动），对外保持与旧版 chatStream 相同的 LLMChunk 协议
 *
 * - thinking_delta → 不产出（推理模型思考流不进入最终回答；done 事件后可从 result 提取）
 * - text_delta → { type: 'text' }
 * - toolcall_end → { type: 'tool_call' }
 * - done / error → { type: 'done' }
 */
export async function* chatStreamViaPiAi(
  messages: LLMMessage[],
  modelConfig: ModelConfig,
  tools?: ToolDefinition[],
  signal?: AbortSignal
): AsyncGenerator<LLMChunk> {
  if (!modelConfig.apiKey) {
    throw new Error(
      `模型 ${modelConfig.name || modelConfig.id} 未配置 API Key，请在「设置 → 模型与 API Key」中填写`
    )
  }

  const model = toPiModel(modelConfig)
  const { system, rest } = extractSystemPrompt(messages)
  const piMessages = toPiMessages(rest, model)

  const context: Context = {
    systemPrompt: system || undefined,
    messages: piMessages,
    ...(tools && tools.length > 0 && modelConfig.supportsToolCalling
      ? { tools: tools.map(toPiTool) }
      : {}),
  }

  const eventStream = streamSimple(model, normalizeContext(context), {
    apiKey: modelConfig.apiKey,
    signal,
  })

  let sawError = false

  for await (const event of eventStream) {
    const e = event as AssistantMessageEvent
    switch (e.type) {
      case 'text_delta':
        if (e.delta) {
          yield { type: 'text', content: e.delta }
        }
        break
      case 'toolcall_end':
        yield {
          type: 'tool_call',
          toolCall: {
            id: e.toolCall.id,
            name: e.toolCall.name,
            arguments: JSON.stringify(e.toolCall.arguments ?? {}),
          },
        }
        break
      case 'error': {
        sawError = true
        const errMsg =
          (e.error as unknown as { errorMessage?: string })?.errorMessage ??
          'LLM 流式响应错误'
        // pi-ai 的 AssistantMessageEventStream 将 error 事件 resolve 而非 reject，
        // 必须显式抛出，否则错误被静默吞掉（对齐 openclaw-mini agent-loop 处理）
        throw new Error(`LLM 请求失败: ${errMsg}`)
      }
      case 'done':
        yield {
          type: 'done',
          finishReason:
            e.message.stopReason === 'toolUse' ? 'tool_calls' : 'stop',
        }
        return
      default:
        break
    }
  }

  // 流正常耗尽但没有 done 事件（如中断）
  if (!sawError) {
    yield { type: 'done', finishReason: 'stop' }
  }
}
