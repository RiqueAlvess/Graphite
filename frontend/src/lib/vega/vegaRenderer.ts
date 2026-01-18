import embed, { type VisualizationSpec, type Result, type EmbedOptions } from 'vega-embed'
import * as vega from 'vega'
import * as vegaLite from 'vega-lite'
import type { VegaLiteSpec } from '@/types'

/**
 * Fast structural comparison for Vega specs
 * Only compares critical fields that affect rendering
 */
function specsAreEqual(spec1: VegaLiteSpec | null, spec2: VegaLiteSpec | null): boolean {
  if (!spec1 || !spec2) return spec1 === spec2

  // Quick reference equality check
  if (spec1 === spec2) return true

  // Compare critical fields that affect rendering
  const criticalFields: (keyof VegaLiteSpec)[] = [
    'mark', 'encoding', 'layer', 'hconcat', 'vconcat', 'concat',
    'width', 'height', 'params', 'transform'
  ]

  for (const field of criticalFields) {
    if (JSON.stringify(spec1[field]) !== JSON.stringify(spec2[field])) {
      return false
    }
  }

  // Compare config (only if both exist or both don't)
  if ((spec1.config && !spec2.config) || (!spec1.config && spec2.config)) {
    return false
  }
  if (spec1.config && spec2.config) {
    if (JSON.stringify(spec1.config) !== JSON.stringify(spec2.config)) {
      return false
    }
  }

  return true
}

export interface VegaRendererOptions {
  container: HTMLElement | string
  spec: VegaLiteSpec
  data?: any[]
  actions?: boolean | { export?: boolean; source?: boolean; compiled?: boolean; editor?: boolean }
  theme?: 'light' | 'dark'
  renderer?: 'svg' | 'canvas'
  width?: number | 'container'
  height?: number
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  scaleFactor?: number
  onError?: (error: Error) => void
  onWarning?: (warning: string) => void
  onNewView?: (view: vega.View) => void
  logLevel?: number
}

export interface VegaDebugInfo {
  vegaLiteSpec: VegaLiteSpec | null
  vegaSpec: vega.Spec | null
  view: vega.View | null
}

// Expor para debug global como o Vega Editor faz
declare global {
  interface Window {
    VEGA_DEBUG: VegaDebugInfo
  }
}

// Inicializar debug object
if (typeof window !== 'undefined') {
  window.VEGA_DEBUG = {
    vegaLiteSpec: null,
    vegaSpec: null,
    view: null,
  }
}

export class VegaRenderer {
  private result: Result | null = null
  private container: HTMLElement | string = ''
  private currentSpec: VegaLiteSpec | null = null
  private isDestroyed: boolean = false

  constructor() {
    this.container = ''
  }

  /**
   * Valida e normaliza a spec antes de renderizar
   */
  private normalizeSpec(spec: VegaLiteSpec): VegaLiteSpec {
    const normalized = JSON.parse(JSON.stringify(spec))

    // Garantir $schema
    if (!normalized.$schema) {
      normalized.$schema = 'https://vega.github.io/schema/vega-lite/v5.json'
    }

    // Normalizar mark para objeto se for string
    if (typeof normalized.mark === 'string') {
      normalized.mark = { type: normalized.mark }
    }

    // Garantir que mark tenha tooltip habilitado
    if (normalized.mark && typeof normalized.mark === 'object') {
      if (normalized.mark.tooltip === undefined) {
        normalized.mark.tooltip = true
      }
    }

    // Garantir config base
    if (!normalized.config) {
      normalized.config = {}
    }

    // Aplicar configurações de axis padrão se não existirem
    if (!normalized.config.axis) {
      normalized.config.axis = {
        labelFontSize: 11,
        titleFontSize: 12,
      }
    }

    // Configurar view padrão
    if (!normalized.config.view) {
      normalized.config.view = {
        stroke: 'transparent',
      }
    }

    return normalized
  }

  /**
   * Compila Vega-Lite para Vega spec (útil para debug)
   */
  compileToVega(spec: VegaLiteSpec): vega.Spec | null {
    try {
      const result = vegaLite.compile(spec as vegaLite.TopLevelSpec)
      return result.spec
    } catch (error) {
      console.error('Failed to compile Vega-Lite spec:', error)
      return null
    }
  }

