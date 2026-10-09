import { ipcMain, dialog, shell } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

const WORKSPACE_ROOT = path.join(os.homedir(), 'openbudy-workspace')

/**
 * 展开路径中的 ~ 前缀。
 * Node 的 fs/path 不会展开 ~（历史任务数据里存过 "~/openbudy-workspace/..." 字面量，
 * 直接 readdir 会 ENOENT），这里统一兜底为绝对路径。
 */
function expandHome(p: string): string {
  if (p === '~') return os.homedir()
  if (p.startsWith('~/') || p.startsWith('~\\')) {
    return path.join(os.homedir(), p.slice(2))
  }
  return p
}

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
      const target = expandHome(dirPath)
      // 工作区目录可能尚未创建（新任务还没写过文件）— 静默建空目录而非报 ENOENT
      await fs.mkdir(target, { recursive: true }).catch(() => undefined)
      const entries = await fs.readdir(target, { withFileTypes: true })
      const result = []
      for (const entry of entries) {
        const fullPath = path.join(target, entry.name)
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

  // 用系统默认应用打开文件（文本编辑器/浏览器/预览等按扩展名决定）
  ipcMain.handle('file:openPath', async (_event, filePath: string) => {
    const target = expandHome(filePath)
    const errMsg = await shell.openPath(target)
    if (errMsg) {
      throw new Error(`Failed to open file: ${errMsg}`)
    }
    return true
  })

  // 在 Finder/资源管理器中定位该文件（macOS 会选中它）
  ipcMain.handle('file:openInFolder', async (_event, filePath: string) => {
    const target = expandHome(filePath)
    try {
      await fs.access(target)
    } catch {
      throw new Error(`File not found: ${target}`)
    }
    shell.showItemInFolder(target)
    return true
  })
}
