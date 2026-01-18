import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import LoginPage from './app/auth/LoginPage'
import RegisterPage from './app/auth/RegisterPage'
import GalleryPage from './app/gallery/GalleryPage'
import EditorPage from './app/editor/EditorPage'
import DashboardPage from './app/dashboard/DashboardPage'

// Layout
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/editor/:visualId" element={<EditorPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/gallery" replace />} />
      <Route path="*" element={<Navigate to="/gallery" replace />} />
    </Routes>
  )
}

export default App
