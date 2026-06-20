import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSession } from '../lib/auth-client'
import {
  type PersistenceStrategy,
  LocalPersistence,
  ApiPersistence,
} from '../lib/persistence'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: { id: string; name: string; email: string } | null
  strategy: PersistenceStrategy
}

const AuthContext = createContext<AuthContextValue | null>(null)

const localPersistence = new LocalPersistence()
const apiPersistence = new ApiPersistence()

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession()

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!session?.user,
      isLoading: isPending,
      user: session?.user ?? null,
      strategy: session?.user ? apiPersistence : localPersistence,
    }),
    [session, isPending],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function usePersistence(): PersistenceStrategy {
  return useAuth().strategy
}
