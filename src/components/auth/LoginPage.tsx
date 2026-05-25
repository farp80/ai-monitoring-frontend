import { useSearchParams } from 'react-router-dom'
import { AUTH_MOCK, isProviderConfigured } from '../../config/auth'
import { useAuth } from '../../hooks/useAuth'
import type { OAuthProvider } from '../../types/auth'
import { ProviderButton } from './ProviderButton'
import './LoginPage.css'

const PROVIDERS: OAuthProvider[] = ['google', 'microsoft', 'yahoo']

export function LoginPage() {
  const { loginWithProvider, isLoading, error, clearError } = useAuth()
  const [params] = useSearchParams()
  const urlError = params.get('error')
  const displayError =
    error ??
    (urlError ? decodeURIComponent(urlError.replace(/\+/g, ' ')) : null)

  return (
    <main className="login-page">
      <div className="login-card">
        <header className="login-header">
          <h1>Sign in</h1>
          <p>Use your work or personal account to access AI Monitoring.</p>
        </header>

        {AUTH_MOCK && (
          <p className="login-banner" role="status">
            Mock auth enabled — no real OAuth credentials required.
          </p>
        )}

        {displayError && (
          <div className="login-error" role="alert">
            <span>{displayError}</span>
            <button type="button" onClick={clearError} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        <div className="provider-list">
          {PROVIDERS.map((provider) => (
            <ProviderButton
              key={provider}
              provider={provider}
              disabled={isLoading || !isProviderConfigured(provider)}
              onClick={loginWithProvider}
            />
          ))}
        </div>

        <footer className="login-footer">
          <p>
            Tokens are validated on your FastAPI backend. Configure{' '}
            <code>.env</code> for live OAuth.
          </p>
        </footer>
      </div>
    </main>
  )
}
