import { create } from 'zustand'
import apiClient from '@/lib/api/client'
import { styleConfigToVegaSpec } from '@/lib/vega/vegaTransformer'
import type { Visual, VegaLiteSpec, StyleConfig } from '@/types'

interface EditorState {
  currentVisual: Visual | null
  vegaSpec: VegaLiteSpec | null
  styleConfig: StyleConfig | null
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Actions
  loadVisual: (id: string) => Promise<void>
  updateStyle: (path: string, value: any) => void
  updateSpec: (spec: VegaLiteSpec) => void
  saveVisual: () => Promise<void>
  exportToJSON: () => string
  reset: () => void
}

const defaultStyleConfig: StyleConfig = {
  background: '#ffffff',
  primaryColor: '#3498db',
  colorScheme: 'category10',
  showBorders: false,
  borderColor: '#000000',
  borderWidth: 1,
  xAxisTitle: 'X Axis',
  yAxisTitle: 'Y Axis',
  showXAxis: true,
  showYAxis: true,
  showGrid: true,
  showTooltip: true,
  conditionalRules: [],
  enableSelection: false,
  selectionType: 'point',
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentVisual: null,
  vegaSpec: null,
  styleConfig: null,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  error: null,

  loadVisual: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get<Visual>(`/visuals/${id}`)
      const visual = response.data

      set({
        currentVisual: visual,
        styleConfig: visual.styleConfig,
        vegaSpec: visual.spec,
        isDirty: false,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load visual',
        isLoading: false,
      })
      throw error
    }
  },

  updateStyle: (path: string, value: any) => {
    const { styleConfig, currentVisual } = get()
    if (!styleConfig || !currentVisual) return

    // Update styleConfig usando dot notation
    const keys = path.split('.')
    const newConfig = { ...styleConfig }
    let current: any = newConfig

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    // Regenerar spec Vega
    const newSpec = styleConfigToVegaSpec(
      currentVisual.template!,
      newConfig,
      currentVisual.userData || []
    )

    set({
      styleConfig: newConfig,
      vegaSpec: newSpec,
      isDirty: true,
    })
  },

  updateSpec: (spec: VegaLiteSpec) => {
    set({
      vegaSpec: spec,
      isDirty: true,
    })
  },

  saveVisual: async () => {
    const { currentVisual, styleConfig, vegaSpec } = get()
    if (!currentVisual || !styleConfig || !vegaSpec) return

    set({ isSaving: true, error: null })
    try {
      const response = await apiClient.patch<Visual>(`/visuals/${currentVisual.id}`, {
        styleConfig,
        spec: vegaSpec,
        status: 'COMPLETED',
      })

      set({
        currentVisual: response.data,
        isDirty: false,
        isSaving: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to save visual',
        isSaving: false,
      })
      throw error
    }
  },

  exportToJSON: () => {
    const { vegaSpec } = get()
    if (!vegaSpec) return ''

    const denebSpec = {
      ...vegaSpec,
      usermeta: {
        deneb: {
          build: '1.6.2.1',
          metaVersion: 1,
          provider: 'vegaLite',
          providerVersion: '5.16.3',
        },
      },
    }

    return JSON.stringify(denebSpec, null, 2)
  },

  reset: () => {
    set({
      currentVisual: null,
      vegaSpec: null,
      styleConfig: null,
      isDirty: false,
      error: null,
    })
  },
}))
