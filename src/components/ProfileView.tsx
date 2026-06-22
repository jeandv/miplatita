import { type FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { signOut, deleteUser } from '../lib/auth-client'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

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

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    try {
      await deleteUser()
      onLogout()
    } catch {
      setError('Error al eliminar la cuenta. Intenta de nuevo.')
      setShowDeleteModal(false)
      setDeletingAccount(false)
    }
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-app-accent text-xl font-bold text-app-accent-fg">
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
            <div className="mb-4 rounded-xl border border-app bg-app-accent-soft px-4 py-3 text-sm text-app-fg">
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

        <section className="space-y-4">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={handleLogout}
            disabled={loggingOut || deletingAccount}
          >
            {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>

          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={() => setShowDeleteModal(true)}
            disabled={loggingOut || deletingAccount}
          >
            Eliminar cuenta
          </Button>
        </section>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm scale-100 rounded-2xl border border-app bg-app-surface p-6 shadow-2xl transition-transform">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-app-fg">¿Eliminar cuenta?</h3>
            <p className="mb-6 text-sm text-app-muted">
              Esta acción es irreversible. Se borrarán permanentemente todos tus movimientos, cuentas y categorías personalizadas.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1"
              >
                {deletingAccount ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
