<p align="center">
  <h1 align="center">🤖 OpenBuddy</h1>
  <p align="center"><strong>AI Agent Desktop Workbench — Open-Source WorkBuddy Alternative</strong></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-30-47848f?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Ant_Design-6-0170fe?logo=antdesign" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## 📖 What is OpenBuddy?

OpenBuddy is an **open-source AI Agent desktop workbench** built with TypeScript. You describe what you want in natural language — OpenBuddy **plans, executes, and delivers complete results** autonomously.

It is a feature-complete open-source alternative to Tencent's WorkBuddy, bringing the power of an AI agent with a polished visual management UI.

### ✨ Highlights

- 🧠 **Agent Loop** — Five-phase execution: Analyze → Plan → Execute → Observe → Deliver
- 🛠️ **Tool Calling** — Built-in tools: Shell, File Read/Write, Web Search, Web Fetch
- 💬 **Streaming Chat** — Real-time streaming responses with Markdown + code highlighting
- 📊 **Result Panel** — File tree, diff view, and deliverables overview in one place
- 🏖️ **Sandbox** — Workspace-scoped file/shell execution with danger detection
- 🔌 **Multi-Model** — Default DeepSeek; supports any OpenAI-compatible API
- 🌗 **Dark/Light Themes** — Toggle between themes powered by Ant Design ConfigProvider
- 🖥️ **Electron Desktop** — Native desktop app + browser mock mode for development

---

## 🏗️ Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Desktop Shell    | Electron 30                                         |
| Frontend         | React 19 + TypeScript 5 + Ant Design 6              |
| State Management | Zustand 4                                           |
| Build Tool       | Vite 5 + vite-plugin-electron                       |
| Local Storage    | IndexedDB via Dexie.js 4                            |
| Code / Diff      | Monaco Editor                                       |
| Markdown         | react-markdown + remark-gfm + rehype-highlight      |
| AI Client        | OpenAI-compatible fetch (SSE streaming)             |
| Packaging        | electron-builder                                    |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended)

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/your-org/openbudy.git
cd openbudy

# 2. Install dependencies
pnpm install

# 3. Start developing
pnpm dev             # Browser mode (pure UI debugging, no Electron required)
pnpm electron:dev    # Electron desktop app
```

### Configure AI Model

1. Launch the app
2. Open **Settings** → fill in your **DeepSeek API Key** (or any OpenAI-compatible endpoint)
3. Start creating tasks!

---

## 📁 Project Structure

```
openbudy/
├── electron/                     # Electron main process
│   ├── main.ts                   # Main process entry
│   ├── preload.ts                # Preload script (secure IPC bridge)
│   └── ipc/                      # IPC handlers
│       ├── agent.ts              # Agent execution IPC
│       ├── file.ts               # File operations IPC
│       └── storage.ts            # Config read/write IPC
├── src/                          # React renderer process
│   ├── main.tsx                  # React entry
│   ├── App.tsx                   # Root component (ConfigProvider)
│   ├── types/index.ts            # TypeScript type definitions
│   ├── services/
│   │   ├── db.ts                 # Dexie database (IndexedDB)
│   │   └── ipc.ts                # IPC bridge + browser mock
│   ├── stores/                   # Zustand stores
│   │   ├── taskStore.ts          # Task state
│   │   ├── chatStore.ts          # Conversation state
│   │   ├── resultStore.ts        # Result panel state
│   │   └── settingsStore.ts      # Settings state
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAgent.ts           # Agent interaction hook
│   │   ├── useTask.ts            # Task management hook
│   │   └── useFileUpload.ts      # File upload hook
│   └── components/
│       ├── layout/               # AppLayout, Sidebar, ChatArea, ResultPanel
│       ├── task/                 # TaskList, TaskCard, TaskSearch, TaskFilter
│       ├── chat/                 # ChatHeader, MessageList, ChatInput, ToolCallCard
│       └── result/               # ResultTabs, FileTree, FilePreview, DiffView, BrowserPreview
├── agent-core/                   # Agent core engine
│   ├── loop.ts                   # Agent Loop controller
│   ├── planner.ts                # System prompt templates
│   ├── executor.ts               # Tool execution dispatcher
│   ├── monitor.ts                # Timeout / retry monitor
│   ├── sandbox.ts                # Security sandbox
│   ├── llm/                      # LLM clients
│   │   ├── client.ts             # Base OpenAI-compatible client
│   │   ├── deepseek.ts           # DeepSeek client
│   │   └── model-registry.ts     # Model registry
│   └── tools/                    # Built-in tools
│       ├── registry.ts           # Tool registry
│       ├── shell.ts              # Shell execution
│       ├── file-read.ts          # File read
│       ├── file-write.ts         # File write
│       ├── web-search.ts         # Web search
│       └── web-fetch.ts          # Web page fetch
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── electron-builder.yml
└── index.html
```

---

## 🧠 Agent Loop

OpenBuddy's Agent runs a five-phase execution loop:

```
ANALYZE  →  Parse user intent, identify task type
   ↓
PLAN     →  Decompose into subtasks, select optimal tools
   ↓
EXECUTE  →  Invoke tools (Shell / File / Web) ←──────┐
   ↓                                                   │
OBSERVE  →  Check results, decide next action ─────────┘
   ↓
DELIVER  →  Summarize results, produce artifacts
```

**Safety guards**: Max 30 iterations, 600s timeout, auto-retry up to 3 times, danger command detection with explicit user confirmation.

---

## 🛠️ Built-in Tools

| Tool        | Description                           |
| ----------- | ------------------------------------- |
| `shell`     | Execute shell commands in sandbox      |
| `file_read` | Read file contents within workspace    |
| `file_write`| Write/modify files within workspace    |
| `web_search`| Search the web (mock in MVP)           |
| `web_fetch` | Fetch and parse webpage content        |

All tools use JSON Schema definitions compatible with OpenAI Function Calling.

---

## 📊 Features

### MVP (Current)

- [x] Three-panel layout (Sidebar / Chat / Results)
- [x] Task CRUD with status workflow (planning → running → completed/failed/stopped)
- [x] Multi-task parallel execution
- [x] Agent Loop with 5 built-in tools
- [x] Streaming chat with Markdown + syntax highlighting
- [x] File tree + Monaco diff view
- [x] Workspace sandbox with danger detection
- [x] Multi-model support (DeepSeek default)
- [x] Dark / Light theme toggle
- [x] File upload (click, drag & drop, Ctrl+V paste)
- [x] Browser mock mode for UI development

### Roadmap (V1.1+)

- [ ] Skills system (SKILL.md)
- [ ] MCP protocol support
- [ ] Browser automation (Playwright)
- [ ] Built-in browser preview
- [ ] Task sharing
- [ ] IM remote control
- [ ] i18n support

---

## 🔒 Security

- All file operations are scoped within the workspace directory (`~/openbudy-workspace/` by default)
- Danger commands (e.g., `rm -rf /`, `mkfs`, `dd`) require explicit user confirmation
- Sensitive system paths (`/etc`, `/proc`, `/system`) are blocked entirely
- Every tool execution is logged with timestamp, command, parameters, and results
- 5-second auto-reject for unconfirmed dangerous operations

---

## 🧑‍💻 Development

```bash
# Type check
pnpm lint

# Build for production
pnpm build

# Build Electron distributable
pnpm electron:build
```

---

## 📄 License

MIT © OpenBuddy Contributors
