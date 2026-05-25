/** OAuth identity providers supported by the platform. */
export type OAuthProvider = 'google' | 'microsoft' | 'yahoo'

/**
 * Payload sent to FastAPI (e.g. POST /api/v1/auth/oauth).
 * Backend exchanges `authorization_code` and returns a session.
 */
export interface OAuthLoginRequest {
  provider: OAuthProvider
  authorization_code: string
  redirect_uri: string
  code_verifier: string
  state: string
}

/**
 * User record returned by FastAPI after successful validation.
 * Align field names with your Pydantic models (snake_case).
 */
export interface BackendUser {
  id: string
  email: string
  email_verified: boolean
  display_name: string
  given_name?: string | null
  family_name?: string | null
  avatar_url?: string | null
  provider: OAuthProvider
  provider_subject: string
  roles?: string[]
  created_at?: string | null
  last_login_at?: string | null
}

/** Session returned by FastAPI after OAuth login. */
export interface AuthSession {
  access_token: string
  refresh_token?: string | null
  token_type: string
  expires_in: number
  user: BackendUser
}

/** Normalized user stored in the client after login. */
export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  displayName: string
  givenName?: string
  familyName?: string
  avatarUrl?: string
  provider: OAuthProvider
  providerSubject: string
  roles: string[]
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/** Pending OAuth PKCE + state stored before redirect. */
export interface OAuthPending {
  provider: OAuthProvider
  state: string
  codeVerifier: string
  redirectUri: string
  createdAt: number
}
