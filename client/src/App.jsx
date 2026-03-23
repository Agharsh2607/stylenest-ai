import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import UploadGenerate from './pages/UploadGenerate'
import ResultView from './pages/ResultView'
import Canvas3D from './pages/Canvas3D'

/** Protected route wrapper — redirects to /auth if not logged in */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/10 border-t-primary animate-spin mb-4" />
          <p className="text-on-surface-variant font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <UploadGenerate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result/:id?"
        element={
          <ProtectedRoute>
            <ResultView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/canvas3d"
        element={
          <ProtectedRoute>
            <Canvas3D />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
