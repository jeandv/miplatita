import { type FormEvent, useState } from 'react'
import { signUp } from '../../lib/auth-client'
import { Button } from '../Button'
import { InputField } from '../FormFields'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordTooShort = password.length > 0 && password.length < 8

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const result = await signUp.email({ name, email, password })
      if (result.error) {
        setError(result.error.message ?? 'Error al crear la cuenta')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-2 text-center">
        <h2 className="text-xl font-bold tracking-tight">Crear cuenta</h2>
        <p className="mt-1 text-sm text-app-muted">Empieza a controlar tus finanzas</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <InputField
        label="Nombre"
        type="text"
        placeholder="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />

      <InputField
        label="Correo electrónico"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <div>
        <InputField
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          error={passwordTooShort ? 'Mínimo 8 caracteres' : undefined}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={loading || passwordTooShort}
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <p className="text-center text-sm text-app-muted">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  )
}
