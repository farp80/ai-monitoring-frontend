import { buildOAuthLoginRequest } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'

/** Post-login view; shows user fields your FastAPI session returns. */
export function Dashboard() {
  const { user, accessToken, logout } = useAuth()

  if (!user) return null

  const samplePayload = buildOAuthLoginRequest('google', '<authorization_code>', {
    state: '<state>',
    codeVerifier: 'a'.repeat(43),
    redirectUri: 'http://localhost:5173/auth/callback',
  })

  return (
    <main className="dashboard">
      <h1>Welcome</h1>
      <div className="user-card">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" width={56} height={56} />
        ) : (
          <div
            className="user-avatar-placeholder"
            aria-hidden
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--code-bg)',
            }}
          />
        )}
        <div className="user-meta">
          <strong>{user.displayName}</strong>
          <span>{user.email}</span>
          <span>
            {user.provider} · {user.roles.join(', ') || 'user'}
          </span>
        </div>
      </div>
      <p>
        <strong>Backend session token</strong> (first 24 chars):{' '}
        <code>{accessToken?.slice(0, 24)}…</code>
      </p>
      <p>
        <strong>OAuth request shape</strong> (sent on callback):
      </p>
      <pre className="user-payload">{JSON.stringify(samplePayload, null, 2)}</pre>
      <pre className="user-payload">{JSON.stringify(user, null, 2)}</pre>
      <div className="dashboard-actions">
        <button type="button" className="btn-secondary" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </main>
  )
}
