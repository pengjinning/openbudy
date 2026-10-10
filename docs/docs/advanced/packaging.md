---
sidebar_position: 13
title: 第 13 章 · 打包、调试与最佳实践
description: electron-builder 打包、双端调试技巧与踩坑清单
---

# 第 13 章 · 打包、调试与最佳实践

## 13.1 打包：electron-builder

配置在 [electron-builder.yml](https://github.com/pengjinning/openbudy/blob/main/electron-builder.yml)：

```yaml
appId: com.openbudy.app
productName: OpenBudy
directories:
  output: release
files:
  - dist/            # 渲染进程产物（Vite build）
  - dist-electron/   # 主进程 + preload 产物
mac:
  category: public.app-category.productivity
  target:
    - dmg
    - zip
win:
  target: nsis
linux:
  target: AppImage
```

一条命令完成「构建两端 + 打包安装器」：

```bash
pnpm electron:build
# 内部执行：vite build（产出 dist/ + dist-electron/）→ electron-builder
```

### 打包前的检查清单

```bash
pnpm lint          # tsc --noEmit 全量类型检查
pnpm build         # 验证渲染进程可构建
pnpm electron:build
```

常见打包坑：

| 症状 | 原因与解法 |
| --- | --- |
| 打开后白屏 | `loadFile` 路径与 asar 内结构不符；检查 `mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))` |
| preload 未生效 | files 列表漏了 `dist-electron/` |
| 生产模式无 CSP / CSP 拦截资源 | 第 3 章的 CSP 是按 `file://` 判断的，确认生产分支逻辑 |
| 体积过大 | `files` 精确列出产物目录，别把 node_modules 全打进去（依赖已 bundle 进产物） |

## 13.2 调试工具箱

### 渲染进程

`pnpm electron:dev` 自动打开 DevTools。常用：

- **Console**：直接调 `window.electronAPI.*` 验证 IPC（第 3 章实战）
- **Network**：观察发往模型 API 的 SSE 流式请求
- **Application → IndexedDB**：检查 Dexie 的 tasks / messages 表

### 主进程

主进程代码跑在 Node 里，没有页面 DevTools。三个手段：

1. **终端日志**：`console.log` 直接输出到启动 Electron 的终端——loop、executor、IPC 处理器里都可以打点
2. **VS Code 调试器附加**（`.vscode/launch.json`）：

```json
{
  "type": "node",
  "request": "attach",
  "name": "Electron Main",
  "continueOnAttach": true,
  "skipFiles": ["<node_internals>/**"]
}
```

启动后用「Inspect: brk」或在主进程代码加 `debugger` 断点。

3. **环境变量开关**：`ELECTRON_ENABLE_LOGGING=1 pnpm electron:dev` 把渲染进程 console 也镜像到终端。

### 浏览器 Mock 模式

`pnpm dev`（第 5 章）不启动 Electron：改 UI 组件时迭代最快，且 `services/ipc.ts` 的 Mock 会模拟 Agent 事件序列——**调流式渲染逻辑不需要 API Key**。

### agent-core 单独验证

`agent-core` 不依赖 Electron（第 2 章的解耦红利），可以直接写脚本验证：

```bash
npx tsx -e "
import { start } from './agent-core/loop'
// 构造 params，onEvent 里 console.log —— 无窗口环境跑完整 Loop
"
```

## 13.3 最佳实践清单

### 安全

- ✅ `nodeIntegration: false` + `contextIsolation: true`（第 3 章）
- ✅ preload 白名单暴露，永不直接暴露 `ipcRenderer`（第 4 章）
- ✅ API Key 只存主进程侧文件，渲染进程只在调用时透传（第 4 章）
- ✅ 工具执行过沙箱：`validatePath` + `validateCommand`（第 10 章）
- ⚠️ 展示模型生成的 HTML 时（BrowserPreview 类场景）用 `srcdoc` iframe 沙箱隔离，不给 `allow-same-origin`

### 性能

- ✅ `text_delta` 高频推送时，UI 层做节流/合并（第 9 章思考题）
- ✅ 长消息列表虚拟化或隔离流式组件的重渲染范围
- ✅ 工具输出截断（超大输出只回传头部 + 提示），防上下文爆炸
- ✅ `MAX_ITERATIONS` / `TIMEOUT_MS` 保持开启——它们救过每一个 Agent 开发者（第 10 章）

### 可维护性

- ✅ 三层防腐：`LLMMessage/LLMChunk` 协议隔离 pi-ai；`AgentEvent` 隔离 Electron；`ElectronAPI` 隔离 preload（第 5、6 章）
- ✅ 通道命名 `模块:动作`；事件 `taskId` 路由（第 4、5 章）
- ✅ `pnpm lint`（tsc --noEmit）进 CI，类型即文档
- ✅ 错误信息当数据回填给模型，别只给用户看（第 7、8 章）

## 13.4 实战：给应用加「关于」弹窗（打包验证）

综合练习，串起 IPC + UI + 打包：

1. 主进程：`ipcMain.handle('app:getInfo', () => ({ version: app.getVersion(), platform: process.platform, electron: process.versions.electron }))`
2. preload：白名单加 `getAppInfo`
3. UI：设置页加「关于」区块，展示三元组
4. `pnpm electron:build` 打出 dmg，安装后验证弹窗正常——**验证 preload 与 CSP 在生产模式下同样工作**

打包成功 + 生产模式功能正常，一个 Electron Agent 项目才算真正「毕业」。

## 13.5 小结

- electron-builder 三平台配置；files 列表精确到产物目录
- 渲染进程用 DevTools；主进程用终端日志或 VS Code attach；Mock 模式快速迭代 UI
- 安全、性能、可维护性三张清单过一遍再发布
- 生产模式验证（打包后跑一遍核心链路）是不可省略的最后一步
