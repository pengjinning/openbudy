<p align="center">
  <h1 align="center">🤖 OpenBudy</h1>
  <p align="center"><strong>AI 智能体桌面工作台 — 商用 Agent 的开源替代</strong></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-30-47848f?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Ant_Design-6-0170fe?logo=antdesign" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

**语言 / Language:** [中文](readme.zh.md) | [English](readme.md)

---

## 📖 什么是 OpenBudy？

OpenBudy 是一个 **开源的 AI Agent 桌面工作台**，用 TypeScript 全栈实现。你只需用自然语言描述需求，OpenBudy 就能**自主规划、执行并交付完整结果**。

它是商用 AI 智能体桌面工作台的功能级开源替代，将 AI Agent 的执行能力与精美的可视化管理界面合二为一。

### ✨ 亮点

- 🧠 **Agent Loop** — 五阶段自主执行：分析 → 规划 → 执行 → 观察 → 交付
- 🛠️ **工具调用** — 内置 Shell 命令、文件读写、网页搜索、网页抓取 5 大工具
- 💬 **流式对话** — 实时流式响应，支持 Markdown 渲染 + 代码语法高亮
- 📊 **结果面板** — 文件树、Diff 变更对比、产物概览一目了然
- 🏖️ **沙箱安全** — 工作区目录隔离 + 危险命令自动拦截 + 显式用户确认
- 🔌 **多模型** — 默认 DeepSeek，支持任意 OpenAI 兼容 API
- 🌗 **深色/浅色主题** — 一键切换，基于 Ant Design ConfigProvider
- 🖥️ **Electron 桌面** — 原生桌面应用 + 浏览器 Mock 模式开发调试

---

## 🏗️ 技术栈

| 层级           | 技术方案                                              |
| -------------- | ----------------------------------------------------- |
| 桌面框架       | Electron 30                                           |
| 前端           | React 19 + TypeScript 5 + Ant Design 6                |
| 状态管理       | Zustand 4                                             |
| 构建工具       | Vite 5 + vite-plugin-electron                         |
| 本地存储       | IndexedDB（Dexie.js 4 封装）                          |
| 代码 / Diff    | Monaco Editor                                         |
| Markdown       | react-markdown + remark-gfm + rehype-highlight        |
| AI 客户端      | OpenAI 兼容 fetch（SSE 流式）                         |
| 打包分发       | electron-builder                                      |

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18
- **pnpm**（推荐）

### 安装运行

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/openbudy.git
cd openbudy

# 2. 安装依赖
pnpm install

# 3. 启动开发
pnpm dev             # 浏览器模式（纯 UI 调试，无需 Electron）
pnpm electron:dev    # Electron 桌面应用
```

### 配置 AI 模型

1. 启动应用
2. 打开 **设置** → 填入你的 **DeepSeek API Key**（或其他 OpenAI 兼容接口地址）
3. 开始创建任务！

---

## 📁 项目结构

```
openbudy/
├── electron/                     # Electron 主进程
│   ├── main.ts                   # 主进程入口
│   ├── preload.ts                # 预加载脚本（安全 IPC 桥接）
│   └── ipc/                      # IPC 通信处理
│       ├── agent.ts              # Agent 执行 IPC
│       ├── file.ts               # 文件操作 IPC
│       └── storage.ts            # 配置读写 IPC
├── src/                          # React 渲染进程
│   ├── main.tsx                  # React 入口
│   ├── App.tsx                   # 根组件（ConfigProvider 主题注入）
│   ├── types/index.ts            # TypeScript 类型定义
│   ├── services/
│   │   ├── db.ts                 # Dexie 数据库（IndexedDB）
│   │   └── ipc.ts                # IPC 桥接 + 浏览器 Mock
│   ├── stores/                   # Zustand 状态管理
│   │   ├── taskStore.ts          # 任务状态
│   │   ├── chatStore.ts          # 对话状态
│   │   ├── resultStore.ts        # 结果面板状态
│   │   └── settingsStore.ts      # 设置状态
│   ├── hooks/                    # 自定义 React Hooks
│   │   ├── useAgent.ts           # Agent 交互 Hook
│   │   ├── useTask.ts            # 任务管理 Hook
│   │   └── useFileUpload.ts      # 文件上传 Hook
│   └── components/
│       ├── layout/               # 布局：Sidebar、ChatArea、ResultPanel
│       ├── task/                 # 任务：TaskList、TaskCard、TaskSearch、TaskFilter
│       ├── chat/                 # 对话：ChatHeader、MessageList、ChatInput、ToolCallCard
│       └── result/               # 结果：ResultTabs、FileTree、FilePreview、DiffView
├── agent-core/                   # Agent 核心引擎
│   ├── loop.ts                   # Agent Loop 主控制器
│   ├── planner.ts                # System Prompt 模板
│   ├── executor.ts               # 工具执行调度
│   ├── monitor.ts                # 超时/重试监控
│   ├── sandbox.ts                # 安全沙箱
│   ├── llm/                      # LLM 客户端
│   │   ├── client.ts             # 基础 OpenAI 兼容客户端
│   │   ├── deepseek.ts           # DeepSeek 客户端
│   │   └── model-registry.ts     # 模型注册表
│   └── tools/                    # 内置工具集
│       ├── registry.ts           # 工具注册表
│       ├── shell.ts              # Shell 命令执行
│       ├── file-read.ts          # 文件读取
│       ├── file-write.ts         # 文件写入
│       ├── web-search.ts         # 网页搜索
│       └── web-fetch.ts          # 网页内容抓取
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── electron-builder.yml
└── index.html
```

---

## 🧠 Agent Loop 执行流程

OpenBudy 的 Agent 遵循五阶段循环执行：

```
ANALYZE  分析  →  解析用户意图、识别任务类型
   ↓
