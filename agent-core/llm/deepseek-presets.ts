import type { ModelConfig } from '../../src/types'

/**
 * DeepSeek 预设模型（OpenAI 兼容接口）
 * 模型规格对齐 pi-ai 内置目录（providers/deepseek.models），
 * 桥接层会自动复用目录中的官方 compat 设置。
 * 注意：baseUrl 必须是根地址 —— pi-ai 走 OpenAI SDK，会自动拼接 /chat/completions
 */
export const DEEPSEEK_PRESETS: ModelConfig[] = [
  {
    id: 'deepseek-flash',
    name: 'DeepSeek Flash',
    provider: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    apiKey: '',
    maxInputTokens: 1000000,
    maxOutputTokens: 384000,
    supportsToolCalling: true,
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    provider: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    apiKey: '',
    maxInputTokens: 1000000,
    maxOutputTokens: 384000,
    supportsToolCalling: true,
  },
]
