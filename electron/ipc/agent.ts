import { ipcMain, BrowserWindow } from 'electron'
import { start as startAgentLoop } from '../../agent-core/loop'
import type { AgentEvent, ModelConfig } from '../../src/types'

const abortControllers = new Map<string, AbortController>()

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows[0] || null
}

function sendAgentEvent(event: AgentEvent) {
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send('agent:event', event)
  }
}

/**
 * 从参数中解析模型配置
 * - 优先使用渲染进程传入的 modelConfig（用户在设置中配置，含 API Key）
 * - 兼容旧版仅传 modelId 的调用（回退到空 Key，由 pi-ai 桥接层报错提示）
 */
function resolveModelConfig(params: {
  modelConfig?: ModelConfig
  modelId?: string
}): ModelConfig | undefined {
  if (params.modelConfig) {
    return params.modelConfig
  }
  return undefined
}

export function registerAgentIpc(): void {
  ipcMain.handle('agent:execute', async (_event, params) => {
    const { taskId, userMessage, workspacePath, historyMessages } = params

    const modelConfig = resolveModelConfig(params)
    if (!modelConfig) {
      return {
        success: false,
        error: `未找到模型配置（modelId: ${params.modelId ?? 'unknown'}），请在设置中检查模型`,
      }
    }

    const abortController = new AbortController()
    abortControllers.set(taskId, abortController)

    try {
      await startAgentLoop(
        {
          taskId,
          userMessage,
          modelConfig,
          workspacePath,
          historyMessages,
          signal: abortController.signal,
        },
        sendAgentEvent
      )
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      sendAgentEvent({
        type: 'error',
        taskId,
        data: { message: errorMsg },
        timestamp: Date.now(),
      })
      return { success: false, error: errorMsg }
    } finally {
      abortControllers.delete(taskId)
    }
  })

  ipcMain.on('agent:stop', (taskId: string) => {
    const controller = abortControllers.get(taskId)
    if (controller) {
      controller.abort()
      abortControllers.delete(taskId)
    }
  })
}
