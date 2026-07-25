import type { ModelConfig } from '../../src/types'

/**
 * DeepSeek 默认模型配置
 * 使用 OpenAI 兼容的 API 格式
 */
export const deepseekConfig: ModelConfig = {
  id: 'deepseek-chat',
  name: 'DeepSeek V3',
  provider: 'DeepSeek',
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: '',
  maxInputTokens: 128000,
  maxOutputTokens: 8192,
  supportsToolCalling: true,
}
