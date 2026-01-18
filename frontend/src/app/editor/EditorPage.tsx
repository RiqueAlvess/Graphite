import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/store/editorStore'
import { useVegaPreview } from '@/hooks/useVegaPreview'
import { Button } from '@/components/ui/button'
import { Save, Copy, ArrowLeft, Download, RefreshCw } from 'lucide-react'
import StylePanel from '@/components/editor/StylePanel'

export default function EditorPage() {
  const { visualId } = useParams<{ visualId: string }>()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    currentVisual,
    vegaSpec,
    isLoading,
    isSaving,
    loadVisual,
    saveVisual,
    exportToJSON,
  } = useEditorStore()

  const {
    error: renderError,
    warnings,
    isRendering,
    isValidSpec,
    refresh,
    exportImage,
  } = useVegaPreview(containerRef, vegaSpec, undefined, {
    debounceMs: 300,
    renderer: 'svg',
    actions: false,
    onError: (err) => console.error('Render error:', err),
  })

  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (visualId) {
      loadVisual(visualId)
    }
  }, [visualId])

  async function handleSave() {
    try {
      await saveVisual()
      alert('Visual salvo com sucesso!')
    } catch (error) {
      alert('Erro ao salvar visual.')
    }
  }

  async function handleExport() {
    const json = exportToJSON()
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExportImage() {
    setIsExporting(true)
    try {
      const svgData = await exportImage('svg')
      if (svgData) {
        // Criar blob e download
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentVisual?.name || 'chart'}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export image:', error)
      alert('Erro ao exportar imagem.')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">Carregando editor...</div>
      </div>
    )
  }

  if (!currentVisual) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="mb-4">Visual não encontrado.</p>
          <Button onClick={() => navigate('/gallery')}>Voltar para Galeria</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>

            <div className="border-l border-gray-300 pl-4">
              <h2 className="font-semibold text-gray-900">{currentVisual.name}</h2>
              <p className="text-sm text-gray-500">{currentVisual.template?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isRendering}
              title="Atualizar preview"
            >
              <RefreshCw size={16} className={isRendering ? 'animate-spin' : ''} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportImage}
              disabled={isExporting || !isValidSpec}
            >
              <Download size={16} className="mr-2" />
              {isExporting ? 'Exportando...' : 'SVG'}
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Copy size={16} className="mr-2" />
              {copied ? 'Copiado!' : 'Copiar JSON'}
            </Button>

            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save size={16} className="mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Style Panel - Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <StylePanel />
        </div>

        {/* Canvas - Preview */}
        <div className="flex-1 bg-gray-50 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Preview</h3>
                {isRendering && (
                  <span className="text-sm text-gray-500">Renderizando...</span>
                )}
              </div>

              {renderError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                  <p className="font-medium">Erro ao renderizar:</p>
                  <p className="text-sm mt-1">{renderError.message}</p>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-4">
                  <p className="font-medium">Avisos:</p>
                  <ul className="text-sm mt-1 list-disc list-inside">
                    {warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                ref={containerRef}
                className="w-full min-h-[400px] flex items-center justify-center"
              />
            </div>

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && vegaSpec && (
              <details className="mt-4 bg-gray-100 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Debug: Vega-Lite Spec
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-96 bg-gray-800 text-green-400 p-4 rounded">
                  {JSON.stringify(vegaSpec, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
