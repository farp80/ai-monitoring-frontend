import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearSession,
  loadSession,
  saveSession,
} from '../lib/storage'
import {
  completeOAuthLogin,
  logoutBackend,
  mapBackendUser,
  startOAuthLogin,
} from '../services/authService'
import type { AuthState, AuthUser, OAuthProvider } from '../types/auth'

export interface AuthContextValue extends AuthState {
  loginWithProvider: (provider: OAuthProvider) => Promise<void>
  handleOAuthCallback: (code: string, state: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const session = loadSession()
    if (session) {
      setUser(mapBackendUser(session.user))
      setAccessToken(session.access_token)
    }
    setIsLoading(false)
  }, [])

  const loginWithProvider = useCallback(async (provider: OAuthProvider) => {
    setError(null)
    setIsLoading(true)
    try {
      await startOAuthLogin(provider)
    } catch (e) {
      setIsLoading(false)
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }, [])

  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const session = await completeOAuthLogin(code, state)
      saveSession(session)
      setUser(mapBackendUser(session.user))
      setAccessToken(session.access_token)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed')
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (accessToken) await logoutBackend(accessToken)
    clearSession()
    setUser(null)
    setAccessToken(null)
    setError(null)
  }, [accessToken])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      error,
      loginWithProvider,
      handleOAuthCallback,
      logout,
      clearError,
    }),
    [
      user,
      accessToken,
      isLoading,
      error,
      loginWithProvider,
      handleOAuthCallback,
      logout,
      clearError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
