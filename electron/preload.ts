import { contextBridge, ipcRenderer } from 'electron'
import type { ModelConfig } from '../../src/types'

export interface AgentExecuteParams {
  taskId: string
  userMessage: string
  mode: 'ask' | 'craft' | 'plan'
  modelConfig: ModelConfig
  workspacePath: string
  historyMessages: Array<{ role: string; content: string; toolCalls?: unknown[]; toolResults?: unknown[] }>
}

export interface ElectronAPI {
  // Agent
  agentExecute: (params: AgentExecuteParams) => Promise<{ success: boolean; error?: string }>
  agentStop: (taskId: string) => void
  onAgentEvent: (callback: (event: unknown) => void) => () => void

  // File operations
  fileRead: (filePath: string) => Promise<string>
  fileWrite: (filePath: string, content: string) => Promise<void>
  fileList: (dirPath: string) => Promise<Array<{ name: string; path: string; isDirectory: boolean; size: number }>>
  fileDelete: (filePath: string) => Promise<void>
  fileMkdir: (dirPath: string) => Promise<void>
  getWorkspacePath: (taskId: string) => Promise<string>
  selectDirectory: () => Promise<string | null>
  openPath: (filePath: string) => Promise<boolean>
  openInFolder: (filePath: string) => Promise<boolean>

  // Storage
  storageGet: (key: string) => Promise<unknown>
  storageSet: (key: string, value: unknown) => Promise<void>
  storageDelete: (key: string) => Promise<void>
}

const api: ElectronAPI = {
  // Agent
  agentExecute: (params) => ipcRenderer.invoke('agent:execute', params),
  agentStop: (taskId) => ipcRenderer.send('agent:stop', taskId),
  onAgentEvent: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
    ipcRenderer.on('agent:event', handler)
    return () => ipcRenderer.removeListener('agent:event', handler)
  },

  // File
  fileRead: (filePath) => ipcRenderer.invoke('file:read', filePath),
  fileWrite: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  fileList: (dirPath) => ipcRenderer.invoke('file:list', dirPath),
  fileDelete: (filePath) => ipcRenderer.invoke('file:delete', filePath),
  fileMkdir: (dirPath) => ipcRenderer.invoke('file:mkdir', dirPath),
  getWorkspacePath: (taskId) => ipcRenderer.invoke('file:getWorkspacePath', taskId),
  selectDirectory: () => ipcRenderer.invoke('file:selectDirectory'),
  openPath: (filePath) => ipcRenderer.invoke('file:openPath', filePath),
  openInFolder: (filePath) => ipcRenderer.invoke('file:openInFolder', filePath),

  // Storage
  storageGet: (key) => ipcRenderer.invoke('storage:get', key),
  storageSet: (key, value) => ipcRenderer.invoke('storage:set', key, value),
  storageDelete: (key) => ipcRenderer.invoke('storage:delete', key),
}

contextBridge.exposeInMainWorld('electronAPI', api)
