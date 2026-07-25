import path from 'path'

/**
 * 安全沙箱：路径与命令校验
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * 校验目标路径是否位于工作区内
 * 通过 path.resolve 后检查是否以 workspacePath 为前缀
 */
export function validatePath(workspacePath: string, targetPath: string): boolean {
  if (!workspacePath || !targetPath) return false
  const resolvedWorkspace = path.resolve(workspacePath)
  const resolvedTarget = path.resolve(targetPath)

  // 完全相等
  if (resolvedTarget === resolvedWorkspace) return true

  // 目标必须位于工作区目录下
  const prefix = resolvedWorkspace + path.sep
  return resolvedTarget.startsWith(prefix)
}

/**
 * 命令黑名单关键词
 */
const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\brm\s+-rf\s+\/(\s|$)/, reason: '禁止删除根目录' },
  { pattern: /\brm\s+-rf\s+~(\s|$)/, reason: '禁止删除用户主目录' },
  { pattern: /\brm\s+-rf\s+\*(\s|$)/, reason: '禁止通配删除目录内容' },
  { pattern: /\bmkfs\b/, reason: '禁止格式化磁盘' },
  { pattern: /\bdd\s+if=/, reason: '禁止使用 dd 写入块设备' },
  { pattern: />\s*\/dev\/sd[a-z]/, reason: '禁止直接写入块设备' },
  { pattern: /\bshutdown\b/, reason: '禁止关机命令' },
  { pattern: /\breboot\b/, reason: '禁止重启命令' },
  { pattern: /\bhalt\b/, reason: '禁止 halt 命令' },
  { pattern: /:\(\)\s*\{\s*:\|:&\s*\};:/, reason: '禁止 fork 炸弹' },
  {
    pattern: /\bchmod\s+-R\s+[0-7]+\s+\/(\s|$)/,
    reason: '禁止递归修改根目录权限',
  },
  { pattern: /\bcurl\s+.*\|\s*sh\b/, reason: '禁止管道执行远程脚本' },
  { pattern: /\bwget\s+.*\|\s*sh\b/, reason: '禁止管道执行远程脚本' },
]

/**
 * 校验 shell 命令是否安全
 * 返回 { safe, reason }
 */
export function validateCommand(command: string): {
  safe: boolean
  reason?: string
} {
  if (!command || typeof command !== 'string') {
    return { safe: false, reason: '命令为空' }
  }

  const cmd = command.trim()
  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(cmd)) {
      return { safe: false, reason }
    }
  }

  return { safe: true }
}
