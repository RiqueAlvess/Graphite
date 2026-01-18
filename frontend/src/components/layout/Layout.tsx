import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, Home, User } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/gallery" className="text-xl font-bold text-primary">
                Vega Visual Builder
              </Link>

              <nav className="hidden md:flex space-x-4">
                <Link
                  to="/gallery"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Home size={16} />
                  <span>Galeria</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <User size={16} />
                  <span>Meus Visuais</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600">
                  <span className="hidden md:inline">{user.email}</span>
                  <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-medium">
                    {user.plan}
                  </span>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
