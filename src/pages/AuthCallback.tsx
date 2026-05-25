import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { handleOAuthCallback, error } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const code = params.get('code')
    const state = params.get('state')
    const oauthError = params.get('error_description') ?? params.get('error')

    if (oauthError) {
      navigate('/?error=' + encodeURIComponent(oauthError), { replace: true })
      return
    }

    if (!code || !state) {
      navigate('/?error=missing_params', { replace: true })
      return
    }

    void handleOAuthCallback(code, state)
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/?error=callback_failed', { replace: true }))
  }, [params, navigate, handleOAuthCallback])

  return (
    <div className="callback-status" role="status">
      {error ?? 'Completing sign-in…'}
    </div>
  )
}
