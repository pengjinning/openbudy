import type { ModelConfig } from '../../src/types'
import { deepseekConfig } from './deepseek'

/**
 * 多模型注册中心
 * 维护一个内置模型列表，支持动态增删
 */
class ModelRegistry {
  private models: Map<string, ModelConfig> = new Map()

  constructor() {
    // 内置 DeepSeek 默认模型
    this.models.set(deepseekConfig.id, deepseekConfig)
  }

  /**
   * 根据 id 获取模型配置
   */
  getModel(id: string): ModelConfig | undefined {
    return this.models.get(id)
  }

  /**
   * 列出所有已注册模型
   */
  listModels(): ModelConfig[] {
    return Array.from(this.models.values())
  }

  /**
   * 获取默认模型（当前为 DeepSeek）
   */
  getDefaultModel(): ModelConfig {
    return deepseekConfig
  }

  /**
   * 添加新模型（若 id 已存在则覆盖）
   */
  addModel(model: ModelConfig): void {
    this.models.set(model.id, model)
  }

  /**
   * 移除模型
   */
  removeModel(id: string): void {
    this.models.delete(id)
  }
}

export const modelRegistry = new ModelRegistry()
