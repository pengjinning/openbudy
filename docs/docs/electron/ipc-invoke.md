---
sidebar_position: 4
title: 第 4 章 · IPC 通信（一）：请求-响应模式
description: ipcMain.handle + ipcRenderer.invoke + contextBridge 白名单桥接
---

# 第 4 章 · IPC 通信（一）：请求-响应模式

## 4.1 两种通信模式

Electron IPC 有两种姿势，OpenBudy 两种都用：

| 模式 | API 组合 | 方向 | 适用场景 | OpenBudy 实例 |
| --- | --- | --- | --- | --- |
| **请求-响应** | `ipcMain.handle` + `ipcRenderer.invoke` | 渲染 → 主 → 渲染 | 一次性操作，要返回值 | 读配置、读写文件、执行 Agent |
| **事件推送** | `webContents.send` + `ipcRenderer.on` | 主 → 渲染 | 持续推送流式数据 | Agent 流式事件 |

本章讲第一种。

## 4.2 最小可用示例

主进程注册处理器：

```ts
// main.ts 或任意被引入的模块
import { ipcMain } from 'electron'

ipcMain.handle('app:getVersion', async () => {
  return app.getVersion()
})
```

渲染进程（经 preload 暴露）调用：

```ts
// preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
})

// 页面里
const version = await window.electronAPI.getVersion()
```

`invoke` 返回 Promise，`handle` 里可以 `throw`，错误会序列化后传回渲染进程的 `catch`。

## 4.3 精读：配置读写（electron/ipc/storage.ts）

OpenBudy 把所有用户配置存在 `~/.openbudy/config.json`，读写全部经主进程：

```ts title="electron/ipc/storage.ts（完整逻辑节选）"
import { ipcMain } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

const CONFIG_DIR = path.join(os.homedir(), '.openbudy')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

async function readConfig(): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}  // 文件不存在 → 空配置，不报错
  }
}

export function registerStorageIpc(): void {
  ipcMain.handle('storage:get', async (_event, key: string) => {
    const config = await readConfig()
    return config[key] ?? null
  })

  ipcMain.handle('storage:set', async (_event, key: string, value: unknown) => {
    const config = await readConfig()
    config[key] = value
    await writeConfig(config)
  })

  ipcMain.handle('storage:delete', async (_event, key: string) => {
    const config = await readConfig()
    delete config[key]
    await writeConfig(config)
  })
}
```

注意三个工程细节：

1. **容错读取**：`readConfig` 把「文件不存在 / JSON 损坏」降级为空对象，渲染进程永远拿到可用的值。
2. **命名空间**：通道名 `storage:get/set/delete` 用 `模块:动作` 命名，`file:*`、`agent:*` 同理，避免冲突。
3. **Key 的安全边界**：渲染进程只能操作配置文件里的 key，**拿不到文件路径本身**——API Key 因此不会暴露给页面环境。

## 4.4 精读：文件操作（electron/ipc/file.ts）

文件通道展示了带参数校验和系统对话框的更完整形态：

```ts title="electron/ipc/file.ts（节选）"
import { ipcMain, dialog, shell } from 'electron'

export function registerFileIpc(): void {
  // 读文件：渲染进程只能「按路径读」，不能漫游文件系统
  ipcMain.handle('file:read', async (_event, filePath: string) => {
    return await fs.readFile(filePath, 'utf-8')
  })

  // 写文件：自动创建父目录，写文件树 / Diff 视图都用它
  ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
  })

  // 系统目录选择对话框 —— 只有主进程能调
  ipcMain.handle('file:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  // 每个任务一个隔离工作区：~/openbudy-workspace/<taskId>
  ipcMain.handle('file:getWorkspacePath', async (_event, taskId: string) => {
    const taskWorkspace = path.join(WORKSPACE_ROOT, taskId)
    await fs.mkdir(taskWorkspace, { recursive: true })
    return taskWorkspace
  })
}
```

`getWorkspacePath` 是理解 Agent 沙箱的第一块拼图：**每个任务都有独立的物理目录**，后续[第 10 章](/agent-loop/sandbox)的所有路径校验都以它为边界。

## 4.5 精读：preload 白名单（electron/preload.ts）

```ts title="electron/preload.ts（节选）"
import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  agentExecute: (params: AgentExecuteParams) => Promise<{ success: boolean; error?: string }>
  agentStop: (taskId: string) => void
  onAgentEvent: (callback: (event: unknown) => void) => () => void  // 第 5 章
  fileRead: (filePath: string) => Promise<string>
  fileWrite: (filePath: string, content: string) => Promise<void>
  storageGet: (key: string) => Promise<unknown>
  storageSet: (key: string, value: unknown) => Promise<void>
  // ...完整列表见源文件
}

const api: ElectronAPI = {
  agentExecute: (params) => ipcRenderer.invoke('agent:execute', params),
  agentStop: (taskId) => ipcRenderer.send('agent:stop', taskId),
  fileRead: (filePath) => ipcRenderer.invoke('file:read', filePath),
  storageGet: (key) => ipcRenderer.invoke('storage:get', key),
  storageSet: (key, value) => ipcRenderer.invoke('storage:set', key, value),
}

contextBridge.exposeInMainWorld('electronAPI', api)
```

精髓在于 **`ElectronAPI` 接口就是白名单本身**：

- 页面只能调用接口里声明过的方法，多一个都不行
- 每个方法一对一绑定通道，渲染进程**无法构造任意通道名**（对比直接暴露 `ipcRenderer.invoke` 的危险做法）
- `onAgentEvent` 返回**取消订阅函数**，防止 React 重复挂载导致监听器泄漏

:::warning 常见反模式
```ts
// ❌ 千万不要这样暴露 —— 等于放弃所有白名单控制
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
```
:::

## 4.6 实战：新增一个 IPC 通道

目标：让页面显示应用版本号。三步走：

**① 主进程**（`electron/main.ts` 或新建 `electron/ipc/app.ts`）：

```ts
import { ipcMain, app } from 'electron'

export function registerAppIpc(): void {
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:getPlatform', () => process.platform)
}
```

记得在 `main.ts` 的 `whenReady` 里调用 `registerAppIpc()`。

**② preload**（`electron/preload.ts`）：

```ts
// 接口中声明
getAppVersion: () => Promise<string>
getAppPlatform: () => Promise<string>

// 实现中绑定
getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
getAppPlatform: () => ipcRenderer.invoke('app:getPlatform'),
```

**③ 渲染进程**（任意组件）：

```tsx
const [version, setVersion] = useState('')
useEffect(() => {
  window.electronAPI.getAppVersion().then(setVersion)
}, [])
return <span>v{version}</span>
```

重启 `pnpm electron:dev`，版本号就显示了。这就是完整的「白名单 IPC」闭环。

## 4.7 小结

- 请求-响应用 `handle` + `invoke`，天然 Promise 化
- 通道命名 `模块:动作`；preload 的 TS 接口即白名单
- 配置在主进程落盘（`~/.openbudy/config.json`），API Key 不进渲染进程
- `file:getWorkspacePath` 为每个任务创建隔离工作区

**思考题**：`ipcRenderer.invoke` 的参数会被结构化克隆后传给主进程。如果要传一个 100MB 的字符串（比如整个文件内容），会发生什么？有没有更好的设计？（提示：流式 / 分块，或让主进程自己读）

下一章讲反方向：主进程主动推送事件的模式——Agent 流式输出的命脉。
