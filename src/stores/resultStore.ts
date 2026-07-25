import { create } from 'zustand'
import type { Artifact } from '../types'
import { db } from '../services/db'

interface ChangedFile {
  path: string
  added: number
  deleted: number
}

interface ResultState {
  artifacts: Artifact[]
  changedFiles: ChangedFile[]
  activeTab: 'overview' | 'artifacts'
  selectedFile: string | null

  loadArtifacts: (taskId: string) => Promise<void>
  addArtifact: (artifact: Artifact) => Promise<void>
  setChangedFiles: (files: ChangedFile[]) => void
  setActiveTab: (tab: 'overview' | 'artifacts') => void
  setSelectedFile: (path: string | null) => void
  clear: () => void
}

export const useResultStore = create<ResultState>((set, get) => ({
  artifacts: [],
  changedFiles: [],
  activeTab: 'overview',
  selectedFile: null,

  loadArtifacts: async (taskId) => {
    const artifacts = await db.artifacts
      .where('taskId')
      .equals(taskId)
      .sortBy('createdAt')
    set({ artifacts })
  },

  addArtifact: async (artifact) => {
    await db.artifacts.put(artifact)
    set({ artifacts: [...get().artifacts, artifact] })
  },

  setChangedFiles: (files) => set({ changedFiles: files }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedFile: (path) => set({ selectedFile: path }),

  clear: () =>
    set({
      artifacts: [],
      changedFiles: [],
      activeTab: 'overview',
      selectedFile: null,
    }),
}))
