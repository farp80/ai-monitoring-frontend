import {
  AUTH_CALLBACK_URI,
  AUTH_MOCK,
  getClientId,
  isProviderConfigured,
  OAUTH_ENDPOINTS,
} from '../config/auth'
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '../lib/pkce'
import {
  clearOAuthPending,
  loadOAuthPending,
  saveOAuthPending,
} from '../lib/storage'
import { apiPost } from './apiClient'
import type {
  AuthSession,
  AuthUser,
  BackendUser,
  OAuthLoginRequest,
  OAuthProvider,
} from '../types/auth'

const OAUTH_LOGIN_PATH = '/api/v1/auth/oauth'

export function mapBackendUser(u: BackendUser): AuthUser {
  return {
    id: u.id,
    email: u.email,
    emailVerified: u.email_verified,
    displayName: u.display_name,
    givenName: u.given_name ?? undefined,
    familyName: u.family_name ?? undefined,
    avatarUrl: u.avatar_url ?? undefined,
    provider: u.provider,
    providerSubject: u.provider_subject,
    roles: u.roles ?? [],
  }
}

/** Builds the request body FastAPI expects after the OAuth redirect. */
export function buildOAuthLoginRequest(
  provider: OAuthProvider,
  authorizationCode: string,
  pending: { state: string; codeVerifier: string; redirectUri: string },
): OAuthLoginRequest {
  return {
    provider,
    authorization_code: authorizationCode,
    redirect_uri: pending.redirectUri,
    code_verifier: pending.codeVerifier,
    state: pending.state,
  }
}

export async function startOAuthLogin(provider: OAuthProvider): Promise<void> {
  if (!isProviderConfigured(provider)) {
    throw new Error(`${provider} is not configured. Set client ID or VITE_AUTH_MOCK=true.`)
  }

  if (AUTH_MOCK) {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    saveOAuthPending({
      provider,
      state,
      codeVerifier,
      redirectUri: AUTH_CALLBACK_URI,
      createdAt: Date.now(),
    })
    const url = new URL(AUTH_CALLBACK_URI, window.location.origin)
    url.searchParams.set('code', `mock_${provider}_${Date.now()}`)
    url.searchParams.set('state', state)
    window.location.assign(url.toString())
    return
  }

  const clientId = getClientId(provider)
  if (!clientId) throw new Error(`Missing client ID for ${provider}`)

  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  saveOAuthPending({
    provider,
    state,
    codeVerifier,
    redirectUri: AUTH_CALLBACK_URI,
    createdAt: Date.now(),
  })

  const cfg = OAUTH_ENDPOINTS[provider]
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: AUTH_CALLBACK_URI,
    response_type: 'code',
    scope: cfg.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  if (provider === 'microsoft') params.set('response_mode', 'query')

  window.location.assign(`${cfg.authorize}?${params.toString()}`)
}

export function validateCallbackParams(
  code: string | null,
  state: string | null,
  error: string | null,
): { code: string; pending: NonNullable<ReturnType<typeof loadOAuthPending>> } {
  if (error) throw new Error(decodeURIComponent(error))
  if (!code || !state) throw new Error('Missing authorization code or state')

  const pending = loadOAuthPending()
  if (!pending) throw new Error('OAuth session expired. Sign in again.')
  if (pending.state !== state) throw new Error('Invalid OAuth state')
  if (Date.now() - pending.createdAt > 10 * 60 * 1000) {
    clearOAuthPending()
    throw new Error('OAuth session timed out')
  }

  return { code, pending }
}

/** Local shape check before POST; FastAPI must still verify the code. */
export function validateLoginRequest(payload: OAuthLoginRequest): string[] {
  const issues: string[] = []
  if (!payload.authorization_code?.trim()) issues.push('authorization_code required')
  if (!payload.redirect_uri?.startsWith('http')) issues.push('redirect_uri invalid')
  if (!payload.code_verifier || payload.code_verifier.length < 43) {
    issues.push('code_verifier invalid')
  }
  if (!payload.state?.trim()) issues.push('state required')
  return issues
}

async function mockBackendLogin(
  payload: OAuthLoginRequest,
): Promise<AuthSession> {
  await new Promise((r) => setTimeout(r, 400))
  const email = `${payload.provider}.user@example.com`
  return {
    access_token: `mock_access_${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600,
    user: {
      id: `usr_${payload.provider}_local`,
      email,
      email_verified: true,
      display_name: `${payload.provider} User`,
      given_name: 'Local',
      family_name: 'Tester',
      avatar_url: null,
      provider: payload.provider,
      provider_subject: `sub_${payload.provider}_mock`,
      roles: ['user'],
      last_login_at: new Date().toISOString(),
    },
  }
}

export async function completeOAuthLogin(
  code: string,
  state: string,
): Promise<AuthSession> {
  const { pending } = validateCallbackParams(code, state, null)
  const payload = buildOAuthLoginRequest(pending.provider, code, pending)
  const issues = validateLoginRequest(payload)
  if (issues.length) throw new Error(issues.join('; '))

  clearOAuthPending()

  if (AUTH_MOCK || code.startsWith('mock_')) {
    return mockBackendLogin(payload)
  }

  return apiPost<AuthSession>(OAUTH_LOGIN_PATH, payload)
}

export async function logoutBackend(accessToken: string): Promise<void> {
  if (AUTH_MOCK) return
  try {
    await apiPost('/api/v1/auth/logout', {}, accessToken)
  } catch {
    /* ignore if backend has no logout route yet */
  }
}
