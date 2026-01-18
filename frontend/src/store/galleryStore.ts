import { create } from 'zustand'
import apiClient from '@/lib/api/client'
import type { Template, Visual } from '@/types'

interface GalleryState {
  templates: Template[]
  userVisuals: Visual[]
  isLoadingTemplates: boolean
  isLoadingVisuals: boolean
  error: string | null

  // Actions
  loadTemplates: () => Promise<void>
  loadUserVisuals: () => Promise<void>
  createFromTemplate: (templateId: string) => Promise<Visual>
  deleteVisual: (visualId: string) => Promise<void>
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  templates: [],
  userVisuals: [],
  isLoadingTemplates: false,
  isLoadingVisuals: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoadingTemplates: true, error: null })
    try {
      const response = await apiClient.get<Template[]>('/templates')
      set({
        templates: response.data,
        isLoadingTemplates: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load templates',
        isLoadingTemplates: false,
      })
    }
  },

  loadUserVisuals: async () => {
    set({ isLoadingVisuals: true, error: null })
    try {
      const response = await apiClient.get<Visual[]>('/visuals')
      set({
        userVisuals: response.data,
        isLoadingVisuals: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load visuals',
        isLoadingVisuals: false,
      })
    }
  },

  createFromTemplate: async (templateId: string) => {
    try {
      const response = await apiClient.post<Visual>('/visuals', {
        templateId,
      })

      // Adicionar à lista de visuals do usuário
      set((state) => ({
        userVisuals: [response.data, ...state.userVisuals],
      }))

      return response.data
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create visual',
      })
      throw error
    }
  },

  deleteVisual: async (visualId: string) => {
    try {
      await apiClient.delete(`/visuals/${visualId}`)

      // Remover da lista
      set((state) => ({
        userVisuals: state.userVisuals.filter((v) => v.id !== visualId),
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete visual',
      })
      throw error
    }
  },
}))
