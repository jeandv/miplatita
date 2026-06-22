import { TopGradient } from '../TopGradient'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthScreenProps {
  mode: 'login' | 'register'
  onSwitchMode: (mode: 'login' | 'register') => void
  onGuestAccess: () => void
  onBack?: () => void
}

export function AuthScreen({ mode, onSwitchMode, onGuestAccess, onBack }: AuthScreenProps) {
  return (
    <div className="relative min-h-dvh bg-app text-app-fg">
      <TopGradient />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-12">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 self-start text-sm text-app-muted transition-colors hover:text-app-fg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver
          </button>
        )}
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="text-sm text-app-muted">Control de gastos e ingresos</p>
        </header>

        <div className="rounded-2xl border border-app bg-app-surface/50 p-6">
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => onSwitchMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => onSwitchMode('login')} />
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
