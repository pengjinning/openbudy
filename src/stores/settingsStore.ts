import { create } from 'zustand'
import type { ModelConfig, ModelsConfig, ThemeSetting } from '../types'
import { ipc } from '../services/ipc'
import { ZHIPU_PRESETS } from '../../agent-core/llm/pi-ai'
import { DEEPSEEK_PRESETS } from '../../agent-core/llm/deepseek-presets'

interface SettingsState {
  theme: ThemeSetting
  modelsConfig: ModelsConfig
  workspaceRoot: string
  settingsOpen: boolean

  init: () => Promise<void>
  setTheme: (theme: ThemeSetting) => void
  setModelsConfig: (config: ModelsConfig) => void
  setDefaultModel: (modelId: string) => void
  addModel: (model: ModelConfig) => void
  updateModel: (modelId: string, patch: Partial<Omit<ModelConfig, 'id'>>) => void
  removeModel: (modelId: string) => void
  setSettingsOpen: (open: boolean) => void
  setWorkspaceRoot: (path: string) => void
}

const DEFAULT_MODELS_CONFIG: ModelsConfig = {
  defaultModel: 'glm-4-flash',
  models: [...ZHIPU_PRESETS, ...DEEPSEEK_PRESETS],
}

async function persistModelsConfig(config: ModelsConfig): Promise<void> {
  await ipc.storageSet('modelsConfig', config)
}

async function persistTheme(theme: ThemeSetting): Promise<void> {
  await ipc.storageSet('theme', theme)
}

async function persistWorkspaceRoot(path: string): Promise<void> {
  await ipc.storageSet('workspaceRoot', path)
}

/** 已下线的旧模型 id → 替代的新模型 */
const LEGACY_MODEL_REPLACEMENTS = ['deepseek-chat']

/**
 * 合并持久化配置与内置预设：
 * - 移除已下线的旧模型（deepseek-chat 等），其 API Key 迁移到新的 DeepSeek 预设
 * - 补齐缺失的智谱 / DeepSeek 预设（已存在的同 id 自定义项保持不变）
 * - 默认模型失效时回退到第一个智谱预设
 */
function mergeWithDefaults(saved: ModelsConfig): ModelsConfig {
  // 旧 deepseek-chat 的 Key 迁移给新 DeepSeek 预设
  const legacy = saved.models.find(
    (m) => LEGACY_MODEL_REPLACEMENTS.includes(m.id) && m.apiKey
  )
  const kept = saved.models.filter((m) => !LEGACY_MODEL_REPLACEMENTS.includes(m.id))
  const savedIds = new Set(kept.map((m) => m.id))
  const missingPresets = [...ZHIPU_PRESETS, ...DEEPSEEK_PRESETS]
    .filter((p) => !savedIds.has(p.id))
    .map((p) => (legacy?.apiKey && p.provider === 'DeepSeek' ? { ...p, apiKey: legacy.apiKey } : p))
  const models = [...kept, ...missingPresets]
  const defaultModel = models.some((m) => m.id === saved.defaultModel)
    ? saved.defaultModel
    : (models[0]?.id ?? '')
  return { defaultModel, models }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'system',
  modelsConfig: DEFAULT_MODELS_CONFIG,
  workspaceRoot: '~/openbudy-workspace/',
  settingsOpen: false,

  init: async () => {
    const [theme, modelsConfig, workspaceRoot] = await Promise.all([
      ipc.storageGet('theme'),
      ipc.storageGet('modelsConfig'),
      ipc.storageGet('workspaceRoot'),
    ])

    let nextModelsConfig: ModelsConfig
    if (modelsConfig) {
      nextModelsConfig = mergeWithDefaults(modelsConfig as ModelsConfig)
    } else {
      nextModelsConfig = DEFAULT_MODELS_CONFIG
      void persistModelsConfig(nextModelsConfig)
    }

    set({
      theme: (theme as ThemeSetting) ?? 'system',
      modelsConfig: nextModelsConfig,
      workspaceRoot: (workspaceRoot as string) ?? '~/openbudy-workspace/',
    })
  },

  setTheme: (theme) => {
    set({ theme })
    void persistTheme(theme)
  },

  setModelsConfig: (config) => {
    set({ modelsConfig: config })
    void persistModelsConfig(config)
  },

  setDefaultModel: (modelId) => {
    const config: ModelsConfig = {
      ...get().modelsConfig,
      defaultModel: modelId,
    }
    set({ modelsConfig: config })
    void persistModelsConfig(config)
  },

  addModel: (model) => {
    const current = get().modelsConfig
    if (current.models.some((m) => m.id === model.id)) {
      return
    }
    const config: ModelsConfig = {
      ...current,
      models: [...current.models, model],
    }
    set({ modelsConfig: config })
    void persistModelsConfig(config)
  },

  updateModel: (modelId, patch) => {
    const current = get().modelsConfig
    const config: ModelsConfig = {
      ...current,
      models: current.models.map((m) =>
        m.id === modelId ? { ...m, ...patch, id: modelId } : m
      ),
    }
    set({ modelsConfig: config })
    void persistModelsConfig(config)
  },

  removeModel: (modelId) => {
    const current = get().modelsConfig
    const config: ModelsConfig = {
      ...current,
      models: current.models.filter((m) => m.id !== modelId),
      defaultModel: current.defaultModel === modelId
        ? (current.models.find((m) => m.id !== modelId)?.id ?? '')
        : current.defaultModel,
    }
    set({ modelsConfig: config })
    void persistModelsConfig(config)
  },

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  setWorkspaceRoot: (path) => {
    set({ workspaceRoot: path })
    void persistWorkspaceRoot(path)
  },
}))
