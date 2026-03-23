import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './services/supabase'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import UploadGenerate from './pages/UploadGenerate'
import ResultView from './pages/ResultView'
import Canvas3D from './pages/Canvas3D'
import Pricing from './pages/Pricing'

/** Protected route wrapper — redirects to /auth if not logged in.
 *  In demo mode (no Supabase configured), always allows access. */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const demoMode = !isSupabaseConfigured()

  if (loading && !demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/10 border-t-primary animate-spin mb-4" />
          <p className="text-on-surface-variant font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!demoMode && !user) return <Navigate to="/auth" replace />
  return children
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

export default function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
          <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
          <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <PageWrapper><UploadGenerate /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:id?"
            element={
              <ProtectedRoute>
                <PageWrapper><ResultView /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/canvas3d"
            element={
              <ProtectedRoute>
                <PageWrapper><Canvas3D /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