  async render(options: VegaRendererOptions): Promise<void> {
    if (this.isDestroyed) {
      console.warn('Renderer was destroyed, creating new instance')
      this.isDestroyed = false
    }

    this.container = options.container

    try {
      // Normalizar spec
      const spec = this.normalizeSpec(options.spec)

      // Se tiver dados customizados, substituir
      if (options.data && options.data.length > 0) {
        spec.data = { values: options.data }
      }

      // Garantir que data existe
      if (!spec.data) {
        spec.data = { values: [] }
      }

      // Cleanup anterior
      if (this.result) {
        await this.destroy()
      }

      // Armazenar spec atual
      this.currentSpec = spec

      // Configurar opções do embed
      const embedOptions: EmbedOptions = {
        actions: options.actions ?? {
          export: true,
          source: false,
          compiled: false,
          editor: false,
        },
        theme: options.theme === 'dark' ? 'dark' : undefined,
        renderer: options.renderer ?? 'svg',
        tooltip: { theme: options.theme === 'dark' ? 'dark' : 'light' },
        logLevel: options.logLevel ?? vega.Warn,
        hover: true,
      }

      // Configurar dimensões
      if (options.width) {
        embedOptions.width = options.width === 'container' ? undefined : options.width
      }
      if (options.height) {
        embedOptions.height = options.height
      }
      if (options.padding) {
        embedOptions.padding = options.padding
      }
      if (options.scaleFactor) {
        embedOptions.scaleFactor = options.scaleFactor
      }

      // Renderizar
      this.result = await embed(options.container, spec as VisualizationSpec, embedOptions)

      // Atualizar debug info global
      if (typeof window !== 'undefined') {
        window.VEGA_DEBUG.vegaLiteSpec = spec
        window.VEGA_DEBUG.vegaSpec = this.compileToVega(spec)
        window.VEGA_DEBUG.view = this.result.view
      }

      // Callback para nova view
      if (options.onNewView) {
        options.onNewView(this.result.view)
      }

      // Configurar listeners de erro
      this.result.view.addEventListener('error', (event: any) => {
        console.error('Vega view error:', event)
        if (options.onError) {
          options.onError(new Error(event.message || 'Vega view error'))
        }
      })

      // Listener para warnings
      this.result.view.addEventListener('warn', (event: any) => {
        console.warn('Vega warning:', event)
        if (options.onWarning) {
          options.onWarning(event.message || String(event))
        }
      })

    } catch (error) {
      console.error('Render error:', error)

      // Tentar extrair mensagem de erro mais útil
      let errorMessage = 'Erro desconhecido ao renderizar'
      if (error instanceof Error) {
        errorMessage = error.message
        // Melhorar mensagens de erro comuns
        if (errorMessage.includes('Cannot read properties of undefined')) {
          errorMessage = 'Spec inválido: verifique se todos os campos obrigatórios estão definidos'
        } else if (errorMessage.includes('Invalid specification')) {
          errorMessage = 'Especificação Vega-Lite inválida: ' + errorMessage
        }
      }

      if (options.onError) {
        options.onError(new Error(errorMessage))
      }
      throw new Error(errorMessage)
    }
  }

  async update(spec: VegaLiteSpec, data?: any[]): Promise<void> {
    if (!this.container) {
      throw new Error('Renderer not initialized. Call render() first.')
    }

    // Verificar se a spec mudou significativamente usando comparação estrutural rápida
    const normalizedSpec = this.normalizeSpec(spec)
    const specChanged = !specsAreEqual(normalizedSpec, this.currentSpec)

    if (!specChanged && !data) {
      // Nada mudou, não precisa re-renderizar
      return
    }

    await this.render({
      container: this.container,
      spec,
      data,
    })
  }

  /**
   * Atualiza apenas os dados sem re-compilar a spec
   */
  async updateData(data: any[]): Promise<void> {
    if (!this.result) {
      throw new Error('Renderer not initialized. Call render() first.')
    }

    try {
      // Usar changeset para atualizar dados eficientemente
      const view = this.result.view
      const changeSet = vega.changeset()
        .remove(() => true)
        .insert(data)

      await view.change('data_0', changeSet).runAsync()
    } catch (error) {
      console.error('Failed to update data:', error)
      // Fallback: re-renderizar completamente
      if (this.currentSpec) {
        await this.render({
          container: this.container,
          spec: this.currentSpec,
          data,
        })
      }
    }
  }

  /**
   * Exporta a visualização atual
   */
  async exportImage(format: 'svg' | 'png' = 'svg', scaleFactor: number = 1): Promise<string> {
    if (!this.result) {
      throw new Error('Renderer not initialized. Call render() first.')
    }

    if (format === 'svg') {
      return await this.result.view.toSVG(scaleFactor)
    } else {
      return await this.result.view.toImageURL('png', scaleFactor)
    }
  }

  /**
   * Obtém a spec Vega compilada (útil para debug)
   */
  getCompiledSpec(): vega.Spec | null {
    if (!this.currentSpec) return null
    return this.compileToVega(this.currentSpec)
  }

  /**
   * Obtém a spec Vega-Lite atual
   */
  getCurrentSpec(): VegaLiteSpec | null {
    return this.currentSpec
  }

  destroy(): void {
    if (this.result) {
      try {
        this.result.view.finalize()
      } catch (e) {
        // View já foi finalizada
      }
      this.result = null
    }
    this.currentSpec = null
    this.isDestroyed = true

    // Limpar debug info
    if (typeof window !== 'undefined') {
      window.VEGA_DEBUG.vegaLiteSpec = null
      window.VEGA_DEBUG.vegaSpec = null
      window.VEGA_DEBUG.view = null
    }
  }

  getView(): vega.View | null {
    return this.result?.view || null
  }

  isInitialized(): boolean {
    return this.result !== null && !this.isDestroyed
  }
}

export default VegaRenderer
