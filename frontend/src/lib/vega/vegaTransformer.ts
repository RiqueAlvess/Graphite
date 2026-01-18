import type { Template, StyleConfig, VegaLiteSpec } from '@/types'

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
  const baseSpec = currentSpec || template.spec || {}
  const spec: VegaLiteSpec = JSON.parse(JSON.stringify(baseSpec))

  // Garantir que tem $schema
  if (!spec.$schema) {
    spec.$schema = 'https://vega.github.io/schema/vega-lite/v5.json'
  }

  // Usar dados do usuário ou sample data
  spec.data = {
    values: userData.length > 0 ? userData : template.sampleData || [],
  }

  // Config global
  spec.config = spec.config || {}
  spec.config.background = styleConfig.background

  // Mark (borders)
  if (spec.mark) {
    // Garantir que mark seja objeto
    if (typeof spec.mark === 'string') {
      spec.mark = { type: spec.mark }
    }

    if (styleConfig.showBorders) {
      spec.mark.stroke = styleConfig.borderColor
      spec.mark.strokeWidth = styleConfig.borderWidth
    } else {
      spec.mark.stroke = null
    }

    // Tooltip
    spec.mark.tooltip = styleConfig.showTooltip
  }

  // Encoding - NÃO sobrescrever se já existir!
  if (!spec.encoding) {
    spec.encoding = {}
  }

  // Eixos - só modificar se existirem
  if (spec.encoding.x) {
    spec.encoding.x.axis = {
      ...spec.encoding.x.axis,
      title: styleConfig.xAxisTitle,
    }
    if (!styleConfig.showXAxis) {
      spec.encoding.x.axis = null
    }
  }

  if (spec.encoding.y) {
    spec.encoding.y.axis = {
      ...spec.encoding.y.axis,
      title: styleConfig.yAxisTitle,
    }
    if (!styleConfig.showYAxis) {
      spec.encoding.y.axis = null
    }
  }

  // Grid
  if (spec.config.axis) {
    spec.config.axis.grid = styleConfig.showGrid
  }

  // Colors
  if (spec.encoding.color) {
    // Se tem regras condicionais, aplicar
    if (styleConfig.conditionalRules.length > 0) {
      spec.encoding.color = {
        condition: styleConfig.conditionalRules.map((rule) => ({
          test: rule.condition,
          value: rule.color,
        })),
        value: styleConfig.primaryColor,
      }
    } else {
      // Senão, usar esquema de cores
      if (spec.encoding.color.scale) {
        spec.encoding.color.scale.scheme = styleConfig.colorScheme
      } else {
        spec.encoding.color.scale = {
          scheme: styleConfig.colorScheme,
        }
      }
    }
  }

  // Seleção interativa
  if (styleConfig.enableSelection) {
    spec.params = spec.params || []

    // Adicionar param de seleção se não existir
    const hasSelection = spec.params.some((p: any) => p.select)

    if (!hasSelection) {
      spec.params.push({
        name: 'user_selection',
        select: {
          type: styleConfig.selectionType,
          fields: Object.keys(spec.encoding).filter((k) => k === 'x' || k === 'y'),
        },
      })

      // Aplicar seleção na cor
      if (spec.encoding.color) {
        const currentColor = spec.encoding.color
        spec.encoding.color = {
          condition: {
            param: 'user_selection',
            value: styleConfig.primaryColor,
          },
          value: 'lightgray',
        }
      }
    }
  }

  // Validação final - garantir que tem mark
  if (!spec.mark && !spec.layer && !spec.hconcat && !spec.vconcat && !spec.concat) {
    console.error('Invalid spec: missing mark or composition', spec)
    // Fallback - tentar usar do template original
    if (template.spec?.mark) {
      spec.mark = template.spec.mark
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
} {
  const errors: string[] = []

  if (!spec.$schema) {
    errors.push('Missing $schema field')
  }

  if (!spec.mark && !spec.layer && !spec.hconcat && !spec.vconcat) {
    errors.push('Missing mark or composition (layer, hconcat, vconcat)')
  }

  if (!spec.data) {
    errors.push('Missing data field')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
