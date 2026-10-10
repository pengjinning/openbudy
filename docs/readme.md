# OpenBudy 文档

本目录是 [Docusaurus](https://docusaurus.io/) 文档站点：**《用 TypeScript + Electron + pi-ai 构建 Agent》实战教程**。

## 快速开始

```bash
# 在仓库根目录
pnpm docs:dev     # 本地预览（http://localhost:3001）
pnpm docs:build   # 构建静态站点到 docs/build
```

## 目录结构

```
docs/
├── docusaurus.config.ts   # 站点配置
├── sidebars.ts            # 侧边栏
├── docs/                  # 教程正文（14 章）
│   ├── intro/             # 第一篇 · 准备篇（2 章）
│   ├── electron/          # 第二篇 · Electron 基础篇（3 章）
│   ├── llm/               # 第三篇 · LLM 与工具篇（2 章）
│   ├── tools/
│   ├── agent-loop/        # 第四篇 · Agent Loop 篇（3 章）
│   └── advanced/          # 第五篇 · 综合与进阶篇（4 章）
└── src/                   # 自定义组件与样式
```

详细规划见 [plans/docusaurus-agent-tutorial-plan.md](../plans/docusaurus-agent-tutorial-plan.md)。
