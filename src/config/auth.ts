import type { OAuthProvider } from '../types/auth'

const origin = typeof window !== 'undefined' ? window.location.origin : ''

export const AUTH_CALLBACK_PATH = '/auth/callback'
export const AUTH_CALLBACK_URI = `${origin}${AUTH_CALLBACK_PATH}`

/** Empty string uses Vite dev proxy to FastAPI at /api. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const AUTH_MOCK = import.meta.env.VITE_AUTH_MOCK === 'true'

export const OAUTH_ENDPOINTS: Record<
  OAuthProvider,
  { authorize: string; scopes: string[]; clientIdEnv: string }
> = {
  google: {
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['openid', 'email', 'profile'],
    clientIdEnv: 'VITE_GOOGLE_CLIENT_ID',
  },
  microsoft: {
    authorize:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: ['openid', 'email', 'profile', 'User.Read'],
    clientIdEnv: 'VITE_MICROSOFT_CLIENT_ID',
  },
  yahoo: {
    authorize: 'https://api.login.yahoo.com/oauth2/request_auth',
    scopes: ['openid', 'email', 'profile'],
    clientIdEnv: 'VITE_YAHOO_CLIENT_ID',
  },
}

export function getClientId(provider: OAuthProvider): string | undefined {
  const key = OAUTH_ENDPOINTS[provider].clientIdEnv
  const map: Record<string, string | undefined> = {
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_MICROSOFT_CLIENT_ID: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    VITE_YAHOO_CLIENT_ID: import.meta.env.VITE_YAHOO_CLIENT_ID,
  }
  return map[key]
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  return Boolean(getClientId(provider)) || AUTH_MOCK
}
