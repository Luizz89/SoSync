// src/pages/PerfilClinica.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import Layout from '../components/layout/Layout'

export default function PerfilClinica() {
  const { clinica, session } = useAuth()

  const [perfil, setPerfil] = useState({ nome_clinica: '', nome_admin: '' })
  const [senha, setSenha] = useState({ nova: '', confirmar: '' })
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [msgPerfil, setMsgPerfil] = useState(null)
  const [msgSenha, setMsgSenha]   = useState(null)

  // Preenche o form quando os dados da clínica carregarem do contexto
  useEffect(() => {
    if (clinica) {
      setPerfil({
        nome_clinica: clinica.nome_clinica || '',
        nome_admin:   clinica.nome_admin   || '',
      })
    }
  }, [clinica])

  async function handleSalvarPerfil(e) {
    e.preventDefault()
    setMsgPerfil(null)
    setSalvandoPerfil(true)

    const { error } = await supabase
      .from('clinicas')
      .update({
        nome_clinica: perfil.nome_clinica.trim(),
        nome_admin:   perfil.nome_admin.trim(),
      })
      .eq('id', session.user.id)

    setSalvandoPerfil(false)
    setMsgPerfil(
      error
        ? { tipo: 'erro',    texto: 'Erro ao salvar. Tente novamente.' }
        : { tipo: 'sucesso', texto: 'Dados atualizados com sucesso.' }
    )
  }

  async function handleSalvarSenha(e) {
    e.preventDefault()
    setMsgSenha(null)

    if (senha.nova.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A senha deve ter no mínimo 6 caracteres.' })
      return
    }
    if (senha.nova !== senha.confirmar) {
      setMsgSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' })
      return
    }

    setSalvandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: senha.nova })
    setSalvandoSenha(false)

    if (error) {
      setMsgSenha({ tipo: 'erro', texto: 'Erro ao alterar senha. Tente novamente.' })
    } else {
      setSenha({ nova: '', confirmar: '' })
      setMsgSenha({ tipo: 'sucesso', texto: 'Senha alterada com sucesso.' })
    }
  }

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #E8E8E8',
    fontSize: '14px',
  }

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--cor-texto)',
  }

  function Feedback({ msg }) {
    if (!msg) return null
    return (
      <div style={{ padding: '12px', borderRadius: '8px', fontSize: '13px', backgroundColor: msg.tipo === 'erro' ? '#FFE5E5' : '#E5FBF8', color: msg.tipo === 'erro' ? '#FF6B6B' : '#00A896' }}>
        {msg.texto}
      </div>
    )
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    marginBottom: '20px',
  }

  const btnStyle = (loading) => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '10px',
    border: 'none',
    background: loading ? '#ccc' : 'var(--cor-primaria)',
    color: 'white',
    cursor: loading ? 'not-allowed' : 'pointer',
    alignSelf: 'flex-start',
  })

  return (
    <Layout headerTitle="Meu Perfil">
      <div style={{ maxWidth: '560px' }}>

        {/* Card: Dados da clínica */}
        <div style={cardStyle}>
          <h6 style={{ margin: '0 0 24px', fontWeight: '500', color: 'var(--cor-texto)', fontSize: '16px' }}>
            Dados da clínica
          </h6>
          <form onSubmit={handleSalvarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label" style={labelStyle}>Nome da Clínica</label>
              <input
                type="text"
                className="form-control"
                value={perfil.nome_clinica}
                onChange={e => setPerfil(p => ({ ...p, nome_clinica: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label className="form-label" style={labelStyle}>Seu Nome</label>
              <input
                type="text"
                className="form-control"
                value={perfil.nome_admin}
                onChange={e => setPerfil(p => ({ ...p, nome_admin: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label className="form-label" style={labelStyle}>Email</label>
              <input
                type="email"
                className="form-control"
                value={session?.user?.email || ''}
                disabled
                style={{ ...inputStyle, backgroundColor: '#F8F9FA', color: 'var(--cor-texto-secundario)' }}
              />
              <small style={{ color: 'var(--cor-texto-secundario)', fontSize: '12px' }}>
                O email não pode ser alterado.
              </small>
            </div>
            <Feedback msg={msgPerfil} />
            <button type="submit" disabled={salvandoPerfil} className="btn" style={btnStyle(salvandoPerfil)}>
              {salvandoPerfil ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </div>

        {/* Card: Alterar senha */}
        <div style={cardStyle}>
          <h6 style={{ margin: '0 0 24px', fontWeight: '500', color: 'var(--cor-texto)', fontSize: '16px' }}>
            Alterar senha
          </h6>
          <form onSubmit={handleSalvarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label" style={labelStyle}>Nova Senha</label>
              <input
                type="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={senha.nova}
                onChange={e => setSenha(p => ({ ...p, nova: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label className="form-label" style={labelStyle}>Confirmar Nova Senha</label>
              <input
                type="password"
                className="form-control"
                placeholder="Repita a nova senha"
                value={senha.confirmar}
                onChange={e => setSenha(p => ({ ...p, confirmar: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>
            <Feedback msg={msgSenha} />
            <button type="submit" disabled={salvandoSenha} className="btn" style={btnStyle(salvandoSenha)}>
              {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </div>

      </div>
    </Layout>
  )
}