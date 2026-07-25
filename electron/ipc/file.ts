import { ipcMain, dialog } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

const WORKSPACE_ROOT = path.join(os.homedir(), 'workbuddy-workspace')

export function registerFileIpc(): void {
  ipcMain.handle('file:read', async (_event, filePath: string) => {
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
    try {
      const dir = path.dirname(filePath)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(filePath, content, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('file:list', async (_event, dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      const result = []
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        let size = 0
        if (!entry.isDirectory()) {
          try {
            const stat = await fs.stat(fullPath)
            size = stat.size
          } catch { /* ignore */ }
        }
        result.push({
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size,
        })
      }
      return result.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    } catch (error) {
      throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('file:delete', async (_event, filePath: string) => {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('file:mkdir', async (_event, dirPath: string) => {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
      throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('file:getWorkspacePath', async (_event, taskId: string) => {
    const taskWorkspace = path.join(WORKSPACE_ROOT, taskId)
    try {
      await fs.mkdir(taskWorkspace, { recursive: true })
    } catch { /* ignore if exists */ }
    return taskWorkspace
  })

  ipcMain.handle('file:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })
}
