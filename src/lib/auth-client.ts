import { createAuthClient } from 'better-auth/react'

export const { useSession, signIn, signUp, signOut, deleteUser } = createAuthClient({
  baseURL: window.location.origin + '/api/auth',
})
