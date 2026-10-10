import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

/**
 * 侧边栏：按「篇 → 章」显式组织，顺序与教程大纲一致
 */
const sidebars: SidebarsConfig = {
  tutorial: [
    {
      type: 'category',
      label: '第一篇 · 准备篇',
      items: [
        'intro/what-is-agent',
        'intro/architecture',
      ],
    },
    {
      type: 'category',
      label: '第二篇 · Electron 基础篇',
      items: [
        'electron/process-model',
        'electron/ipc-invoke',
        'electron/ipc-events',
      ],
    },
    {
      type: 'category',
      label: '第三篇 · LLM 与工具篇',
      items: ['llm/pi-ai', 'tools/tool-calling'],
    },
    {
      type: 'category',
      label: '第四篇 · Agent Loop 篇',
      items: [
        'agent-loop/agent-loop',
        'agent-loop/events',
        'agent-loop/sandbox',
      ],
    },
    {
      type: 'category',
      label: '第五篇 · 综合与进阶篇',
      items: [
        'advanced/full-pipeline',
        'advanced/extending',
        'advanced/packaging',
        'advanced/outlook',
      ],
    },
  ],
}

export default sidebars
