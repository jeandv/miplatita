import { useState } from 'react'
import { TopGradient } from '../TopGradient'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthScreenProps {
  onGuestAccess: () => void
}

export function AuthScreen({ onGuestAccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="relative min-h-dvh bg-app text-app-fg">
      <TopGradient />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Mi Platita</h1>
          <p className="text-sm text-app-muted">Control de gastos e ingresos</p>
        </header>

        <div className="rounded-2xl border border-app bg-app-surface/50 p-6">
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>

        <button
          type="button"
          onClick={onGuestAccess}
          className="mt-6 text-center text-sm text-app-muted transition-colors hover:text-app-fg"
        >
          Entrar como invitado
        </button>
      </div>
    </div>
  )
}
