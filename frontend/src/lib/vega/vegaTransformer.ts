import type { Template, StyleConfig, VegaLiteSpec } from '@/types'

/**
 * Tipos de mark suportados pelo Vega-Lite
 */
type MarkType = 'bar' | 'line' | 'area' | 'point' | 'arc' | 'rect' | 'rule' | 'text' | 'tick' | 'trail' | 'circle' | 'square' | 'geoshape'

/**
 * Interface para mark normalizado
 */
interface NormalizedMark {
  type: MarkType
  tooltip?: boolean
  [key: string]: any
}

/**
 * Normaliza o mark para formato de objeto
 */
function normalizeMark(mark: any): NormalizedMark {
  if (typeof mark === 'string') {
    return { type: mark as MarkType, tooltip: true }
  }
  return { ...mark, tooltip: mark.tooltip ?? true }
}

/**
 * Deep merge de dois objetos
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        result[key] = deepMerge(target[key], source[key] as any)
      } else {
        result[key] = source[key] as any
      }
    }
  }

  return result
}

/**
 * Converte StyleConfig (flat, UI-friendly) para VegaLiteSpec (nested, Vega-Lite)
 */
export function styleConfigToVegaSpec(
  template: Template | any,
  styleConfig: StyleConfig,
  userData: any[],
  currentSpec?: VegaLiteSpec
): VegaLiteSpec {
  // Clone do spec base - prioriza o spec atual do visual, depois o do template
  const baseSpec = currentSpec || template?.spec || {}
  const spec: VegaLiteSpec = JSON.parse(JSON.stringify(baseSpec))

  // Garantir que tem $schema
  if (!spec.$schema) {
    spec.$schema = 'https://vega.github.io/schema/vega-lite/v5.json'
  }

  // Usar dados do usuário ou sample data
  const sampleData = template?.sampleData || []
  spec.data = {
    values: userData && userData.length > 0 ? userData : sampleData,
  }

  // Garantir que data tem valores válidos
  if (!spec.data.values || !Array.isArray(spec.data.values)) {
    spec.data.values = sampleData
  }

  // Config global
  spec.config = spec.config || {}

  // Background
  if (styleConfig.background) {
    spec.config.background = styleConfig.background
  }

  // Configurações de view
  spec.config.view = spec.config.view || {}
  spec.config.view.stroke = 'transparent'

  // Mark (borders e tooltip)
  if (spec.mark) {
    const normalizedMark = normalizeMark(spec.mark)
    spec.mark = normalizedMark

    // Tooltip
    spec.mark.tooltip = styleConfig.showTooltip

    // Bordas - aplicar apenas se showBorders for true
    if (styleConfig.showBorders) {
      spec.mark.stroke = styleConfig.borderColor
      spec.mark.strokeWidth = styleConfig.borderWidth
    } else {
      // Remover stroke se não deve mostrar bordas
      delete spec.mark.stroke
      delete spec.mark.strokeWidth
    }
  }

  // Encoding - NÃO sobrescrever se já existir!
  if (!spec.encoding) {
    spec.encoding = {}
  }

  // Configurar axes
  spec.config.axis = spec.config.axis || {}
  spec.config.axis.labelFontSize = 11
  spec.config.axis.titleFontSize = 12

  // Grid
  spec.config.axis.grid = styleConfig.showGrid

  // Eixo X - só modificar se existir no encoding
  if (spec.encoding.x) {
    if (styleConfig.showXAxis) {
      spec.encoding.x.axis = deepMerge(
        spec.encoding.x.axis || {},
        { title: styleConfig.xAxisTitle || spec.encoding.x.axis?.title }
      )
    } else {
      spec.encoding.x.axis = null
    }
  }

  // Eixo Y - só modificar se existir no encoding
  if (spec.encoding.y) {
    if (styleConfig.showYAxis) {
      spec.encoding.y.axis = deepMerge(
        spec.encoding.y.axis || {},
        { title: styleConfig.yAxisTitle || spec.encoding.y.axis?.title }
      )
    } else {
      spec.encoding.y.axis = null
    }
  }

  // Colors - aplicar scheme de cores se existir encoding de cor
  if (spec.encoding.color) {
    // Se tem regras condicionais, aplicar
    if (styleConfig.conditionalRules && styleConfig.conditionalRules.length > 0) {
      const validRules = styleConfig.conditionalRules.filter(
        rule => rule.condition && rule.color
      )

      if (validRules.length > 0) {
        spec.encoding.color = {
          condition: validRules.map((rule) => ({
            test: rule.condition,
            value: rule.color,
          })),
          value: styleConfig.primaryColor,
        }
      }
    } else {
      // Aplicar esquema de cores - preservar o field e type originais
      const originalColor = { ...spec.encoding.color }

      // Se já tem um valor fixo (como color: { value: '#3498db' }), não sobrescrever com scheme
      if (!originalColor.value) {
        spec.encoding.color = {
          ...originalColor,
          scale: {
            ...(originalColor.scale || {}),
            scheme: styleConfig.colorScheme,
          },
        }
      }
    }
  }

  // Seleção interativa
  if (styleConfig.enableSelection) {
    spec.params = spec.params || []

    // Verificar se já existe seleção
    const hasSelection = spec.params.some((p: any) => p.select)

    if (!hasSelection) {
      // Determinar campos para seleção baseado no encoding
      const selectFields: string[] = []
      if (spec.encoding.x?.field) selectFields.push('x')
      if (spec.encoding.y?.field) selectFields.push('y')

      spec.params.push({
        name: 'graphite_selection',
        select: {
          type: styleConfig.selectionType,
          ...(selectFields.length > 0 && { fields: selectFields }),
        },
      })

      // Aplicar seleção na opacidade em vez de cor para melhor UX
      spec.encoding.opacity = {
        condition: {
          param: 'graphite_selection',
          value: 1,
        },
        value: 0.3,
      }
    }
  } else {
    // Remover seleção se desabilitada
    if (spec.params) {
      spec.params = spec.params.filter((p: any) => !p.select || p.name !== 'graphite_selection')
      if (spec.params.length === 0) {
        delete spec.params
      }
    }
    // Remover opacity de seleção
    if (spec.encoding.opacity?.condition?.param === 'graphite_selection') {
      delete spec.encoding.opacity
    }
  }

  // Validação final - garantir que tem mark ou composição
  if (!spec.mark && !spec.layer && !spec.hconcat && !spec.vconcat && !spec.concat) {
    console.warn('Invalid spec: missing mark or composition, attempting recovery')

    // Tentar recuperar do template original
    if (template?.spec?.mark) {
      spec.mark = normalizeMark(template.spec.mark)
    } else {
      // Fallback para bar chart básico
      spec.mark = { type: 'bar', tooltip: true }
    }
  }

  return spec
}

