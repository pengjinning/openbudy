import React from 'react'
import Link from '@docusaurus/Link'

const parts = [
  {
    title: '第一篇 · 准备篇',
    desc: '认识 AI Agent 与 OpenBudy 项目全貌，把开发环境跑起来。',
    items: [
      { to: '/intro/what-is-agent', label: '1. 什么是 AI Agent' },
      { to: '/intro/architecture', label: '2. 项目架构与开发环境' },
    ],
  },
  {
    title: '第二篇 · Electron 基础篇',
    desc: '进程模型、contextIsolation 安全模型与两种 IPC 通信模式。',
    items: [
      { to: '/electron/process-model', label: '3. Electron 进程模型与窗口' },
      { to: '/electron/ipc-invoke', label: '4. IPC（一）：请求-响应' },
      { to: '/electron/ipc-events', label: '5. IPC（二）：事件推送' },
    ],
  },
  {
    title: '第三篇 · LLM 与工具篇',
    desc: '消息协议、流式输出、pi-ai 抽象与 Function Calling 工具体系。',
    items: [
      { to: '/llm/pi-ai', label: '6. LLM API 基础与 pi-ai' },
      { to: '/tools/tool-calling', label: '7. 工具调用（Tools）' },
    ],
  },
  {
    title: '第四篇 · Agent Loop 篇',
    desc: '核心循环、事件驱动 UI、安全沙箱——Agent 的心脏所在。',
    items: [
      { to: '/agent-loop/', label: '8. Agent Loop：从对话到自主执行' },
      { to: '/agent-loop/events', label: '9. 事件驱动：让思考过程可见' },
      { to: '/agent-loop/sandbox', label: '10. 安全沙箱与护栏' },
    ],
  },
  {
    title: '第五篇 · 综合与进阶篇',
    desc: '全链路串讲、扩展开发、打包调试与下一步方向。',
    items: [
      { to: '/advanced/full-pipeline', label: '11. 全链路串讲' },
      { to: '/advanced/extending', label: '12. 扩展开发：定制你的 Agent' },
      { to: '/advanced/packaging', label: '13. 打包、调试与最佳实践' },
      { to: '/advanced/outlook', label: '14. 展望与学习路径' },
    ],
  },
]

export function HomePage(): React.ReactNode {
  return (
    <div>
      <p>
        本教程带你用 <strong>TypeScript + Electron + pi-ai</strong>{' '}
        从零理解并实现一个桌面 AI Agent。所有代码示例均来自{' '}
        <Link to="https://github.com/pengjinning/openbudy">OpenBudy</Link>{' '}
        真实源码，注重实战、由浅入深。
      </p>
      <div style={{ display: 'grid', gap: '1.2rem', margin: '2rem 0' }}>
        {parts.map((part) => (
          <div
            key={part.title}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 'var(--ifm-global-radius)',
              padding: '1rem 1.25rem',
            }}
          >
            <h3 style={{ marginTop: 0 }}>{part.title}</h3>
            <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>{part.desc}</p>
            <ul style={{ marginBottom: 0 }}>
              {part.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
