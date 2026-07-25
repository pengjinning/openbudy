import type {
  AgentEvent,
  AgentEventType,
  AgentStatusChange,
  AgentTextDelta,
  AgentToolCallEvent,
  AgentToolResultEvent,
} from '../types'

// ==================== ElectronAPI 接口（内联定义，避免跨项目引用 electron/preload.ts）====================
interface ElectronAPI {
  agentExecute: (params: {
    taskId: string
    userMessage: string
    mode: 'ask' | 'craft' | 'plan'
    modelId: string
    workspacePath: string
    historyMessages: Array<{
      role: string
      content: string
      toolCalls?: unknown[]
      toolResults?: unknown[]
    }>
  }) => Promise<{ success: boolean; error?: string }>
  agentStop: (taskId: string) => void
  onAgentEvent: (callback: (event: AgentEvent) => void) => () => void
  fileRead: (filePath: string) => Promise<string>
  fileWrite: (filePath: string, content: string) => Promise<void>
  fileList: (
    dirPath: string
  ) => Promise<Array<{ name: string; path: string; isDirectory: boolean; size: number }>>
  fileDelete: (filePath: string) => Promise<void>
  fileMkdir: (dirPath: string) => Promise<void>
  getWorkspacePath: (taskId: string) => Promise<string>
  selectDirectory: () => Promise<string | null>
  storageGet: (key: string) => Promise<unknown>
  storageSet: (key: string, value: unknown) => Promise<void>
  storageDelete: (key: string) => Promise<void>
}

// ==================== Mock 默认数据 ====================
const DEFAULT_MODELS_CONFIG = {
  defaultModel: 'deepseek-chat',
  models: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1/chat/completions',
      apiKey: '',
      maxInputTokens: 128000,
      maxOutputTokens: 8192,
      supportsToolCalling: true,
    },
  ],
}

const MOCK_FILE_LIST = [
  { name: 'src', path: '/mock/src', isDirectory: true, size: 0 },
  { name: 'README.md', path: '/mock/README.md', isDirectory: false, size: 1024 },
  { name: 'package.json', path: '/mock/package.json', isDirectory: false, size: 512 },
  { name: 'index.ts', path: '/mock/src/index.ts', isDirectory: false, size: 256 },
]

const MOCK_FILE_CONTENT = `# Mock File
This is a mock file content for browser environment.
Generated at ${new Date().toISOString()}
`

// ==================== Mock Agent 执行 ====================
function dispatchAgentEvent(event: AgentEvent): void {
  // 通过 CustomEvent 模拟主进程推送的 IPC 事件
  window.dispatchEvent(new CustomEvent('mock-agent-event', { detail: event }))
}

function mockAgentExecute(params: {
  taskId: string
  userMessage: string
  mode: 'ask' | 'craft' | 'plan'
  modelId: string
  workspacePath: string
  historyMessages: Array<{
    role: string
    content: string
    toolCalls?: unknown[]
    toolResults?: unknown[]
  }>
}): Promise<{ success: boolean; error?: string }> {
  const { taskId, userMessage } = params
  const now = Date.now()

  // 模拟事件序列：status_change → text_delta(多次) → tool_call → tool_result → task_complete
  const events: Array<{ type: AgentEventType; data: unknown; delay: number }> = [
    {
      type: 'status_change',
      data: { status: 'running', message: 'Agent 启动中...' } satisfies AgentStatusChange,
      delay: 100,
    },
    {
      type: 'text_delta',
      data: {
        content: `收到指令："${userMessage}"\n\n`,
        messageId: '',
      } satisfies AgentTextDelta,
      delay: 400,
    },
    {
      type: 'text_delta',
      data: {
        content: '我正在分析你的需求，下面将调用工具演示流程。',
        messageId: '',
      } satisfies AgentTextDelta,
      delay: 800,
    },
    {
      type: 'tool_call',
      data: {
        toolCallId: `call-${taskId}-${now}`,
        toolName: 'read_file',
        arguments: { path: 'README.md' },
      } satisfies AgentToolCallEvent,
      delay: 1200,
    },
    {
      type: 'tool_result',
      data: {
        toolCallId: `call-${taskId}-${now}`,
        toolName: 'read_file',
        output: '文件内容读取成功（mock）',
        isError: false,
      } satisfies AgentToolResultEvent,
      delay: 1600,
    },
    {
      type: 'task_complete',
      data: { messageId: '' },
      delay: 2000,
    },
  ]

  events.forEach((e) => {
    setTimeout(() => {
      dispatchAgentEvent({
        type: e.type,
        taskId,
        data: e.data,
        timestamp: Date.now(),
      })
    }, e.delay)
  })

  return Promise.resolve({ success: true })
}

// ==================== 创建 IPC 实现 ====================
function createIpc(): ElectronAPI {
  const electronAPI = (window as unknown as { electronAPI?: ElectronAPI }).electronAPI

  if (electronAPI) {
    return electronAPI
  }

  // 浏览器环境 Mock
  const mockStorage = new Map<string, unknown>()
  mockStorage.set('modelsConfig', DEFAULT_MODELS_CONFIG)
  mockStorage.set('theme', 'dark')
  mockStorage.set('workspaceRoot', '~/workbuddy-workspace/')

  const mockApi: ElectronAPI = {
    agentExecute: (params) => mockAgentExecute(params),
    agentStop: (_taskId: string) => {
      /* mock 无操作 */
    },
    onAgentEvent: (callback: (event: AgentEvent) => void) => {
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<AgentEvent>
        callback(customEvent.detail)
      }
      window.addEventListener('mock-agent-event', handler)
      return () => window.removeEventListener('mock-agent-event', handler)
    },
    fileRead: async (_filePath: string) => MOCK_FILE_CONTENT,
    fileWrite: async (_filePath: string, _content: string) => {
      /* mock 无操作 */
    },
    fileList: async (_dirPath: string) => MOCK_FILE_LIST,
    fileDelete: async (_filePath: string) => {
      /* mock 无操作 */
    },
    fileMkdir: async (_dirPath: string) => {
      /* mock 无操作 */
    },
    getWorkspacePath: async (taskId: string) => `~/workbuddy-workspace/${taskId}/`,
    selectDirectory: async () => '~/workbuddy-workspace/',
    storageGet: async (key: string) => mockStorage.get(key),
    storageSet: async (key: string, value: unknown) => {
      mockStorage.set(key, value)
    },
    storageDelete: async (key: string) => {
      mockStorage.delete(key)
    },
  }

  return mockApi
}

export const ipc = createIpc()
