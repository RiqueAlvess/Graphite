import { useEditorStore } from '@/store/editorStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function StylePanel() {
  const { styleConfig, updateStyle } = useEditorStore()

  if (!styleConfig) {
    return <div className="p-4">Carregando...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Estilo</h3>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <Label htmlFor="background">Cor de Fundo</Label>
        <div className="flex space-x-2">
          <Input
            id="background"
            type="color"
            value={styleConfig.background}
            onChange={(e) => updateStyle('background', e.target.value)}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={styleConfig.background}
            onChange={(e) => updateStyle('background', e.target.value)}
            placeholder="#ffffff"
            className="flex-1"
          />
        </div>
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label htmlFor="primaryColor">Cor Principal</Label>
        <div className="flex space-x-2">
          <Input
            id="primaryColor"
            type="color"
            value={styleConfig.primaryColor}
            onChange={(e) => updateStyle('primaryColor', e.target.value)}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={styleConfig.primaryColor}
            onChange={(e) => updateStyle('primaryColor', e.target.value)}
            placeholder="#3498db"
            className="flex-1"
          />
        </div>
      </div>

      {/* Color Scheme */}
      <div className="space-y-2">
        <Label htmlFor="colorScheme">Esquema de Cores</Label>
        <select
          id="colorScheme"
          value={styleConfig.colorScheme}
          onChange={(e) => updateStyle('colorScheme', e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="category10">Category 10</option>
          <option value="tableau10">Tableau 10</option>
          <option value="blues">Blues</option>
          <option value="greens">Greens</option>
          <option value="reds">Reds</option>
          <option value="viridis">Viridis</option>
          <option value="redyellowgreen">Red-Yellow-Green</option>
        </select>
      </div>

      <hr className="border-gray-200" />

      {/* Axes */}
      <div>
        <h4 className="font-medium mb-3">Eixos</h4>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="xAxisTitle">Título do Eixo X</Label>
            <Input
              id="xAxisTitle"
              type="text"
              value={styleConfig.xAxisTitle}
              onChange={(e) => updateStyle('xAxisTitle', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yAxisTitle">Título do Eixo Y</Label>
            <Input
              id="yAxisTitle"
              type="text"
              value={styleConfig.yAxisTitle}
              onChange={(e) => updateStyle('yAxisTitle', e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showGrid"
              checked={styleConfig.showGrid}
              onChange={(e) => updateStyle('showGrid', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="showGrid" className="cursor-pointer">
              Mostrar Grade
            </Label>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Borders */}
      <div>
        <h4 className="font-medium mb-3">Bordas</h4>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showBorders"
              checked={styleConfig.showBorders}
              onChange={(e) => updateStyle('showBorders', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="showBorders" className="cursor-pointer">
              Mostrar Bordas
            </Label>
          </div>

          {styleConfig.showBorders && (
            <>
              <div className="space-y-2">
                <Label htmlFor="borderColor">Cor da Borda</Label>
                <div className="flex space-x-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={styleConfig.borderColor}
                    onChange={(e) => updateStyle('borderColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={styleConfig.borderColor}
                    onChange={(e) => updateStyle('borderColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderWidth">Largura da Borda</Label>
                <Input
                  id="borderWidth"
                  type="number"
                  min="1"
                  max="10"
                  value={styleConfig.borderWidth}
                  onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Tooltip */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showTooltip"
          checked={styleConfig.showTooltip}
          onChange={(e) => updateStyle('showTooltip', e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="showTooltip" className="cursor-pointer">
          Mostrar Tooltip
        </Label>
      </div>

      <hr className="border-gray-200" />

      {/* Interatividade */}
      <div>
        <h4 className="font-medium mb-3">Interatividade</h4>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableSelection"
              checked={styleConfig.enableSelection}
              onChange={(e) => updateStyle('enableSelection', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="enableSelection" className="cursor-pointer">
              Habilitar Seleção
            </Label>
          </div>

          {styleConfig.enableSelection && (
            <div className="space-y-2">
              <Label htmlFor="selectionType">Tipo de Seleção</Label>
              <select
                id="selectionType"
                value={styleConfig.selectionType}
                onChange={(e) => updateStyle('selectionType', e.target.value as any)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="point">Ponto (clique)</option>
                <option value="interval">Intervalo (área)</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
