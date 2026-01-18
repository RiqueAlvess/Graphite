import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/store/editorStore'
import { useVegaPreview } from '@/hooks/useVegaPreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Copy, ArrowLeft } from 'lucide-react'
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

  const { error: renderError, isRendering } = useVegaPreview(containerRef, vegaSpec)

  const [copied, setCopied] = useState(false)

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
              <h3 className="text-lg font-semibold mb-4">Preview</h3>

              {renderError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                  <p className="font-medium">Erro ao renderizar:</p>
                  <p className="text-sm mt-1">{renderError.message}</p>
                </div>
              )}

              {isRendering && (
                <div className="text-center py-8 text-gray-500">Renderizando...</div>
              )}

              <div ref={containerRef} className="w-full min-h-[400px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
