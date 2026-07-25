import { promises as fs } from 'fs'
import path from 'path'
import type { ToolDefinition, ToolHandler } from '../../src/types'
import { validatePath, MAX_FILE_SIZE } from '../sandbox'

/**
 * file_read 工具定义
 * 读取 workspace 内的文件内容
 */
export const fileReadDefinition: ToolDefinition = {
  type: 'function',
  function: {
    name: 'file_read',
    description: '读取工作区内某个文件的内容，返回字符串。',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '相对于工作区的文件路径',
        },
      },
      required: ['path'],
    },
  },
}

export const fileReadHandler: ToolHandler = async (args, context) => {
  const relPath = String(args.path ?? '').trim()
  if (!relPath) {
    return '错误：未提供文件路径'
  }

  const fullPath = path.resolve(context.workspacePath, relPath)

  // 路径安全校验
  if (!validatePath(context.workspacePath, fullPath)) {
    return `错误：路径越界，禁止访问工作区外文件：${relPath}`
  }

  try {
    const stat = await fs.stat(fullPath)
    if (!stat.isFile()) {
      return `错误：路径不是文件：${relPath}`
    }
    if (stat.size > MAX_FILE_SIZE) {
      return `错误：文件过大（${stat.size} bytes），超过 ${MAX_FILE_SIZE} bytes 限制`
    }

    const content = await fs.readFile(fullPath, 'utf-8')
    return content
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return `读取文件失败：${msg}`
  }
}
