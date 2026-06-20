import { type FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { signOut } from '../lib/auth-client'
import { Button } from './Button'
import { InputField } from './FormFields'
import { TopGradient } from './TopGradient'

interface ProfileViewProps {
  onBack: () => void
  onLogout: () => void
}

export function ProfileView({ onBack, onLogout }: ProfileViewProps) {
  const { user } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Error al cambiar la contraseña')
        return
      }

      setSuccess('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    await signOut()
    onLogout()
  }

  return (
    <div className="relative min-h-dvh bg-app text-app-fg">
      <TopGradient />
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-28 pt-safe">
        <header className="mb-6 flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-app-elevated text-app-muted transition-colors hover:bg-app-hover hover:text-app-fg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        </header>

        <section className="mb-6 rounded-2xl border border-app bg-app-surface/50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-xl font-bold text-emerald-400">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">{user?.name}</p>
              <p className="truncate text-sm text-app-muted">{user?.email}</p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-app bg-app-surface/50 p-5">
          <h2 className="mb-4 text-base font-semibold">Cambiar contraseña</h2>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <InputField
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <InputField
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={passwordTooShort ? 'Mínimo 8 caracteres' : undefined}
            />

            <InputField
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={passwordMismatch ? 'Las contraseñas no coinciden' : undefined}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading || passwordMismatch || passwordTooShort}
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </section>

        <section>
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>
        </section>
      </div>
    </div>
  )
}
