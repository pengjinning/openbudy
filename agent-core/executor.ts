import type { ToolCall, ToolResult, ToolExecutionContext } from '../src/types'
import { toolRegistry } from './tools/registry'
import { validateCommand } from './sandbox'
import path from 'path'

/**
 * 工具执行调度器
 * 对每个 toolCall：调用 sandbox 校验 → 调用 toolRegistry.execute → 返回 ToolResult[]
 *
 * sandbox 校验策略：
 * - 对 shell_execute 做命令黑名单校验
 * - 对 file_read / file_write 做路径越界校验（registry 内 handler 已实现，这里做前置防御）
 */
export async function executeTools(
  toolCalls: ToolCall[],
  context: ToolExecutionContext
): Promise<ToolResult[]> {
  const results: ToolResult[] = []

  for (const call of toolCalls) {
    if (context.signal?.aborted) {
      results.push({
        toolCallId: call.id,
        name: call.name,
        output: '任务已取消，工具未执行',
        isError: true,
      })
      continue
    }

    // 前置命令校验（仅对 shell_execute）
    if (call.name === 'shell_execute') {
      const cmd = String(call.arguments?.command ?? '')
      const check = validateCommand(cmd)
      if (!check.safe) {
        results.push({
          toolCallId: call.id,
          name: call.name,
          output: `命令被沙箱拒绝：${check.reason ?? '未知原因'}`,
          isError: true,
        })
        continue
      }
    }

    // 前置路径校验（仅对 file_read / file_write）
    if (call.name === 'file_read' || call.name === 'file_write') {
      const relPath = String(call.arguments?.path ?? '')
      if (relPath) {
        const fullPath = path.resolve(context.workspacePath, relPath)
        // 复用 sandbox 内逻辑：路径必须位于工作区内
        const { validatePath } = await import('./sandbox')
        if (!validatePath(context.workspacePath, fullPath)) {
          results.push({
            toolCallId: call.id,
            name: call.name,
            output: `路径越界，禁止访问工作区外文件：${relPath}`,
            isError: true,
          })
          continue
        }
      }
    }

    // 调用注册中心执行
    const output = await toolRegistry.execute(call.name, call.arguments, context)
    const isError = output.startsWith('错误') || output.startsWith('命令被沙箱拒绝')

    results.push({
      toolCallId: call.id,
      name: call.name,
      output,
      isError,
    })
  }

  return results
}
