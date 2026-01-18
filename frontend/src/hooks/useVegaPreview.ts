import { useEffect, useRef, useState, RefObject } from 'react'
import { VegaRenderer } from '@/lib/vega/vegaRenderer'
import type { VegaLiteSpec } from '@/types'
import { useDebounce } from './useDebounce'

export function useVegaPreview(
  containerRef: RefObject<HTMLDivElement>,
  spec: VegaLiteSpec | null,
  data?: any[]
) {
  const [error, setError] = useState<Error | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const rendererRef = useRef<VegaRenderer | null>(null)

  // Debounce spec para evitar re-renders excessivos
  const debouncedSpec = useDebounce(spec, 300)

  useEffect(() => {
    if (!containerRef.current || !debouncedSpec) return

    const renderer = new VegaRenderer()
    rendererRef.current = renderer

    setIsRendering(true)
    setError(null)

    renderer
      .render({
        container: containerRef.current,
        spec: debouncedSpec,
        data,
        actions: false,
        onError: (err) => setError(err),
        onWarning: (warning) => console.warn('Vega warning:', warning),
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setIsRendering(false)
      })

    return () => {
      renderer.destroy()
    }
  }, [debouncedSpec, data])

  return { error, isRendering }
}
