import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthProvider'
import { AuthScreen } from './components/auth/AuthScreen'
import { LandingPage } from './components/landing/LandingPage'
import { FinanceApp } from './FinanceApp'
import { TextShimmer } from './components/motion/TextShimmer'

/** Shown while better-auth restores the session, to avoid flashing the landing
 * page before redirecting an already-logged-in user to the app. */
function AuthBootSplash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app text-app-fg">
      <TextShimmer as="span" duration={1.5} className="text-2xl font-bold tracking-tight">
        Mi Platita
      </TextShimmer>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isGuest, setIsGuest] = useState(false)

  // A real session always wins over guest mode.
  useEffect(() => {
    if (isAuthenticated) setIsGuest(false)
  }, [isAuthenticated])

  function enterGuest() {
    setIsGuest(true)
    navigate('/app')
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoading ? (
            <AuthBootSplash />
          ) : isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <LandingPage
              onRegister={() => navigate('/register')}
              onLogin={() => navigate('/login')}
              onGuest={enterGuest}
            />
          )
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <AuthScreen
              mode="login"
              onSwitchMode={(m) => navigate(`/${m}`)}
              onBack={() => navigate('/')}
              onGuestAccess={enterGuest}
            />
          )
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <AuthScreen
              mode="register"
              onSwitchMode={(m) => navigate(`/${m}`)}
              onBack={() => navigate('/')}
              onGuestAccess={enterGuest}
            />
          )
        }
      />

      <Route
        path="/app"
        element={
          isAuthenticated || isGuest ? (
            <FinanceApp
              onLogout={() => {
                setIsGuest(false)
                navigate('/')
              }}
              onRequestLogin={() => {
                setIsGuest(false)
                navigate('/login')
              }}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
