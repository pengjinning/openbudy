import { create } from 'zustand'
import type { ModelConfig, ModelsConfig } from '../types'
import { ipc } from '../services/ipc'

interface SettingsState {
  theme: 'light' | 'dark'
  modelsConfig: ModelsConfig
  workspaceRoot: string
  settingsOpen: boolean

  init: () => Promise<void>
  setTheme: (theme: 'light' | 'dark') => void
  setModelsConfig: (config: ModelsConfig) => void
  setDefaultModel: (modelId: string) => void
  addModel: (model: ModelConfig) => void
  removeModel: (modelId: string) => void
  setSettingsOpen: (open: boolean) => void
  setWorkspaceRoot: (path: string) => void
}

const DEFAULT_MODELS_CONFIG: ModelsConfig = {
  defaultModel: 'deepseek-chat',
  models: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1/chat/completions',
      apiKey: '',
      maxInputTokens: 128000,
      maxOutputTokens: 8192,
      supportsToolCalling: true,
    },
  ],
}

async function persistModelsConfig(config: ModelsConfig): Promise<void> {
  await ipc.storageSet('modelsConfig', config)
}

async function persistTheme(theme: 'light' | 'dark'): Promise<void> {
  await ipc.storageSet('theme', theme)
}

async function persistWorkspaceRoot(path: string): Promise<void> {
  await ipc.storageSet('workspaceRoot', path)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  modelsConfig: DEFAULT_MODELS_CONFIG,
  workspaceRoot: '~/openbudy-workspace/',
  settingsOpen: false,

  init: async () => {
    const [theme, modelsConfig, workspaceRoot] = await Promise.all([
      ipc.storageGet('theme'),
      ipc.storageGet('modelsConfig'),
      ipc.storageGet('workspaceRoot'),
    ])

    set({
      theme: (theme as 'light' | 'dark') ?? 'dark',
      modelsConfig: (modelsConfig as ModelsConfig) ?? DEFAULT_MODELS_CONFIG,
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

  removeModel: (modelId) => {
    const current = get().modelsConfig
    const config: ModelsConfig = {
      ...current,
      models: current.models.filter((m) => m.id !== modelId),
      defaultModel: current.defaultModel === modelId
        ? (current.models[0]?.id ?? '')
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
