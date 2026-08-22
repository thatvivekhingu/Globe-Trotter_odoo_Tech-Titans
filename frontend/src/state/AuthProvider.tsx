import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getApiErrorMessage } from '../lib/api/client'
import { getCurrentUser, login as loginRequest, logout as logoutRequest, signup as signupRequest, type ApiUser, type LoginInput, type SignupInput } from '../lib/api/authApi'
import { clearAccessToken, clearDemoState, getAccessToken, hasDemoSession, setAccessToken, setDemoSession } from '../lib/authStorage'
import { useTripWise } from './useTripWise'
import { AuthContext, type AuthStatus } from './AuthContext'

function toLocalUser(user: ApiUser) {
  return {
    id: String(user.id),
    name: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url || undefined,
    language: user.language_code,
    role: user.role,
  } as const
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { dispatch } = useTripWise()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<ApiUser>()
  const [error, setError] = useState<string | null>(null)

  const syncUser = useCallback((nextUser: ApiUser) => {
    setUser(nextUser)
    dispatch({ type: 'SYNC_AUTH_USER', user: toLocalUser(nextUser) })
  }, [dispatch])

  useEffect(() => {
    let cancelled = false
    async function hydrateSession() {
      const token = getAccessToken()
      if (!token) {
        if (hasDemoSession()) {
          dispatch({ type: 'SIGN_IN_DEMO', userId: 'user-1' })
          if (!cancelled) setStatus('demo')
        } else if (!cancelled) {
          dispatch({ type: 'SIGN_OUT_DEMO' })
          setStatus('unauthenticated')
        }
        return
      }
      try {
        const nextUser = await getCurrentUser()
        if (cancelled) return
        syncUser(nextUser)
        setStatus('authenticated')
      } catch {
        clearAccessToken()
        setDemoSession(false)
        if (!cancelled) {
          setUser(undefined)
          setStatus('unauthenticated')
          setError('Your session has expired. Please sign in again.')
        }
      }
    }
    void hydrateSession()
    return () => { cancelled = true }
  }, [dispatch, syncUser])

  const login = useCallback(async (input: LoginInput) => {
    setStatus('loading')
    setError(null)
    try {
      const response = await loginRequest(input)
      setAccessToken(response.access_token)
      setDemoSession(false)
      clearDemoState()
      syncUser(response.user)
      setStatus('authenticated')
      return true
    } catch (requestError) {
      setStatus('unauthenticated')
      setError(getApiErrorMessage(requestError, 'Invalid email or password.'))
      return false
    }
  }, [syncUser])

  const signup = useCallback(async (input: SignupInput) => {
    setStatus('loading')
    setError(null)
    try {
      const response = await signupRequest(input)
      setAccessToken(response.access_token)
      setDemoSession(false)
      clearDemoState()
      syncUser(response.user)
      setStatus('authenticated')
      return true
    } catch (requestError) {
      setStatus('unauthenticated')
      setError(getApiErrorMessage(requestError, 'We could not create your account.'))
      return false
    }
  }, [syncUser])

  const continueDemo = useCallback(() => {
    clearAccessToken()
    setDemoSession(true)
    setError(null)
    dispatch({ type: 'SIGN_IN_DEMO', userId: 'user-1' })
    setStatus('demo')
  }, [dispatch])

  const logout = useCallback(async () => {
    const hasToken = Boolean(getAccessToken())
    try {
      if (hasToken) await logoutRequest()
    } catch {
      // A stateless JWT is still safely removed locally if the server is unavailable.
    } finally {
      clearAccessToken()
      setDemoSession(false)
      clearDemoState()
      setUser(undefined)
      setError(null)
      dispatch({ type: 'SIGN_OUT_DEMO' })
      setStatus('unauthenticated')
    }
  }, [dispatch])

  const value = useMemo(() => ({ status, user, error, login, signup, continueDemo, logout }), [continueDemo, error, login, logout, signup, status, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