PLAN     规划  →  拆解子任务、选择最优工具
   ↓
EXECUTE  执行  →  调用工具 (Shell / File / Web) ←──┐
   ↓                                                 │
OBSERVE  观察  →  检查执行结果、判断是否达标 ────────┘
   ↓
DELIVER  交付  →  汇总结果、生成产物、更新状态
```

**安全保护**：最大 30 轮迭代、600 秒超时、失败自动重试最多 3 次、危险命令需用户显式确认。

---

## 🛠️ 内置工具

| 工具         | 描述                         |
| ------------ | ---------------------------- |
| `shell`      | 沙箱内执行 Shell 命令         |
| `file_read`  | 读取工作区文件内容            |
| `file_write` | 在工作区内写入/修改文件        |
| `web_search` | 网页搜索（MVP 阶段 Mock）     |
| `web_fetch`  | 抓取并解析网页内容            |

所有工具均采用 JSON Schema 定义，兼容 OpenAI Function Calling 标准。

---

## 📊 功能概览

### MVP（当前版本）

- [x] 三区域布局（侧边栏 / 对话区 / 结果区）
- [x] 任务 CRUD + 状态流转（规划中 → 进行中 → 已完成/失败/中断）
- [x] 多任务并行执行
- [x] Agent Loop + 5 个内置工具
- [x] 流式对话 + Markdown 渲染 + 代码高亮
- [x] 文件树预览 + Monaco Diff 对比
- [x] 工作区沙箱 + 危险操作拦截
- [x] 多模型切换（默认 DeepSeek）
- [x] 深色/浅色主题切换
- [x] 文件上传（点击、拖拽、Ctrl+V 粘贴）
- [x] 浏览器 Mock 模式（无需 Electron 即可调试 UI）

### 路线图（V1.1+）

- [ ] Skills 技能系统（SKILL.md）
- [ ] MCP 协议支持
- [ ] 浏览器自动化（Playwright）
- [ ] 内置浏览器预览
- [ ] 任务分享
- [ ] IM 远程控制
- [ ] 国际化（i18n）

---

## 🔒 安全性

- 所有文件操作限定在工作区目录（默认 `~/openbudy-workspace/`）
- 危险命令（如 `rm -rf /`、`mkfs`、`dd`）需要显式用户确认
- 系统敏感路径（`/etc`、`/proc`、`/system`）完全禁止访问
- 每次工具调用记录时间戳、命令、参数及结果，可审计
- 危险操作 5 秒内未确认则自动拒绝

---

## 🧑‍💻 开发命令

```bash
# TypeScript 类型检查
pnpm lint

# 生产构建
pnpm build

# Electron 安装包构建
pnpm electron:build
```

---

## 📄 开源协议

MIT © OpenBudy Contributors
