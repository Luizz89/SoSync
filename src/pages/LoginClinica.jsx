import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function LoginClinica() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { persistSession: rememberMe },
    })

    setLoading(false)
    if (error) {
      setError('Email ou senha inválidos.')
      return
    }
    navigate('/dashboard')
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    if (!email) {
      setError('Digite seu email acima para redefinir a senha.')
      return
    }
    setError(null)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setForgotSent(true)
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          width: 'min(90%, 400px)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          borderRadius: '0.6rem',
        }}
      >
        <h1>Entrar</h1>

        <div className="form-group">
          <label htmlFor="inputEmail">Endereço de Email</label>
          <input
            id="inputEmail"
            className="form-control"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="inputPassword">Senha</label>
          <input
            id="inputPassword"
            className="form-control"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group d-flex justify-content-between align-items-center">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Mantenha-me Conectado
            </label>
          </div>
          <a href="#" onClick={handleForgotPassword}>
            Esqueci a senha
          </a>
        </div>

        {forgotSent && (
          <p style={{ color: 'green', margin: 0 }}>
            Email de redefinição enviado! Verifique sua caixa de entrada.
          </p>
        )}

        {error && (
          <p style={{ color: 'red', margin: 0 }}>
            {error}
          </p>
        )}

        <button
          className="btn btn-primary mt-4"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}