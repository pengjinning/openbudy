import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import type { ToolDefinition, ToolHandler } from '../../src/types'
import { validateCommand, validatePath } from '../sandbox'

const execAsync = promisify(exec)

/**
 * shell_execute 工具定义
 * 在 workspace 内执行 shell 命令，30s 超时
 */
export const shellExecuteDefinition: ToolDefinition = {
  type: 'function',
  function: {
    name: 'shell_execute',
    description:
      '在当前工作区内执行 shell 命令。可执行命令如 ls、git、npm 等。输出 stdout 与 stderr。',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: '要执行的 shell 命令',
        },
      },
      required: ['command'],
    },
  },
}

export const shellExecuteHandler: ToolHandler = async (args, context) => {
  const command = String(args.command ?? '').trim()
  if (!command) {
    return '错误：未提供命令'
  }

  // 命令安全校验
  const check = validateCommand(command)
  if (!check.safe) {
    return `错误：命令被拒绝。${check.reason ?? ''}`
  }

  // 工作目录校验
  if (!validatePath(context.workspacePath, context.workspacePath)) {
    return '错误：工作区路径无效'
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: context.workspacePath,
      timeout: 30000,
      maxBuffer: 5 * 1024 * 1024, // 5MB 输出上限
      signal: context.signal,
    })
    const out = stdout.toString().trim()
    const err = stderr.toString().trim()
    if (out && err) return `${out}\n\n[stderr]\n${err}`
    return out || err || '命令执行完成（无输出）'
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // 命令非 0 退出时 stderr 通常包含有用信息
    const anyErr = err as { stderr?: string | Buffer; stdout?: string | Buffer }
    const stderr = anyErr.stderr ? anyErr.stderr.toString() : ''
    const stdout = anyErr.stdout ? anyErr.stdout.toString() : ''
    return [
      `命令执行失败：${msg}`,
      stdout ? `\n[stdout]\n${stdout}` : '',
      stderr ? `\n[stderr]\n${stderr}` : '',
    ].join('')
  }
}
