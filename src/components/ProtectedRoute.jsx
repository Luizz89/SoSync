import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  // Aguarda a verificação inicial da sessão antes de redirecionar
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <p>Carregando...</p>
      </div>
    )
  }

  // Sem sessão → vai pro login; replace evita que o login fique no histórico
  if (!session) return <Navigate to="/login" replace />

  // Tem sessão → renderiza a página filha normalmente
  return <Outlet />
}