import embed, { type VisualizationSpec, type Result } from 'vega-embed'
import type { VegaLiteSpec } from '@/types'

export interface VegaRendererOptions {
  container: HTMLElement | string
  spec: VegaLiteSpec
  data?: any[]
  actions?: boolean
  theme?: 'light' | 'dark'
  onError?: (error: Error) => void
  onWarning?: (warning: string) => void
}

export class VegaRenderer {
  private result: Result | null = null
  private container: HTMLElement | string

  constructor() {
    this.container = ''
  }

  async render(options: VegaRendererOptions): Promise<void> {
    this.container = options.container

    try {
      // Clone spec para não mutar o original
      const spec = { ...options.spec }

      // Se tiver dados customizados, substituir
      if (options.data) {
        spec.data = { values: options.data }
      }

      // Cleanup anterior
      if (this.result) {
        this.destroy()
      }

      // Renderizar
      this.result = await embed(options.container, spec as VisualizationSpec, {
        actions: options.actions ?? false,
        theme: options.theme ?? 'light',
        renderer: 'svg',
        tooltip: true,
      })

      // Listeners
      if (options.onError) {
        this.result.view.addSignalListener('error', (name: string, error: any) => {
          options.onError!(error)
        })
      }

      if (options.onWarning) {
        this.result.view.addSignalListener('warn', (warning: any) => {
          options.onWarning!(warning.message || String(warning))
        })
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error)
      }
      throw error
    }
  }

  async update(spec: VegaLiteSpec, data?: any[]): Promise<void> {
    if (!this.container) {
      throw new Error('Renderer not initialized. Call render() first.')
    }

    await this.render({
      container: this.container,
      spec,
      data,
    })
  }

  destroy(): void {
    if (this.result) {
      this.result.view.finalize()
      this.result = null
    }
  }

  getView() {
    return this.result?.view || null
  }
}

export default VegaRenderer
