import type { ToolDefinition, ToolHandler } from '../../src/types'

interface MockSearchResult {
  title: string
  snippet: string
  url: string
}

/**
 * web_search 工具定义（MVP Mock 实现）
 */
export const webSearchDefinition: ToolDefinition = {
  type: 'function',
  function: {
    name: 'web_search',
    description:
      '搜索网络内容，返回相关结果（标题、摘要、链接）。MVP 版本为模拟实现。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词',
        },
      },
      required: ['query'],
    },
  },
}

/**
 * 基于 query 生成稳定的模拟搜索结果
 */
function generateMockResults(query: string): MockSearchResult[] {
  const q = query.trim()
  const encoded = encodeURIComponent(q)
  return [
    {
      title: `${q} - 官方文档`,
      snippet: `这是关于「${q}」的官方文档摘要，包含核心概念、用法示例与最佳实践。`,
      url: `https://example.com/docs/${encoded}`,
    },
    {
      title: `${q} 入门教程 | 社区博客`,
      snippet: `一篇关于「${q}」的入门教程，介绍基础原理和常见应用场景。`,
      url: `https://example.com/blog/${encoded}`,
    },
    {
      title: `${q} - 维基百科`,
      snippet: `「${q}」的百科条目，涵盖背景、历史发展与参考资料。`,
      url: `https://example.com/wiki/${encoded}`,
    },
    {
      title: `${q} GitHub 仓库`,
      snippet: `与「${q}」相关的开源项目，包含 README、issue 和示例代码。`,
      url: `https://github.com/example/${encoded}`,
    },
    {
      title: `${q} 问答 - Stack Overflow`,
      snippet: `关于「${q}」的高赞问答，包含开发者讨论与解决方案。`,
      url: `https://stackoverflow.com/questions/tagged/${encoded}`,
    },
  ]
}

export const webSearchHandler: ToolHandler = async (args, _context) => {
  const query = String(args.query ?? '').trim()
  if (!query) {
    return '错误：未提供搜索关键词'
  }

  const results = generateMockResults(query)
  const lines = [`模拟搜索关键词: ${query}`, `共 ${results.length} 条结果：`, '']
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    lines.push(
      `${i + 1}. ${r.title}`,
      `   摘要: ${r.snippet}`,
      `   URL: ${r.url}`,
      ''
    )
  }
  return lines.join('\n')
}
