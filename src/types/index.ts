// ==================== 任务类型 ====================
export type TaskMode = 'ask' | 'craft' | 'plan'
export type TaskStatus = 'planning' | 'running' | 'completed' | 'failed' | 'archived' | 'stopped'

export interface Task {
  id: string
  title: string
  mode: TaskMode
  status: TaskStatus
  workspacePath: string
  modelId: string
  createdAt: number
  updatedAt: number
  pinned: boolean
}

// ==================== 消息类型 ====================
export type MessageRole = 'user' | 'assistant' | 'tool' | 'system'

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  name: string
  output: string
  isError?: boolean
}

export interface Message {
  id: string
  taskId: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  createdAt: number
}

// ==================== Agent 事件类型 ====================
export type AgentEventType =
  | 'thinking'
  | 'text_delta'
  | 'tool_call'
  | 'tool_result'
  | 'step_complete'
  | 'task_complete'
  | 'error'
  | 'status_change'
  // 调试：LLM 原始请求 / 响应（含用户输入、system、history、tools 定义）
  | 'llm_request'
  | 'llm_response'

export interface AgentEvent {
  type: AgentEventType
  taskId: string
  data: unknown
  timestamp: number
}

export interface AgentTextDelta {
  content: string
  messageId: string
}

export interface AgentToolCallEvent {
  toolCallId: string
  toolName: string
  arguments: Record<string, unknown>
}

export interface AgentToolResultEvent {
  toolCallId: string
  toolName: string
  output: string
  isError: boolean
}

export interface AgentStatusChange {
  status: TaskStatus
  message?: string
}

// ==================== LLM 调试 trace 类型 ====================

/** 调试用 LLM 消息（OpenAI 风格），与 agent-core/llm/client.ts 的 LLMMessage 对齐 */
export interface DebugLLMMessage {
  role: string
  content: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
  tool_call_id?: string
}

/** 调试用工具定义（OpenAI function 格式） */
export interface DebugToolDefinition {
  name: string
  description: string
  parameters: unknown
}

export interface AgentLLMRequestEvent {
  /** 第几轮 LLM 调用（从 1 开始） */
  iteration: number
  model: {
    id: string
    name: string
    provider: string
    baseUrl: string
  }
  systemPrompt: string
  messages: DebugLLMMessage[]
  tools: DebugToolDefinition[]
}

export interface AgentLLMUsage {
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

export interface AgentLLMResponseEvent {
  iteration: number
  model: {
    id: string
    name: string
    provider: string
  }
  text: string
  /** 模型思考过程（推理模型），来自 pi-ai thinking 内容块 */
  thinking?: string
  toolCalls: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }>
  finishReason?: string
  usage?: AgentLLMUsage
  durationMs?: number
  error?: string
}

// ==================== 文件/产物类型 ====================
export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  size: number
  children?: FileNode[]
}

export interface Artifact {
  id: string
  taskId: string
  fileName: string
  filePath: string
  fileType: string
  size: number
  createdAt: number
}

// ==================== 模型配置类型 ====================
export interface ModelConfig {
  id: string
  name: string
  provider: string
  baseUrl: string
  apiKey: string
  maxInputTokens: number
  maxOutputTokens: number
  supportsVision?: boolean
  supportsToolCalling?: boolean
}

export interface ModelsConfig {
  defaultModel: string
  models: ModelConfig[]
}

// ==================== 设置类型 ====================
export type ThemeSetting = 'light' | 'dark' | 'system'

export interface AppSettings {
  theme: ThemeSetting
  modelsConfig: ModelsConfig
  workspaceRoot: string
}

// ==================== 工具定义类型 ====================
export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, {
        type: string
        description: string
        enum?: string[]
      }>
      required: string[]
    }
  }
}

export interface ToolExecutionContext {
  workspacePath: string
  taskId: string
  signal?: AbortSignal
}

export type ToolHandler = (
  args: Record<string, unknown>,
  context: ToolExecutionContext
) => Promise<string>
