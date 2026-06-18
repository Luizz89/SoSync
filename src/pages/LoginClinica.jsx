import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginClinica() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    setLoading(false)
    if (error) {
      setError('Email ou senha inválidos.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div style={{
        display: "flex", 
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
    }}>
        <form onSubmit={handleSubmit} style={{
        backgroundColor: "white", 
        width: "20%",
        padding: "1rem", 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.75rem",
        borderRadius: "0.6rem"}}>
            <h1>Entrar</h1>
            <div class="form-group">
                <label for="exampleInputEmail1">Email address</label>
                <input
                class="form-control"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            <div className="form-group">
                <label for="exampleInputPassword1">Password</label>
                <input
                class="form-control"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
                <label class="form-check-label" for="exampleCheck1">Check me out</label>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    </div>
  )
}