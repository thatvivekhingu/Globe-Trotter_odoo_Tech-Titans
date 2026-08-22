import { createContext } from 'react'
import type { ApiUser, LoginInput, SignupInput } from '../lib/api/authApi'

export type AuthStatus = 'loading' | 'authenticated' | 'demo' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: ApiUser | undefined
  error: string | null
  login: (input: LoginInput) => Promise<boolean>
  signup: (input: SignupInput) => Promise<boolean>
  continueDemo: () => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
