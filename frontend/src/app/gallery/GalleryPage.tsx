import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGalleryStore } from '@/store/galleryStore'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function GalleryPage() {
  const navigate = useNavigate()
  const { templates, isLoadingTemplates, loadTemplates, createFromTemplate } = useGalleryStore()
  const { getPlanLimits } = useAuthStore()

  useEffect(() => {
    loadTemplates()
  }, [])

  async function handleSelectTemplate(templateId: string) {
    try {
      // Verificar limites do plano
      const limits = await getPlanLimits()
      if (!limits.canCreateVisual) {
        alert(`Limite diário atingido! Você pode criar ${limits.dailyVisualsLimit} visual(is) por dia.`)
        return
      }

      // Criar visual a partir do template
      const visual = await createFromTemplate(templateId)

      // Navegar para o editor
      navigate(`/editor/${visual.id}`)
    } catch (error: any) {
      if (error.response?.data?.error === 'DAILY_LIMIT_REACHED') {
        alert(error.response.data.message)
      } else {
        alert('Erro ao criar visual. Tente novamente.')
      }
    }
  }

  if (isLoadingTemplates) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando templates...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Galeria de Templates</h1>
        <p className="text-gray-600">
          Escolha um template para começar a criar seu gráfico Vega
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSelectTemplate(template.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                {template.isPremium && (
                  <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 font-medium">
                    PREMIUM
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                <span className="text-4xl">{getCategoryEmoji(template.category)}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button className="w-full" size="sm">
                <Plus size={16} className="mr-2" />
                Usar Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum template disponível.
        </div>
      )}
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    bar: '📊',
    line: '📈',
    area: '📉',
    scatter: '⚫',
    pie: '🥧',
    heatmap: '🔥',
  }
  return emojis[category] || '📊'
}
