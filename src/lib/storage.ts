const SESSION_KEY = 'ai_monitoring_auth_session'
const PENDING_KEY = 'ai_monitoring_oauth_pending'

import type { AuthSession, OAuthPending } from '../types/auth'

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(): AuthSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function saveOAuthPending(pending: OAuthPending): void {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
}

export function loadOAuthPending(): OAuthPending | null {
  const raw = sessionStorage.getItem(PENDING_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OAuthPending
  } catch {
    return null
  }
}

export function clearOAuthPending(): void {
  sessionStorage.removeItem(PENDING_KEY)
}
