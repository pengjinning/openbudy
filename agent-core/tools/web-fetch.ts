import type { ToolDefinition, ToolHandler } from '../../src/types'

/**
 * web_fetch 工具定义
 * 抓取 URL 内容，提取纯文本
 */
export const webFetchDefinition: ToolDefinition = {
  type: 'function',
  function: {
    name: 'web_fetch',
    description: '抓取指定 URL 的网页内容，提取纯文本（去除 HTML 标签），限制 500KB。',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '要抓取的 URL（http 或 https）',
        },
      },
      required: ['url'],
    },
  },
}

const MAX_FETCH_BYTES = 500 * 1024 // 500KB

/**
 * 简易 HTML 标签清理：去 script/style 标签及整体内容，去 HTML 标签，去实体，压缩空白
 */
function stripHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export const webFetchHandler: ToolHandler = async (args, context) => {
  const url = String(args.url ?? '').trim()
  if (!url) {
    return '错误：未提供 URL'
  }

  if (!/^https?:\/\//i.test(url)) {
    return '错误：URL 必须以 http:// 或 https:// 开头'
  }

  try {
    const response = await fetch(url, {
      signal: context.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; OpenBudyAgent/1.0; +https://example.com)',
      },
    })

    if (!response.ok) {
      return `抓取失败：${response.status} ${response.statusText}`
    }

    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()

    // 截断超长内容
    const truncated = text.length > MAX_FETCH_BYTES
    const slice = truncated ? text.slice(0, MAX_FETCH_BYTES) : text

    const content =
      /html/i.test(contentType) || /<html|<!doctype html/i.test(slice)
        ? stripHtml(slice)
        : slice

    const note = truncated ? `\n\n[内容已截断，仅显示前 ${MAX_FETCH_BYTES} bytes]` : ''
    return content || '抓取到空内容'
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return '抓取已取消'
    }
    const msg = err instanceof Error ? err.message : String(err)
    return `抓取 URL 失败：${msg}`
  }
}
