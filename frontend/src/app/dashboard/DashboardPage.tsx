import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGalleryStore } from '@/store/galleryStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { userVisuals, isLoadingVisuals, loadUserVisuals, deleteVisual } = useGalleryStore()

  useEffect(() => {
    loadUserVisuals()
  }, [])

  async function handleDelete(visualId: string) {
    if (!confirm('Tem certeza que deseja deletar este visual?')) {
      return
    }

    try {
      await deleteVisual(visualId)
    } catch (error) {
      alert('Erro ao deletar visual.')
    }
  }

  if (isLoadingVisuals) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando seus visuais...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Visuais</h1>
        <p className="text-gray-600">Gerencie e edite seus gráficos criados</p>
      </div>

      {userVisuals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Você ainda não criou nenhum visual.</p>
          <Button onClick={() => navigate('/gallery')}>Criar Primeiro Visual</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userVisuals.map((visual) => (
            <Card key={visual.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{visual.name}</CardTitle>
                    {visual.description && (
                      <CardDescription className="mt-1">{visual.description}</CardDescription>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      visual.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {visual.status === 'COMPLETED' ? 'Concluído' : 'Rascunho'}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    <p>Template: {visual.template?.name}</p>
                    <p>
                      Criado: {format(new Date(visual.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/editor/${visual.id}`)}
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(visual.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
