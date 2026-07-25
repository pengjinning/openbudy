# WorkBuddy 复刻项目 — 产品需求规划文档 v3.1

> **版本**：v3.1  
> **日期**：2026-07-25  
> **阶段**：需求规划（阶段一）  
> **文档类型**：需求概要 + 竞品调研 + 功能清单 + 风险分析 + 实施路径  

---

## 目录

- [一、项目背景与目标](#一项目背景与目标)
- [二、用户画像与痛点分析](#二用户画像与痛点分析)
- [三、竞品调研与行业分析](#三竞品调研与行业分析)
- [四、产品定位与差异化策略](#四产品定位与差异化策略)
- [五、核心功能清单（EARS 原则）](#五核心功能清单ears-原则)
- [六、用户旅程与核心流程](#六用户旅程与核心流程)
- [七、交互设计与页面结构](#七交互设计与页面结构)
- [八、技术架构设计](#八技术架构设计)
- [九、数据模型设计](#九数据模型设计)
- [十、数据指标与埋点需求](#十数据指标与埋点需求)
- [十一、价值评估与优先级排序](#十一价值评估与优先级排序)
- [十二、风险评估与缓解策略](#十二风险评估与缓解策略)
- [十三、依赖分析与资源估算](#十三依赖分析与资源估算)
- [十四、验收标准](#十四验收标准)
- [十五、术语表](#十五术语表)
- [十六、待确认问题清单](#十六待确认问题清单)
- [十七、后续流转建议](#十七后续流转建议)

---

## 一、项目背景与目标

### 1.1 背景

2026 年，AI Agent 已从"对话式助手"进化到"执行式数字劳动力"。以 OpenClaw（315K GitHub Stars）为代表的开源 Agent 框架，以及以 WorkBuddy 为代表的商用产品，标志着 AI 能力从**生成建议**到**自主执行任务并交付结果**的范式转变。

WorkBuddy 是腾讯云 CodeBuddy 团队于 2026 年 3 月正式推出的全场景 AI 智能体桌面工作台，基于 OpenClaw 架构深度改造，支持自然语言驱动本地文件操作、多 Agent 并行执行、MCP 协议扩展和 IM 远程控制。上线后已在腾讯内部覆盖 2000+ 非技术员工，成为"腾讯版小龙虾"。

### 1.2 项目目标

使用 TypeScript 实现一个功能复刻 WorkBuddy 的项目（以下简称"本项目"）：

| 维度 | 目标 |
| ------ | ------ |
| **功能完整度** | 覆盖 WorkBuddy 核心功能（任务系统、对话交互、结果展示、Agent Loop、扩展生态） |
| **交互体验** | 三区域布局一致性、实时执行反馈、流畅的对话体验 |
| **技术架构** | 可扩展的 Agent 框架、支持多模型接入、安全的沙箱执行环境 |
| **可维护性** | 模块化设计、清晰的代码分层、良好的 TypeScript 类型定义 |
| **MVP 目标** | 先实现核心闭环（任务 + Agent + 对话 + 结果），后续迭代扩展功能 |

### 1.3 已确认的核心决策

| 决策项 | 确认结果 |
| -------- | --------- |
| 前端框架 | React 19 + TypeScript 5 |
| UI 组件库 | Ant Design 6（antd + @ant-design/icons） |
| 桌面方案 | Electron 30 |
| 构建工具 | Vite 5 + vite-plugin-electron |
| 状态管理 | Zustand 4 |
| 数据存储 | 本地 IndexedDB（Dexie.js 封装） |
| 默认 AI 模型 | DeepSeek（OpenAI 兼容 API），支持多模型切换 |
| MVP 范围 | A（任务系统）+ B（Agent 核心）+ C（对话与结果），约 60% 功能 |
| DeepSeek API Key | 用户在设置页面自行填写 |
| Web Search 工具 | MVP 先 Mock 返回，后续接入真实 API |
| 开发调试 | 支持浏览器 Mock 模式（pnpm dev 纯浏览器调试） |
| 默认主题 | 深色模式（支持切换浅色） |

---

## 二、用户画像与痛点分析

### 2.1 目标用户画像

#### 画像一：非技术办公人员

| 属性 | 描述 |
| ------ | ------ |
| **角色** | HR、行政、运营、销售、财务 |
| **技术能力** | 低，不熟悉命令行和编程 |
| **日常工作** | 数据处理、文档撰写、PPT 制作、文件整理 |
| **核心痛点** | 重复性工作耗时、不会写代码处理数据、跨工具操作繁琐 |
| **使用场景** | 一句话生成周报、批量重命名文件、自动生成 PPT |
| **优先级** | P1（后期扩展） |

#### 画像二：开发者/技术人员

| 属性 | 描述 |
| ------ | ------ |
| **角色** | 前端/后端/全栈工程师、架构师 |
| **技术能力** | 高，熟悉编程和命令行 |
| **日常工作** | 代码编写、Bug 修复、代码审查、项目理解 |
| **核心痛点** | 重复编码任务耗时、陌生代码库理解困难、环境配置复杂 |
| **使用场景** | 自动代码审查、全栈应用快速搭建、项目架构理解 |
| **优先级** | P0（MVP 核心用户） |

#### 画像三：创作者/自媒体运营

| 属性 | 描述 |
| ------ | ------ |
| **角色** | 内容创作者、自媒体运营、设计师 |
| **技术能力** | 中，会使用工具但不会编程 |
| **日常工作** | 选题分析、文案创作、封面设计、多平台分发 |
| **核心痛点** | 创作效率低、多平台运营耗时长、缺乏设计能力 |
| **使用场景** | AI 驱动选题+文案+封面全流程、多模态内容生成 |
| **优先级** | P1（后期扩展） |

#### 画像四：管理者/决策者

| 属性 | 描述 |
| ------ | ------ |
| **角色** | 团队负责人、项目经理、创业者 |
| **技术能力** | 中低，关注结果不关注过程 |
| **日常工作** | 数据分析、报告制作、任务分配、决策支持 |
| **核心痛点** | 信息分散在多个系统、数据洞察不够及时、汇报材料制作耗时 |
| **使用场景** | 自动生成业务分析报告、CRM 数据洞察、团队协作自动化 |
| **优先级** | P1（后期扩展） |

### 2.2 核心痛点 → 解决方案映射

| 痛点 | 现状 | 本项目解决方案 |
| ------ | ------ | --------------- |
| **"AI 只会聊天，不会干活"** | ChatGPT 等只能提供建议，无法操作文件 | Agent 自主执行：读文件→处理→输出可交付结果 |
| **"重复工作太多"** | 手动整理文件、做表、写报告 | 一句话描述需求，自动拆解和执行 |
| **"跨工具操作繁琐"** | 数据在 Excel、Word、PPT 之间来回搬运 | 统一的工作空间，一次描述生成多种产出 |
| **"配置太复杂"** | 开源 Agent 框架需要命令行和配置文件 | Electron 桌面应用，接近零配置上手 |
| **"不方便移动办公"** | 离开电脑就无法处理紧急任务 | 后续可扩展 IM 远程控制 |
| **"AI 不理解我的业务"** | 通用 AI 不了解特定领域 SOP | Skills 技能系统注入领域知识（后续版本） |

---

## 三、竞品调研与行业分析

### 3.1 竞品矩阵

| 维度 | **WorkBuddy** | **OpenClaw** | **Claude Computer Use** | **OpenAI Operator** | **阿里 PC-Agent** | **Manus AI** |
| ------ | :---: | :---: | :---: | :---: | :---: | :---: |
| **产品定位** | 商用桌面 Agent | 开源 Agent 框架 | 安全可解释 Agent | 开发运维 Agent | 多智能体协作 | 文档代码生成 |
| **GitHub Stars** | - | 315K | - | - | 开源 | - |
| **部署方式** | 桌面客户端 | 本地 npm | 企业许可 | API 调用 | 开源部署 | SaaS |
| **自然语言交互** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **本地文件操作** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **多 Agent 并行** | ✅ | ✅（Sub-agent） | ❌ | ❌ | ✅ | ❌ |
| **多任务并行** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Skills 技能系统** | ✅（SKILL.md） | ✅（ClawHub） | ❌ | ❌ | ❌ | ❌ |
| **MCP 协议** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **IM 远程控制** | ✅（5 平台） | ✅（20+ 平台） | ❌ | ❌ | ❌ | ❌ |
| **可视化任务管理** | ✅（三区域 UI） | ❌ | ❌ | ❌ | ✅ | ✅ |
| **文件 Diff 视图** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **内置浏览器预览** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **安全性** | 企业级沙箱 | 需自行加固 | 企业级 | API 级别 | 中 | SaaS 级别 |
| **上手难度** | 低 | 高（需命令行） | 中 | 中 | 中 | 低 |
| **定价** | 免费+积分 | 免费开源 | 企业许可 | API 计费 | 免费开源 | SaaS 订阅 |

### 3.2 竞品启示

**OpenClaw 的启示**：

- 开源生态活跃度极高，315K Stars 证明市场对"AI 执行体"的需求真实且强烈
- "消息即界面"降低使用门槛，但缺乏可视化管理后台
- 安全是最大短板，需要企业级加固

**WorkBuddy 的差异化策略**：

- 在 OpenClaw 基础上补齐了**可视化管理界面**（三区域布局 + 任务面板）
- 增强了**企业级安全**（沙箱隔离 + 显式授权 + 审计日志）
- 降低了**使用门槛**（免部署 + 图形化操作 + 自然语言交互）

**本项目的市场机会**：

- 开源社区没有"WorkBuddy 级别"的可视化 Agent 管理工具
- 可以借鉴 WorkBuddy 的设计思路，打造一个 TypeScript 全栈的开源替代
- 重点复刻 WorkBuddy 独有的三区域布局、任务管理、Skills 扩展等差异化功能

---

## 四、产品定位与差异化策略

### 4.1 产品定位

> **一句话定位**：一个用 TypeScript 全栈（Electron + React + Antd）实现的 AI Agent 工作台，用户用自然语言描述需求，AI 自主规划、执行并交付完整结果。

### 4.2 与 WorkBuddy 的差异化策略

| 维度 | WorkBuddy | 本项目策略 |
| ------ | ----------- | ----------- |
| **技术栈** | 闭源桌面客户端 | 开源全栈 TypeScript（Electron + React） |
| **部署** | 桌面安装包 | Electron 桌面应用（跨平台） |
| **开发调试** | 需安装客户端 | 支持浏览器 Mock 模式，无需 Electron 即可调试 UI |
| **AI 模型** | 混元 + DeepSeek 等 | 默认 DeepSeek，支持 OpenAI/Claude 等任意兼容 API |
| **UI 方案** | 自研 UI | Ant Design 6（企业级组件库，开发效率高） |
| **扩展性** | Skills + MCP | Skills + MCP + Plugin 系统 |
| **代码开放性** | 闭源 | 完全开源 |
| **目标用户** | 所有办公人员 | 开发者优先 → 扩展到非技术人员 |

---

## 五、核心功能清单（EARS 原则）

### 5.1 模块 A：任务系统（P0 必须）

#### A1 任务创建

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| A1.1 | The system shall allow users to create a new task by typing a natural language description in the input box. | Ubiquitous |
| A1.2 | When the user clicks the send button or presses Ctrl+Enter, the system shall create the task and begin execution. | Event-driven |
| A1.3 | The system shall support three working modes: Ask（问答，不修改文件）、Craft（执行，可操作文件）、Plan（先生成计划确认后再执行）. | Ubiquitous |
| A1.4 | Where the user has selected a workspace directory, the system shall scope all file operations within that directory. | Optional |
| A1.5 | If the task description is empty, then the system shall disable the send button and show a placeholder hint. | Unwanted |

#### A2 任务管理

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| A2.1 | The system shall display all tasks in the left sidebar, grouped by workspace folders. | Ubiquitous |
| A2.2 | Each task card shall display: title, current status, and last updated time. | Ubiquitous |
| A2.3 | While a task is in progress, the system shall show a loading indicator on the task card. | State-driven |
| A2.4 | When the user clicks a task card, the system shall load the task's conversation and results in the main area. | Event-driven |
| A2.5 | The system shall support task status transitions: planning → running → completed / failed / stopped / archived. | Ubiquitous |
| A2.6 | When the user right-clicks a task, the system shall show a context menu with: pin, rename, delete, archive, share. | Event-driven |
| A2.7 | The system shall support searching tasks by title and filtering by status/date. | Ubiquitous |
| A2.8 | If a task fails, then the system shall allow the user to continue the conversation with additional context. | Unwanted |

#### A3 多任务并行

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| A3.1 | The system shall allow users to create and run multiple tasks simultaneously. | Ubiquitous |
| A3.2 | While multiple tasks are running, the system shall process them independently without blocking each other. | State-driven |
| A3.3 | When the user switches between tasks, the system shall preserve each task's full conversation context. | Event-driven |

### 5.2 模块 B：Agent 核心引擎（P0 必须）

#### B1 Agent Loop

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| B1.1 | The system shall implement an Agent Loop with five phases: Analyze → Plan → Execute → Observe → Deliver. | Ubiquitous |
| B1.2 | When the user submits a task, the system shall analyze the intent and decompose it into sub-tasks. | Event-driven |
| B1.3 | While executing, the system shall stream progress (steps, tool calls, intermediate results) in real-time to the conversation area. | State-driven |
| B1.4 | If a step fails, then the system shall attempt automatic retry up to 3 times before reporting failure. | Unwanted |
| B1.5 | When the user clicks the stop button, the system shall immediately halt execution and preserve partial results. | Event-driven |

#### B2 工具调用系统

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| B2.1 | The system shall support Function Calling via the LLM API to invoke tools. | Ubiquitous |
| B2.2 | The system shall provide 5 built-in tools (Shell Execute, File Read, File Write, Web Search, Web Fetch) and 1 tool registry for tool management. | Ubiquitous |
| B2.3 | The system shall define all tools using a standardized JSON Schema interface compatible with OpenAI function calling. | Ubiquitous |
| B2.4 | Where MCP protocol is enabled, the system shall support loading external tools via MCP servers. | Optional |

#### B3 沙箱执行环境

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| B3.1 | The system shall execute all file and shell operations within a sandboxed workspace directory. | Ubiquitous |
| B3.2 | The system shall prevent access to system-sensitive directories (e.g., /etc, /system, /proc). | Ubiquitous |
| B3.3 | If a dangerous operation is detected (e.g., rm -rf /, format, dd), then the system shall require explicit user confirmation. | Unwanted |
| B3.4 | The system shall log every tool execution with timestamp, command, parameters, and result for audit. | Ubiquitous |

#### B4 多模型支持

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| B4.1 | The system shall support DeepSeek as the default AI model. | Ubiquitous |
| B4.2 | Where the user configures additional models, the system shall allow switching between them via the model selector. | Optional |
| B4.3 | The system shall support any OpenAI-compatible API endpoint for custom model integration. | Ubiquitous |

### 5.3 模块 C：对话与结果系统（P0 必须）

#### C1 对话交互

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| C1.1 | The system shall maintain full conversation history within each task context. | Ubiquitous |
| C1.2 | When the user sends a follow-up message, the system shall continue processing with full context. | Event-driven |
| C1.3 | The system shall render Markdown content with GFM tables and code syntax highlighting. | Ubiquitous |
| C1.4 | The system shall support file upload via click, drag-and-drop, and Ctrl+V paste. | Ubiquitous |
| C1.5 | If the file format is unsupported, then the system shall show an error toast with the supported format list. | Unwanted |

#### C1.6 文件上传约束

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| C1.6.1 | The system shall limit individual file uploads to 10MB. | Ubiquitous |
| C1.6.2 | If a file exceeds 10MB, then the system shall reject the upload and suggest compressing the file. | Unwanted |
| C1.6.3 | The system shall automatically generate a task title from the first 30 characters of the user's first message if no title is provided. | Ubiquitous |

#### C2 结果展示

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| C2.1 | The system shall provide a right panel with three sub-views: Overview, Artifacts, and Diff. | Ubiquitous |
| C2.2 | The system shall provide a file tree view of the current workspace. | Ubiquitous |
| C2.3 | When the user selects a changed file, the system shall display a unified diff (additions in green, deletions in red). | Event-driven |
| C2.4 | The system shall provide a built-in browser iframe for previewing web content. | Ubiquitous |

### 5.4 模块 D：扩展系统（P1 后续版本）

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| D1 | The system shall support loading skills defined in SKILL.md files. | Ubiquitous |
| D2 | When a SKILL.md is loaded, the system shall inject its role, SOP, and domain knowledge into the Agent's system prompt. | Event-driven |
| D3 | The system shall support browser automation via Playwright. | Ubiquitous |
| D4 | The system shall support sharing a task via a public link. | Ubiquitous |
| D5 | The built-in browser iframe shall include a `sandbox` attribute restricting script execution and form submission. | Ubiquitous |

### 5.5 模块 E：体验优化（P1）

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| E1 | The system shall support light and dark themes with ConfigProvider. | Ubiquitous |
| E2 | The system shall support keyboard shortcuts: Ctrl+Enter（发送）, Ctrl+K（新建任务）. | Ubiquitous |
| E3 | The system shall persist all task data locally using IndexedDB. | Ubiquitous |
| E4 | The system shall show toast notifications for task completion, failure, and important events. | Event-driven |

### 5.6 模块 F：设置与配置（P0 必须）

#### F1 API Key 与模型配置

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| F1.1 | The system shall provide a settings panel for configuring AI model API keys. | Ubiquitous |
| F1.2 | When the user enters a valid API key, the system shall persist it securely and use it for subsequent LLM calls. | Event-driven |
| F1.3 | If the API key is empty or invalid, then the system shall show a warning and prevent task execution. | Unwanted |
| F1.4 | The system shall support adding, editing, and removing custom models with OpenAI-compatible endpoints. | Ubiquitous |

#### F2 工作目录配置

| ID | 需求描述 | EARS 类型 |
| ---- | --------- | ----------- |
| F2.1 | The system shall default the workspace root to `~/workbuddy-workspace/`. | Ubiquitous |
| F2.2 | Where the user selects a custom workspace directory, the system shall scope all file operations to that directory. | Optional |

---

## 六、用户旅程与核心流程

### 6.1 核心用户旅程

```bash
用户启动应用
    ↓
┌─────────────────┐
│  查看任务列表     │  ← 侧边栏：历史任务、搜索、筛选
│  (或创建新任务)   │
└────────┬────────┘
         ↓
┌─────────────────┐
│  描述需求        │  ← 输入自然语言 + 选择工作模式 + 上传文件
│  "帮我把销售     │     选择模型 + @引用上下文
│   数据生成报告"   │
└────────┬────────┘
         ↓ Ctrl+Enter
┌─────────────────┐
│  Agent 分析规划   │  ← 对话区实时展示
│  → 拆解子任务     │     "正在分析需求..."
│  → 选择工具       │     "规划步骤：1.读文件 2.分析 3.生成图表 4.输出报告"
└────────┬────────┘
         ↓
┌─────────────────┐
│  Agent 执行中    │  ← 流式展示工具调用、中间结果、进度
│  → Shell/File    │  ← 结果区实时更新文件列表
│  → Web Search    │
└────────┬────────┘
         ↓
┌─────────────────┐
│  查看结果        │  ← 右侧：产物 / 文件树 / Diff / 浏览器预览
│  继续追问/下载    │
└─────────────────┘
```

### 6.2 Agent Loop 五阶段

```bash
┌──────────────────────────────────────────────┐
│                 Agent Loop                    │
│                                               │
│  1. ANALYZE  解析用户意图、识别任务类型         │
│       ↓                                       │
│  2. PLAN     拆解为子任务、选择最优工具          │
│       ↓                                       │
│  3. EXECUTE  调用工具 (Shell/File/Web)  ←──┐   │
│       ↓                                    │   │
│  4. OBSERVE  检查结果、判断是否达标           │   │
│       ↓        继续/调整/完成 ─────────────┘   │
│  5. DELIVER  汇总结果、生成产出、更新状态       │
│                                               │
│ 终止条件: finish_reason=stop / 30轮 / 600s超时  │
└──────────────────────────────────────────────┘
```

---

## 七、交互设计与页面结构

### 7.1 全局布局（三区域设计）

```bash
┌──────────┬────────────────────────┬──────────────┐
│  侧边栏   │      对话区             │   结果区      │
│  (280px) │      (flex)            │   (360px)    │
│          │                        │              │
│ ┌──────┐ │ ┌────────────────────┐ │ ┌──────────┐ │
│ │搜索框 │ │ │ 任务标题栏          │ │ │ 概览｜产物│ │
│ └──────┘ │ │ [搜索][分享][历史]   │ │ │          │ │
│ ┌──────┐ │ └────────────────────┘ │ │ 📁文件树  │ │
│ │筛选  │ │ ┌────────────────────┐ │ │          │ │
│ └──────┘ │ │                    │ │ │ 📄内容   │ │
│          │ │  消息列表           │ │ │          │ │
│ 📋任务   │ │  (对话内容)         │ │ │ 🔄变更   │ │
│  ├ 任务1 │ │  💬 User: ...      │ │ │          │ │
│  ├ 任务2 │ │  🤖 Agent: ...     │ │ │ 🌐浏览器 │ │
│  └ 任务3 │ │  📊 工具调用记录     │ │ │          │ │
│          │ └────────────────────┘ │ └──────────┘ │
│ 📁空间   │ ┌────────────────────┐ │              │
│  ├ 项目A │ │ 输入框 [+@]  [发送] │ │              │
│  └ 项目B │ └────────────────────┘ │              │
│  👤头像  │                        │              │
└──────────┴────────────────────────┴──────────────┘
```

### 7.2 任务状态机

```bash
createTask()
     ↓
┌──────────┐  用户发消息
│ planning │──────────────┐
│ (规划中)  │              ↓
└──────────┘        ┌──────────┐  用户停止
                    │ running  │──────────┐
                    │ (进行中)  │          ↓
                    └────┬─────┘    ┌──────────┐
            ┌────────────┼──────┐   │ stopped  │
            ↓            ↓      ↓   │ (已中断)  │
    ┌──────────┐  ┌──────────┐     └──────────┘
    │completed │  │  failed  │
    │ (已完成)  │  │ (失败)   │
    └────┬─────┘  └────┬─────┘
         └──────┬──────┘
                ↓ archiveTask()
          ┌──────────┐
          │ archived │
          │ (已归档)  │
          └──────────┘
```

### 7.3 对话区状态清单

| 状态 | 描述 | 用户可见表现 |
| ------ | ------ | ------------- |
| 空对话 | 新建任务，尚无消息 | 显示输入引导文案 + 空状态插画 |
| 分析中 | Agent 正在理解需求 | 显示 Spin + "正在分析需求..." |
| 规划中 | Agent 正在拆解步骤 | Plan 模式下显示步骤列表 + 确认按钮 |
| 执行中 | Agent 正在调用工具 | 流式文本 + 工具调用卡片 + 实时进度 |
| 已中断 | 用户手动停止 | 显示已产出内容 + "继续"按钮 |
| 已完成 | 任务执行完成 | 显示结果摘要 + 产物列表 |
| 已失败 | 执行出错 | 显示错误详情 + 重试按钮 |
| 等待输入 | Agent 需要补充信息 | 显示 Agent 的提问 + 输入框 |

### 7.4 Ant Design 组件映射表

| 界面元素 | Antd 组件 | 关键配置 |
| --------- | ----------- | --------- |
| 整体布局 | Layout / Layout.Sider / Content | Sider width=280/360, collapsible |
| 主题 | ConfigProvider | theme.darkAlgorithm / defaultAlgorithm |
| 任务列表 | List | dataSource, renderItem, locale |
| 任务卡片 | Card | size=small, hoverable, onClick |
| 右键菜单 | Dropdown | trigger=['contextMenu'] |
| 新建弹窗 | Modal + Form | Form.useForm() |
| 搜索框 | Input.Search | onChange, allowClear |
| 筛选下拉 | Select | options, onChange |
| 模式切换 | Segmented | options=[{label,value}] |
| 模型选择 | Select | 自定义 labelRender |
| 加载指示 | Spin | spinning |
| 输入框 | Input.TextArea | autoSize={minRows:1,maxRows:6} |
| 文件上传 | Upload / Upload.Dragger | beforeUpload, multiple, accept |
| 工具调用卡片 | Collapse | items, expandIconPosition=start |
| 状态标签 | Tag / Badge | color 按状态变化 |
| 文件树 | Tree.DirectoryTree | treeData, onSelect, showIcon |
| 选项卡 | Tabs | items, onChange |
| 全局提示 | message | message.success/error/warning |
| 空状态 | Empty | description, image |
| 图标 | @ant-design/icons | 20+ 图标 |
| 代码/Diff | @monaco-editor/react | DiffEditor, Editor |

---

## 八、技术架构设计

### 8.1 总体架构

```bash
┌──────────────────────────────────────────┐
│           Electron Main Process           │
│  ┌────────────────────────────────────┐  │
│  │  BrowserWindow (React App)         │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │  Renderer Process            │  │  │
│  │  │  React 19 + Antd 6 + Zustand │  │  │
│  │  │  Dexie.js (IndexedDB)        │  │  │
│  │  └──────────┬───────────────────┘  │  │
│  │             │ IPC (contextBridge)   │  │
│  │  ┌──────────▼───────────────────┐  │  │
│  │  │  Agent Core                   │  │  │
│  │  │  Loop → Planner → Executor    │  │  │
│  │  │  Tools (Shell/File/Web)       │  │  │
│  │  │  LLM Client (DeepSeek API)    │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 8.2 技术栈总览

| 层级 | 技术选型 | 说明 |
| ------ | --------- | ------ |
| **桌面框架** | Electron 30 | 跨平台桌面应用 |
| **构建工具** | Vite 5 + vite-plugin-electron | 快速 HMR |
| **前端框架** | React 19 + TypeScript 5 | 用户指定 |
| **UI 组件库** | Ant Design 6 + @ant-design/icons | 企业级 React 组件库 |
| **状态管理** | Zustand 4 | 轻量、TS 友好 |
| **数据存储** | Dexie.js 4（IndexedDB） | 本地持久化 |
| **AI 客户端** | 自研（OpenAI 兼容 fetch） | 流式 SSE 支持 |
| **Markdown** | react-markdown + remark-gfm + rehype-highlight | 消息渲染 |
| **代码/Diff** | @monaco-editor/react | VS Code 内核 |
| **打包** | electron-builder | 跨平台打包 |

### 8.3 项目目录结构

```bash
workbuddy-clone/
├── electron/                    # Electron 主进程
│   ├── main.ts                  # 主进程入口
│   ├── preload.ts               # 预加载脚本（安全 API 桥接）
│   └── ipc/
│       ├── agent.ts             # Agent 执行 IPC
│       ├── file.ts              # 文件操作 IPC
│       └── storage.ts           # 配置读写 IPC
├── src/                         # React 渲染进程
│   ├── main.tsx                 # React 入口
│   ├── App.tsx                  # 根组件（ConfigProvider）
│   ├── App.css                  # 全局样式
│   ├── types/index.ts           # TS 类型定义
│   ├── services/
│   │   ├── db.ts                # Dexie 数据库
│   │   └── ipc.ts               # IPC 桥接 + Mock
│   ├── stores/                  # Zustand stores
│   │   ├── taskStore.ts
│   │   ├── chatStore.ts
│   │   ├── resultStore.ts
│   │   └── settingsStore.ts
│   ├── hooks/
│   │   ├── useAgent.ts
│   │   ├── useTask.ts
│   │   └── useFileUpload.ts
│   └── components/
│       ├── layout/              # AppLayout/Sidebar/ChatArea/ResultPanel
│       ├── task/                # TaskList/Card/Search/Filter/NewButton
│       ├── chat/                # ChatHeader/MessageList/Item/Input/ToolCard/ModelSelector
│       └── result/              # ResultTabs/FileTree/Preview/DiffView/Browser
├── agent-core/                  # Agent 核心
│   ├── loop.ts                  # Agent Loop 主控
│   ├── planner.ts               # System Prompt 模板
│   ├── executor.ts              # 工具执行调度
│   ├── monitor.ts               # 超时/重试监控
│   ├── sandbox.ts               # 安全沙箱
│   ├── llm/                     # client/deepseek/model-registry
│   └── tools/                   # registry/shell/file-read/file-write/web-search/web-fetch
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── electron-builder.yml
└── index.html
```

---

## 九、数据模型设计

### 9.1 IndexedDB 表结构（Dexie.js）

#### tasks 表

| 字段 | 类型 | 索引 | 说明 |
| ------ | ------ | :--: | ------ |
| id | string (UUID) | 主键 | 任务唯一标识 |
| title | string | - | 任务标题 |
| mode | 'ask' \| 'craft' \| 'plan' | - | 工作模式 |
| status | TaskStatus | ✅ | planning/running/completed/failed/archived |
| workspacePath | string | - | 工作目录路径 |
| modelId | string | - | 使用的模型 ID |
| createdAt | number | ✅ | 创建时间戳 |
| updatedAt | number | ✅ | 更新时间戳 |
| pinned | boolean | ✅ | 是否置顶 |

#### messages 表

| 字段 | 类型 | 索引 | 说明 |
| ------ | ------ | :--: | ------ |
| id | string (UUID) | 主键 | 消息唯一标识 |
| taskId | string | ✅ | 关联任务 ID |
| role | 'user' \| 'assistant' \| 'tool' \| 'system' | ✅ | 消息角色 |
| content | string | - | Markdown 文本 |
| toolCalls | ToolCall[] \| null | - | 工具调用记录 |
| toolResults | ToolResult[] \| null | - | 工具返回结果 |
| createdAt | number | ✅ | 创建时间戳 |

#### artifacts 表

| 字段 | 类型 | 索引 | 说明 |
| ------ | ------ | :--: | ------ |
| id | string (UUID) | 主键 | 产物唯一标识 |
| taskId | string | ✅ | 关联任务 ID |
| fileName | string | - | 文件名 |
| filePath | string | - | 完整路径 |
| fileType | string | ✅ | 文件扩展名 |
| size | number | - | 文件大小（字节） |
| createdAt | number | ✅ | 创建时间戳 |

### 9.2 IPC 通道定义

| 通道名 | 方向 | 参数 | 返回值 |
| -------- | :--: | ------ | -------- |
| agent:execute | 渲染→主 | {taskId, userMessage, mode, modelId, workspacePath, historyMessages} | {success, error?} |
| agent:stop | 渲染→主 | taskId | void |
| agent:event | 主→渲染 | AgentEvent | - |
| file:read | 渲染→主 | filePath | string |
| file:write | 渲染→主 | filePath, content | void |
| file:list | 渲染→主 | dirPath | FileNode[] |
| file:delete | 渲染→主 | filePath | void |
| file:mkdir | 渲染→主 | dirPath | void |
| file:getWorkspacePath | 渲染→主 | taskId | string |
| file:selectDirectory | 渲染→主 | - | string \| null |
| storage:get | 渲染→主 | key | unknown |
| storage:set | 渲染→主 | key, value | void |
| storage:delete | 渲染→主 | key | void |

### 9.3 并发控制策略

| 场景 | 策略 |
| ------ | ------ |
| 单任务文件写入 | 串行执行，同一任务内工具调用按顺序执行 |
| 多任务并行 | 每个任务使用独立的 workspace 子目录，避免文件冲突 |
| IndexedDB 写入 | Dexie 事务保证原子性，同一 store 内操作串行化 |
| Agent Loop 并发 | 每个任务独立 AbortController，通过 Map<taskId, AbortController> 管理 |

### 9.4 错误码定义

| 错误码 | 含义 | 触发条件 | 用户提示 |
| :---: | ------ | ------ | ------ |
| E001 | LLM API 密钥无效 | API 返回 401 | "API Key 无效，请检查设置" |
| E002 | LLM API 频率限制 | API 返回 429 | "请求频率过高，请稍后重试" |
| E003 | LLM API 服务不可用 | API 返回 5xx 或超时 | "模型服务暂时不可用，请稍后重试" |
| E004 | Agent 执行超时 | 超过 600s 未完成 | "任务执行超时，请简化需求后重试" |
| E005 | Agent 达到最大迭代 | 超过 30 轮工具调用 | "任务过于复杂，请拆分后重试" |
| E006 | 沙箱拦截危险操作 | 命令匹配黑名单 | "检测到危险操作，已自动拦截" |
| E007 | 文件操作权限不足 | 文件系统返回 EACCES | "文件权限不足，请检查目录权限" |
| E008 | IndexedDB 写入失败 | 存储满或事务冲突 | "本地存储异常，请清理缓存后重试" |
| E009 | 网络连接失败 | fetch 异常 | "网络连接失败，请检查网络设置" |
| E010 | 不支持的文件格式 | 上传了不支持的文件类型 | "暂不支持该文件格式，请查看支持的格式列表" |

---

## 十、数据指标与埋点需求

### 10.1 核心指标

| 指标分类 | 指标名称 | 定义 | 目标值 |
| --------- | --------- | ------ | -------- |
| **使用活跃度** | DAU | 每日至少创建 1 个任务的用户数 | 待定 |
| **使用活跃度** | 日均任务数 | 每日创建的任务总数 | 待定 |
| **任务效率** | 任务完成率 | 完成任务数 / 总任务数 | > 85% |
| **任务效率** | 平均任务耗时 | 从创建到完成的平均时间 | < 5 分钟 |
| **任务效率** | 任务失败率 | 失败任务数 / 总任务数 | < 10% |
| **用户留存** | 次日留存 | 次日回访的用户比例 | > 40% |
| **用户留存** | 7 日留存 | 7 日后回访的用户比例 | > 25% |
| **功能渗透** | Skills 使用率 | 使用过 Skills 的用户比例 | > 30% |
| **功能渗透** | 多任务并行率 | 同时运行 ≥2 个任务的用户比例 | > 20% |

### 10.2 埋点事件清单

| 事件名称 | 触发时机 | 关键参数 |
| --------- | --------- | --------- |
| task_created | 用户创建新任务 | task_id, mode, has_files |
| task_completed | 任务执行完成 | task_id, duration_ms, tool_calls_count |
| task_failed | 任务执行失败 | task_id, error_type, step_failed |
| task_stopped | 用户手动停止 | task_id, progress_percent |
| tool_called | Agent 调用工具 | task_id, tool_name, duration_ms, success |
| model_switched | 用户切换模型 | from_model, to_model |
| file_uploaded | 用户上传文件 | file_type, file_size_kb |
| result_viewed | 用户查看产物 | content_type |
| search_performed | 用户搜索任务 | query, result_count |

---

## 十一、价值评估与优先级排序

### 11.1 需求价值评估矩阵

| 模块 | 用户价值 | 实现复杂度 | 技术风险 | 优先级 | MVP |
| ------ | :---: | :---: | :---: | :---: | :---: |
| **A 任务系统** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 低 | P0 | ✅ |
| **B1 Agent Loop** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 高 | P0 | ✅ |
| **B2 工具调用** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 中 | P0 | ✅ |
| **B3 沙箱环境** | ⭐⭐⭐⭐ | ⭐⭐⭐ | 中 | P0 | ✅ |
| **B4 多模型** | ⭐⭐⭐⭐ | ⭐⭐ | 低 | P0 | ✅ |
| **C1 对话交互** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 低 | P0 | ✅ |
| **C2 结果展示** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 低 | P0 | ✅ |
| **D Skills 系统** | ⭐⭐⭐⭐ | ⭐⭐⭐ | 中 | P1 | ❌ |
| **D 浏览器自动化** | ⭐⭐⭐ | ⭐⭐⭐ | 中 | P1 | ❌ |
| **E 体验优化** | ⭐⭐⭐ | ⭐⭐ | 低 | P1 | ❌ |
| **IM 集成** | ⭐⭐ | ⭐⭐⭐⭐ | 高 | P2 | ❌ |

### 11.2 分阶段交付计划

#### MVP（P0）— 核心闭环

```bash
任务创建 → Agent Loop → 工具调用 → 对话交互 → 结果展示
```

交付物：三区域布局 UI + 任务 CRUD + Agent Loop + 5 个核心工具 + 流式对话 + 产物/文件树/Diff + 深色/浅色主题

#### V1.1（P1）— 扩展增强

Skills 系统 + 浏览器自动化 + 内置浏览器预览 + 快捷键 + 响应式适配

#### V1.2（P2）— 协作与生态

任务分享 + MCP 协议 + 多 Agent 并行 + IM 集成

---

## 十二、风险评估与缓解策略

### 12.1 风险矩阵

| 风险 ID | 风险描述 | 概率 | 影响 | 等级 | 缓解策略 |
| :---: | ------ | :---: | :---: | :---: | ------ |
| R1 | **LLM API 不稳定**：DeepSeek 或用户配置的 API 服务中断 | 中 | 高 | 🔴 | 实现自动重试 + 错误提示 + 模型切换降级 |
| R2 | **Agent Loop 死循环**：LLM 不断调用工具无法终止 | 中 | 高 | 🔴 | 设置 maxIterations=30、timeout=600s、手动停止按钮 |
| R3 | **沙箱逃逸**：恶意 prompt 注入导致执行危险命令 | 低 | 极高 | 🔴 | 路径校验 + 命令黑名单 + 显式用户确认 |
| R4 | **流式响应中断**：SSE 连接中断导致 UI 卡住 | 中 | 中 | 🟡 | AbortController + 自动重连 + 超时处理 |
| R5 | **IndexedDB 数据丢失**：浏览器清理或存储满 | 低 | 高 | 🟡 | 定期备份提示 + 导出功能 + 后续云同步 |
| R6 | **Electron 打包兼容性**：跨平台打包问题 | 中 | 中 | 🟡 | CI 多平台构建 + electron-builder 成熟配置 |
| R7 | **性能问题**：大文件读取/多人同时使用 | 低 | 中 | 🟢 | 文件大小限制 10MB + 虚拟滚动任务列表 |
| R8 | **Antd 主题切换闪烁**：深色/浅色切换时样式闪烁 | 中 | 低 | 🟢 | ConfigProvider 统一管理 + CSS transition |

### 12.2 关键风险应对预案

**R3（沙箱逃逸）应对**：

1. 所有文件路径必须通过 `path.resolve(workspacePath, targetPath)` 后校验是否在 workspace 内
2. Shell 命令在 `exec()` 前进行黑名单正则匹配：`\brm\s+-rf\s+/`、`\bmkfs\b`、`\bdd\b`、`>/dev/sd`
3. 敏感操作弹窗确认，5 秒内未确认自动拒绝

**R2（死循环）应对**：

1. `MAX_ITERATIONS = 30`，超过后自动终止并提示
2. `TIMEOUT_MS = 600000`（10分钟），超时自动终止
3. 连续 3 轮无有效产出 → 自动终止
4. 提供显式的停止按钮，用户可随时中断

---

## 十三、依赖分析与资源估算

### 13.1 外部依赖

| 依赖 | 类型 | 说明 | 备选方案 |
| ------ | :---: | ------ | ------ |
| DeepSeek API | 必须 | 核心 LLM 服务 | 用户可配置其他 OpenAI 兼容 API |
| Node.js ≥ 18 | 必须 | Electron + Agent 运行环境 | - |
| npm 包依赖 | 必须 | antd, react, electron, dexie, zustand, monaco-editor 等 | 版本锁定 |
| Web Search API | 可选 | MVP Mock，后续接入 | SerpAPI / Bing API |

### 13.2 内部模块依赖

```bash
                    ┌─────────┐
                    │ App.tsx │
                    └────┬────┘
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │ Sidebar  │ │ ChatArea │ │ResultPanel│
     └────┬─────┘ └────┬─────┘ └────┬─────┘
          │            │            │
     ┌────▼─────┐ ┌───▼────┐  ┌───▼─────┐
     │taskStore │ │chatStore│  │resultStore│
     └──────────┘ └───┬────┘  └──────────┘
                      │
                 ┌────▼─────┐
                 │ useAgent │
                 └────┬─────┘
                      │ IPC
                 ┌────▼──────────┐
                 │ agent-core/   │
                 │ loop.ts       │
                 └───────────────┘
```

### 13.3 资源估算

| 模块 | 文件数 | 预估工时 | 关键角色 |
| ------ | :---: | :---: | ------ |
| 项目脚手架 + 配置 | 6 | 2h | 前端 |
| 类型定义 + 数据层 | 6 | 2h | 前端 |
| Electron + IPC | 3 | 2h | 全栈 |
| Agent 核心引擎 | 12 | 5h | 全栈 |
| UI 布局 + 组件 | 20 | 6h | 前端 |
| Hooks 串联 | 3 | 2h | 前端 |
| 测试 + 调试 | - | 3h | 前端+全栈 |
| **合计** | **~50** | **~22h** | - |

---

## 十四、验收标准

### 14.1 MVP 端到端验收场景

| # | 场景 | 验收标准 | 优先级 |
| --- | ------ | --------- | :---: |
| 1 | 启动应用 | `pnpm dev` 浏览器打开，显示三区域布局 + 深色主题 | P0 |
| 2 | 创建任务 | 点击新建 → 填写标题/模式/模型 → 任务出现在侧边栏 | P0 |
| 3 | 发送消息 | 选中任务 → 输入消息 → Ctrl+Enter → 消息显示在对话区 | P0 |
| 4 | Mock Agent 响应 | 发送消息后 → Spin + "思考中" → 流式文本 → 工具调用卡片 → 完成 | P0 |
| 5 | 任务状态流转 | planning → running → completed，侧边栏图标实时变化 | P0 |
| 6 | 搜索筛选 | 搜索框输入关键词 → 列表过滤；筛选下拉 → 列表筛选 | P0 |
| 7 | 结果面板 | 右侧 Tabs 切换 概览/产物 → 内容正确展示 | P0 |
| 8 | 文件树浏览 | 点击文件 → Monaco 预览内容 | P0 |
| 9 | 主题切换 | 深色 ↔ 浅色 → 全局生效无闪烁 | P0 |
| 10 | Electron 运行 | `pnpm electron:dev` 启动桌面应用 → 体验与浏览器一致 | P0 |
| 11 | 多任务并行 | 创建 3 个任务 → 同时发消息 → 互不阻塞 | P1 |
| 12 | 任务中断 | 执行中点停止 → 任务变为 stopped → 可继续 | P1 |

### 14.2 技术验收标准

| # | 标准 | 验证方式 |
| --- | ------ | --------- |
| 1 | TypeScript 编译零错误 | `pnpm lint` (tsc --noEmit) |
| 2 | IPC 通道超时分级：file/storage 操作 5s，agent:execute 600s | 断网测试 + 超时验证 |
| 3 | IndexedDB 读写性能 < 100ms | 插入 1000 条消息测试 |
| 4 | Agent Loop 30 轮限制生效 | 构造死循环 prompt 测试 |
| 5 | 沙箱拦截危险命令 | 执行 `rm -rf /` 测试 |
| 6 | 流式 SSE 解析正确 | 发送 10KB+ 消息测试 |

---

## 十五、术语表

| 术语 | 英文 | 定义 |
| ------ | ------ | ------ |
| Agent Loop | Agent Loop | AI Agent 的循环执行流程：分析→规划→执行→观察→交付 |
| EARS | EARS | 需求描述原则：Ubiquitous/Event-driven/Unwanted/State-driven/Optional |
| IPC | Inter-Process Communication | Electron 主进程与渲染进程之间的通信机制 |
| Mock | Mock | 模拟数据/服务，用于开发和测试阶段替代真实依赖 |
| SSE | Server-Sent Events | 服务端向客户端推送流式事件的技术 |
| MCP | Model Context Protocol | 模型上下文协议，标准化 AI 模型与外部工具的交互 |
| Function Calling | Function Calling | LLM 调用外部函数/工具的能力，通过 JSON Schema 定义 |
| SKILL.md | SKILL.md | WorkBuddy 的技能定义文件，包含角色、SOP 和领域知识 |
| IndexedDB | IndexedDB | 浏览器端的结构化数据存储，支持索引和事务 |
| Zustand | Zustand | 轻量级 React 状态管理库 |
| Dexie.js | Dexie.js | IndexedDB 的 Promise 风格封装库 |
| Sandbox | Sandbox | 隔离执行环境，限制代码/命令的访问权限 |
| Workspace | Workspace | Agent 的工作目录，所有文件操作限定在此范围内 |
| Artifact | Artifact | 任务执行过程中产生的文件交付物 |

---

## 十六、待确认问题清单

### 已确认 ✅

| # | 问题 | 确认结果 |
| --- | ------ | ------ |
| Q1 | 前端框架 | React 19 + Electron |
| Q4 | 默认 AI 模型 | DeepSeek，支持多模型切换 |
| Q5 | 部署方式 | Electron 桌面应用 |
| Q6 | MVP 范围 | A+B+C 模块（约 60%） |
| Q9 | 目标用户 | 开发者优先 |
| Q11 | 数据存储 | 本地 IndexedDB |
| Q2 | UI 组件方案 | Ant Design 6 |
| Q7 | 沙箱安全等级 | 进程级隔离（workspace 目录限制） |
| Q8 | 浏览器自动化 | 放到 V1.1，MVP 聚焦核心闭环 |
| Q10 | 多语言支持 | MVP 仅中文，后续扩展 i18n |
| Q12 | 工作目录默认路径 | `~/workbuddy-workspace/` |

### 待确认 ❓

| # | 问题 | 建议 |
| --- | ------ | ------ |
| — | 所有关键决策已确认完毕，无待确认项 | — |

---

## 十七、后续流转建议

> ⚠️ **按产品流程规范的提醒事项**：

1. **文档流转**：需求规划确认后 → 进入代码实施阶段（PNPM + Vite + Electron 项目初始化）
2. **事项创建**：建议将 P0 模块拆分为开发子任务，分配给对应角色
3. **角色关注**：建议邀请以下角色关注：
   - **前端开发**：React + Antd UI 实现
   - **全栈开发**：Agent Core + IPC 通信
4. **资料沉淀**：建议将本规划文档上传到项目资料库，形成统一上下文
5. **排期确认**：MVP 预估 22 工时，需与开发负责人确认

---

> **附录**：参考资料列表
>
> - [WorkBuddy 官方文档](https://www.codebuddy.cn/docs/workbuddy/Overview)
> - [WorkBuddy 产品技术概览](https://cloud.tencent.com/developer/article/2680488)
> - [OpenClaw 深度使用报告](https://cloud.tencent.com/developer/article/2639789)
> - [桌面智能体选型指南 2026](https://www.betteryeah.com/blog/desktop-intelligent-agent-selection-guide-2026)
> - [WorkBuddy 界面布局全拆解](https://cloud.tencent.com/developer/article/2693748)
