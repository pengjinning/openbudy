import { ipcMain, BrowserWindow } from 'electron'
import { start as startAgentLoop } from '../../agent-core/loop'
import { modelRegistry } from '../../agent-core/llm/model-registry'
import type { AgentEvent } from '../../src/types'

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

export function registerAgentIpc(): void {
  ipcMain.handle('agent:execute', async (_event, params) => {
    const { taskId, userMessage, mode, modelId, workspacePath, historyMessages } = params

    const modelConfig = modelRegistry.getModel(modelId)
    if (!modelConfig) {
      return { success: false, error: `Model ${modelId} not found` }
    }

    const abortController = new AbortController()
    abortControllers.set(taskId, abortController)

    try {
      await startAgentLoop(
        {
          taskId,
          userMessage,
          mode,
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
