import type { ToolDefinition, ToolExecutionContext, ToolHandler } from '../../src/types'
import { shellExecuteDefinition, shellExecuteHandler } from './shell'
import { fileReadDefinition, fileReadHandler } from './file-read'
import { fileWriteDefinition, fileWriteHandler } from './file-write'
import { webSearchDefinition, webSearchHandler } from './web-search'
import { webFetchDefinition, webFetchHandler } from './web-fetch'

interface RegisteredTool {
  definition: ToolDefinition
  handler: ToolHandler
}

/**
 * 工具注册中心
 * 维护工具名到（定义 + handler）的映射，并对外暴露 execute
 */
class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map()

  constructor() {
    this.registerBuiltins()
  }

  /**
   * 注册内置的 5 个工具
   */
  private registerBuiltins(): void {
    this.register('shell_execute', shellExecuteDefinition, shellExecuteHandler)
    this.register('file_read', fileReadDefinition, fileReadHandler)
    this.register('file_write', fileWriteDefinition, fileWriteHandler)
    this.register('web_search', webSearchDefinition, webSearchHandler)
    this.register('web_fetch', webFetchDefinition, webFetchHandler)
  }

  /**
   * 注册一个工具
   */
  register(
    name: string,
    definition: ToolDefinition,
    handler: ToolHandler
  ): void {
    this.tools.set(name, { definition, handler })
  }

  /**
   * 取消注册
   */
  unregister(name: string): void {
    this.tools.delete(name)
  }

  /**
   * 获取所有工具定义（供 LLM 调用使用）
   */
  getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition)
  }

  /**
   * 检查工具是否已注册
   */
  has(name: string): boolean {
    return this.tools.has(name)
  }

  /**
   * 执行指定工具
   */
  async execute(
    name: string,
    args: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<string> {
    const tool = this.tools.get(name)
    if (!tool) {
      return `错误：未注册的工具：${name}`
    }

    try {
      // 传递 AbortSignal，但即便 signal 触发 handler 仍可自行处理
      const execContext: ToolExecutionContext = {
        ...context,
        signal: context.signal ?? undefined,
      }
      return await tool.handler(args, execContext)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return `工具执行已取消：${name}`
      }
      const msg = err instanceof Error ? err.message : String(err)
      return `工具执行异常：${name} - ${msg}`
    }
  }
}

export const toolRegistry = new ToolRegistry()
