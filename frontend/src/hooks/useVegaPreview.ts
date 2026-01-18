import { useEffect, useRef, useState, useCallback, RefObject } from 'react'
import { VegaRenderer } from '@/lib/vega/vegaRenderer'
import { validateVegaSpec } from '@/lib/vega/vegaTransformer'
import type { VegaLiteSpec } from '@/types'
import { useDebounce } from './useDebounce'
import type * as vega from 'vega'

interface VegaPreviewState {
  error: Error | null
  warnings: string[]
  isRendering: boolean
  isValidSpec: boolean
  view: vega.View | null
}

interface UseVegaPreviewOptions {
  debounceMs?: number
  renderer?: 'svg' | 'canvas'
  actions?: boolean
  onRenderComplete?: (view: vega.View) => void
  onError?: (error: Error) => void
}

export function useVegaPreview(
  containerRef: RefObject<HTMLDivElement>,
  spec: VegaLiteSpec | null,
  data?: any[],
  options: UseVegaPreviewOptions = {}
): VegaPreviewState & {
  refresh: () => void
  exportImage: (format?: 'svg' | 'png') => Promise<string | null>
} {
  const {
    debounceMs = 300,
    renderer = 'svg',
    actions = false,
    onRenderComplete,
    onError,
  } = options

  const [state, setState] = useState<VegaPreviewState>({
    error: null,
    warnings: [],
    isRendering: false,
    isValidSpec: false,
    view: null,
  })

  const rendererRef = useRef<VegaRenderer | null>(null)
  const isMountedRef = useRef(true)
  const renderCountRef = useRef(0)

  // Debounce spec para evitar re-renders excessivos
  const debouncedSpec = useDebounce(spec, debounceMs)

  // Criar renderer apenas uma vez
  useEffect(() => {
    rendererRef.current = new VegaRenderer()
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      if (rendererRef.current) {
        rendererRef.current.destroy()
        rendererRef.current = null
      }
    }
  }, [])

  // Função de renderização
  const renderChart = useCallback(async (specToRender: VegaLiteSpec) => {
    if (!containerRef.current || !rendererRef.current || !isMountedRef.current) {
      return
    }

    const currentRender = ++renderCountRef.current

    // Validar spec antes de renderizar
    const validation = validateVegaSpec(specToRender)

    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        error: new Error(validation.errors.join(', ')),
        warnings: validation.warnings,
        isRendering: false,
        isValidSpec: false,
        view: null,
      }))
      return
    }

    setState(prev => ({
      ...prev,
      isRendering: true,
      error: null,
      warnings: validation.warnings,
      isValidSpec: true,
    }))

    try {
      await rendererRef.current.render({
        container: containerRef.current,
        spec: specToRender,
        data,
        actions,
        renderer,
        onError: (err) => {
          if (isMountedRef.current && currentRender === renderCountRef.current) {
            setState(prev => ({
              ...prev,
              error: err,
              isRendering: false,
            }))
            onError?.(err)
          }
        },
        onWarning: (warning) => {
          if (isMountedRef.current && currentRender === renderCountRef.current) {
            setState(prev => ({
              ...prev,
              warnings: [...prev.warnings, warning],
            }))
          }
        },
        onNewView: (view) => {
          if (isMountedRef.current && currentRender === renderCountRef.current) {
            setState(prev => ({
              ...prev,
              view,
            }))
            onRenderComplete?.(view)
          }
        },
      })

      if (isMountedRef.current && currentRender === renderCountRef.current) {
        setState(prev => ({
          ...prev,
          isRendering: false,
          view: rendererRef.current?.getView() || null,
        }))
      }
    } catch (err) {
      if (isMountedRef.current && currentRender === renderCountRef.current) {
        const error = err instanceof Error ? err : new Error(String(err))
        setState(prev => ({
          ...prev,
          error,
          isRendering: false,
          view: null,
        }))
        onError?.(error)
      }
    }
  }, [containerRef, data, actions, renderer, onRenderComplete, onError])

  // Renderizar quando spec mudar
  useEffect(() => {
    if (!debouncedSpec) {
      setState(prev => ({
        ...prev,
        error: null,
        warnings: [],
        isRendering: false,
        isValidSpec: false,
        view: null,
      }))
      return
    }

    renderChart(debouncedSpec)
  }, [debouncedSpec, renderChart])

  // Função para forçar refresh
  const refresh = useCallback(() => {
    if (debouncedSpec) {
      renderChart(debouncedSpec)
    }
  }, [debouncedSpec, renderChart])

  // Função para exportar imagem
  const exportImage = useCallback(async (format: 'svg' | 'png' = 'svg'): Promise<string | null> => {
    if (!rendererRef.current?.isInitialized()) {
      return null
    }

    try {
      return await rendererRef.current.exportImage(format)
    } catch (err) {
      console.error('Failed to export image:', err)
      return null
    }
  }, [])

  return {
    ...state,
    refresh,
    exportImage,
  }
}