/**
 * Valida se um spec Vega-Lite é válido
 */
export function validateVegaSpec(spec: VegaLiteSpec): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validações obrigatórias
  if (!spec.$schema) {
    errors.push('Missing $schema field')
  }

  if (!spec.mark && !spec.layer && !spec.hconcat && !spec.vconcat && !spec.concat) {
    errors.push('Missing mark or composition (layer, hconcat, vconcat, concat)')
  }

  if (!spec.data) {
    errors.push('Missing data field')
  } else if (!spec.data.values && !spec.data.url && !spec.data.name) {
    errors.push('Data must have values, url, or name')
  }

  // Validações de warning (não impedem renderização)
  if (spec.data?.values && Array.isArray(spec.data.values) && spec.data.values.length === 0) {
    warnings.push('Data values array is empty')
  }

  if (!spec.encoding && spec.mark) {
    warnings.push('Mark specified but no encoding defined')
  }

  // Verificar encoding para mark simples
  if (spec.mark && spec.encoding) {
    const markType = typeof spec.mark === 'string' ? spec.mark : spec.mark.type

    // Para charts cartesianos, verificar x e y
    if (['bar', 'line', 'area', 'point', 'rect', 'rule', 'tick', 'trail'].includes(markType)) {
      if (!spec.encoding.x && !spec.encoding.y) {
        warnings.push(`${markType} chart should have x and/or y encoding`)
      }
    }

    // Para arc (pie charts), verificar theta
    if (markType === 'arc') {
      if (!spec.encoding.theta && !spec.encoding.radius) {
        warnings.push('Arc chart should have theta or radius encoding')
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Cria uma spec Vega-Lite básica a partir de dados
 */
export function createBasicSpec(
  data: any[],
  markType: MarkType = 'bar',
  xField?: string,
  yField?: string
): VegaLiteSpec {
  // Detectar campos automaticamente se não especificados
  if (data.length > 0 && (!xField || !yField)) {
    const fields = Object.keys(data[0])
    const numericFields = fields.filter(f => typeof data[0][f] === 'number')
    const stringFields = fields.filter(f => typeof data[0][f] === 'string')
    const dateFields = fields.filter(f =>
      typeof data[0][f] === 'string' && !isNaN(Date.parse(data[0][f]))
    )

    if (!xField) {
      xField = dateFields[0] || stringFields[0] || fields[0]
    }
    if (!yField) {
      yField = numericFields[0] || fields[1] || fields[0]
    }
  }

  const xType = data.length > 0 && typeof data[0][xField!] === 'number'
    ? 'quantitative'
    : data.length > 0 && !isNaN(Date.parse(data[0][xField!]))
      ? 'temporal'
      : 'nominal'

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: markType, tooltip: true },
    encoding: {
      x: { field: xField, type: xType },
      y: { field: yField, type: 'quantitative' },
    },
    config: {
      view: { stroke: 'transparent' },
    },
  }
}

/**
 * Extrai StyleConfig de uma VegaLiteSpec
 */
export function extractStyleConfig(spec: VegaLiteSpec): Partial<StyleConfig> {
  const config: Partial<StyleConfig> = {}

  // Background
  if (spec.config?.background) {
    config.background = spec.config.background
  }

  // Mark settings
  if (spec.mark && typeof spec.mark === 'object') {
    config.showTooltip = spec.mark.tooltip !== false
    if (spec.mark.stroke) {
      config.showBorders = true
      config.borderColor = spec.mark.stroke
      config.borderWidth = spec.mark.strokeWidth || 1
    }
  }

  // Axis settings
  if (spec.encoding?.x?.axis) {
    config.showXAxis = spec.encoding.x.axis !== null
    if (spec.encoding.x.axis?.title) {
      config.xAxisTitle = spec.encoding.x.axis.title
    }
  }

  if (spec.encoding?.y?.axis) {
    config.showYAxis = spec.encoding.y.axis !== null
    if (spec.encoding.y.axis?.title) {
      config.yAxisTitle = spec.encoding.y.axis.title
    }
  }

  // Grid
  if (spec.config?.axis?.grid !== undefined) {
    config.showGrid = spec.config.axis.grid
  }

  // Color scheme
  if (spec.encoding?.color?.scale?.scheme) {
    config.colorScheme = spec.encoding.color.scale.scheme
  }

  // Selection
  if (spec.params?.some((p: any) => p.select)) {
    config.enableSelection = true
    const selectionParam = spec.params.find((p: any) => p.select)
    if (selectionParam?.select?.type) {
      config.selectionType = selectionParam.select.type
    }
  }

  return config
}
