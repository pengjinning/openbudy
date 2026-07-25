import { promises as fs } from 'fs'
import path from 'path'
import type { ToolDefinition, ToolHandler } from '../../src/types'
import { validatePath, MAX_FILE_SIZE } from '../sandbox'

/**
 * file_write 工具定义
 * 写入文件到 workspace，自动创建目录
 */
export const fileWriteDefinition: ToolDefinition = {
  type: 'function',
  function: {
    name: 'file_write',
    description: '写入内容到工作区内某个文件，自动创建所需目录。若文件已存在则覆盖。',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '相对于工作区的文件路径',
        },
        content: {
          type: 'string',
          description: '要写入的文本内容',
        },
      },
      required: ['path', 'content'],
    },
  },
}

export const fileWriteHandler: ToolHandler = async (args, context) => {
  const relPath = String(args.path ?? '').trim()
  const content = String(args.content ?? '')
  if (!relPath) {
    return '错误：未提供文件路径'
  }

  const fullPath = path.resolve(context.workspacePath, relPath)

  // 路径安全校验
  if (!validatePath(context.workspacePath, fullPath)) {
    return `错误：路径越界，禁止写入工作区外文件：${relPath}`
  }

  // 写入内容大小限制
  const byteLength = Buffer.byteLength(content, 'utf-8')
  if (byteLength > MAX_FILE_SIZE) {
    return `错误：内容过大（${byteLength} bytes），超过 ${MAX_FILE_SIZE} bytes 限制`
  }

  try {
    // 自动创建父目录
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(fullPath, content, 'utf-8')
    return `已写入文件：${relPath}（${byteLength} bytes）`
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return `写入文件失败：${msg}`
  }
}
