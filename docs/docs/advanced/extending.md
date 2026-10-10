---
sidebar_position: 12
title: 第 12 章 · 扩展开发：定制你的 Agent
description: 新增自定义工具、接入 DeepSeek 与任意 OpenAI 兼容服务、调教系统提示词
---

# 第 12 章 · 扩展开发：定制你的 Agent

理解了架构，扩展就是水到渠成的事。本章三个实战覆盖最常见的扩展需求。

## 12.1 实战 1：新增自定义工具（完整清单）

以「目录树」工具 `list_dir_tree` 为例（比 `shell ls` 更结构化）：

```mermaid
flowchart LR
    A[① 写 definition + handler] --> B[② registry 注册]
    B --> C[③ planner 提示词登记]
    C --> D[④ 验证调用]
```

**① 新建 `agent-core/tools/list-dir-tree.ts`：**

```ts
import { promises as fs } from 'fs'
import path from 'path'
import type { ToolDefinition, ToolHandler } from '../../src/types'
import { validatePath } from '../sandbox'

export const listDirTreeDefinition: ToolDefinition = {
  type: 'function',
  function: {
    name: 'list_dir_tree',
    description:
      '以树状结构列出工作区内某目录的所有文件与子目录（自动忽略 node_modules/.git）。' +
      '需要了解项目结构时调用，比逐个 file_read 更高效。',
    parameters: {
      type: 'object',
      properties: {
        dir: {
          type: 'string',
          description: '相对于工作区的目录路径，默认 "."',
        },
        maxDepth: {
          type: 'integer',
          description: '最大深度，默认 3',
        },
      },
      required: [],
    },
  },
}

export const listDirTreeHandler: ToolHandler = async (args, context) => {
  const dir = String(args.dir ?? '.')
  const maxDepth = Math.min(Number(args.maxDepth ?? 3) || 3, 5)

  const root = path.resolve(context.workspacePath, dir)
  if (!validatePath(context.workspacePath, root)) {
    return '错误：路径越界'                       // 安全：复用沙箱
  }

  const IGNORE = new Set(['node_modules', '.git', 'dist'])
  const lines: string[] = [dir]

  async function walk(current: string, depth: number, prefix: string) {
    if (depth > maxDepth) return
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const e of entries) {
      if (IGNORE.has(e.name)) continue
      lines.push(`${prefix}${e.isDirectory() ? '📁' : '📄'} ${e.name}`)
      if (e.isDirectory()) {
        await walk(path.join(current, e.name), depth + 1, prefix + '  ')
      }
    }
  }

  await walk(root, 1, '')
  return lines.join('\n')
}
```

**② 注册**（`registry.ts` 的 `registerBuiltins`）：

```ts
this.register('list_dir_tree', listDirTreeDefinition, listDirTreeHandler)
```

**③ 提示词登记**（`planner.ts` 工具列表加一行）：

```ts
'- list_dir_tree: 树状列出目录结构',
```

**④ 验证**：问 Agent「这个工作区有什么文件？」——它应该优先选 `list_dir_tree` 而不是多次 `file_read`。

### 工具设计的经验法则

| 法则 | 原因 |
| --- | --- |
| description 写「**何时**用」而非「是什么」 | 模型靠它做调用决策 |
| 输出紧凑（树形文本优于逐文件 JSON） | 省 token，模型读得快 |
| 参数少而精，都有默认值 | 降低模型出错率 |
| 复杂结果截断 + 提示「可用 file_read 深入」 | 避免超大 tool 消息撑爆上下文 |
| 永远过一遍 `validatePath` / `validateCommand` | 第 10 章的安全底线 |

## 12.2 实战 2：接入 DeepSeek 与任意 OpenAI 兼容服务

得益于 pi-ai 桥接层，接入新厂商基本零成本。

**内置预设**（[agent-core/llm/deepseek-presets.ts](https://github.com/pengjinning/openbudy/blob/main/agent-core/llm/deepseek-presets.ts)）已包含 deepseek-flash / deepseek-v4-pro：

```ts
// 预设核心字段
{
  id: 'deepseek-v4-pro',
  provider: 'deepseek',
  baseUrl: 'https://api.deepseek.com/v1',
  // Key 由用户在设置页填入，存 ~/.openbudy/config.json
}
```

`toPiModel` 的转换逻辑（第 6 章）会自动处理：deepseek 在 pi-ai 官方目录中有收录 → 直接复用其 Model 定义并覆盖 baseUrl。

**添加全新厂商**（如 Moonshot Kimi）也不需要写代码——用户在 UI 的「模型管理」里填：

| 字段 | 值 |
| --- | --- |
| Provider | `moonshot`（自定义） |
| Base URL | `https://api.moonshot.cn/v1` |
| Model ID | `kimi-k2` |
| API Key | 用户的 key |

未收录厂商走 `openai-completions` 兜底构造——只要对方是 OpenAI 兼容接口就能用。

**注意 `supportsToolCalling`**：如果某模型不支持 Function Calling，标记为 false 后 loop 可以选择不传 tools（该模型只能做纯对话）。

## 12.3 实战 3：调教系统提示词

[agent-core/planner.ts](https://github.com/pengjinning/openbudy/blob/main/agent-core/planner.ts) 是 Agent 的「性格与规章」所在。三个改造方向：

### 方向 A：改变工作风格

```ts
// 原：涉及 3 个以上文件时先简述计划再执行
// 改成更谨慎的 Agent：
'1. 任何文件修改前，必须先用 1-2 句话说明要改什么并等待用户确认',
'2. 每次最多修改一个文件，改完汇报再继续',
```

### 方向 B：注入领域知识

```ts
'## 领域约定',
'- 本工作区是 Vue 3 + <script setup> 项目，组件用 PascalCase',
'- 样式一律用 UnoCSS 原子类，不要写 <style> 块',
'- 提交信息遵循 Conventional Commits',
```

### 方向 C：约束工具偏好

```ts
'## 工具使用偏好',
'- 了解结构优先用 list_dir_tree，不要逐个 file_read',
'- 跑脚本用 shell_execute 时必须加超时：timeout 30 node xxx.js',
'- 禁止使用 npm install，依赖变更需用户手动执行',
```

改完重启 `pnpm electron:dev` 立即生效。**提示词是软约束**——它引导但不保证；硬约束必须放沙箱层（第 10 章）。

## 12.4 扩展点全景图

| 想做的事 | 改哪里 | 难度 |
| --- | --- | --- |
| 加工具 | `agent-core/tools/` + registry + planner | ⭐ |
| 加模型预设 | `agent-core/llm/*-presets.ts` | ⭐ |
| 加 Agent 行为规则 | `planner.ts` 系统提示词 | ⭐ |
| 加事件类型（如耗时统计） | types + loop + useAgent（第 9 章实战） | ⭐⭐ |
| 换掉 pi-ai | 重写 `llm/` 桥接层，保持 `LLMChunk` 协议 | ⭐⭐ |
| 把 agent-core 移植到 CLI | 直接 import，Node 环境可跑 | ⭐⭐ |
| 多窗口/多任务并发 | 事件按 taskId 路由已支持；注意 abortControllers 是 Map 结构 | ⭐⭐⭐ |

## 12.5 小结

- 加工具四步：definition → register → planner 登记 → 验证
- 工具 description 是给模型的说明书，「何时用」比「是什么」重要
- 新厂商接入几乎零代码：预设或 UI 自定义均可
- 提示词管软约束（风格/偏好），沙箱管硬约束（安全）
