import { Navigate, Route, Routes } from 'react-router-dom'
import { Dashboard } from './components/auth/Dashboard'
import { LoginPage } from './components/auth/LoginPage'
import { useAuth } from './hooks/useAuth'
import { AuthCallback } from './pages/AuthCallback'
import './components/auth/LoginPage.css'

function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="callback-status">Loading…</div>
  }

  if (isAuthenticated) return <Dashboard />
  return <LoginPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
