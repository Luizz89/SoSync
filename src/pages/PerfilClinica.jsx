// src/pages/PerfilClinica.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import Layout from '../components/Layout/Layout'

// ── Feedback ──────────────────────────────────────────────────────────────────
// Inline alert placed directly below the relevant form action.
// Uses role="alert" so screen readers announce status changes automatically.
function Feedback({ msg }) {
  if (!msg) return null
  const ok = msg.tipo === 'sucesso'
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        lineHeight: '1.45',
        backgroundColor: ok ? '#F0FDF4' : '#FEF2F2',
        color: ok ? '#15803D' : '#DC2626',
        border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`,
      }}
    >
      <span style={{ fontWeight: '700', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>
        {ok ? '✓' : '!'}
      </span>
      <span>{msg.texto}</span>
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
// Bootstrap grid column wrapper that co-locates label, input, and hint.
// `colClass` maps directly to Bootstrap column classes for responsive sizing.
function Field({ label, hint, htmlFor, colClass = 'col-12', children }) {
  return (
    <div className={colClass}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: 'var(--cor-texto)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ marginTop: '5px', fontSize: '12px', color: 'var(--cor-texto-secundario)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

// ── SectionCard ───────────────────────────────────────────────────────────────
// Self-contained card: header (eyebrow + title + description) + form + save button.
// Each section has its own submit handler and loading/saving state so that saving
// one section never blocks the others and errors are scoped to the right context.
function SectionCard({
  id, eyebrow, title, description,
  onSubmit, saving, btnLabel, btnLoadingLabel,
  children,
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: '80px', // clears any sticky header when using anchor links
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E9ECEF',
        padding: '28px 28px 24px',
        marginBottom: '20px',
      }}
    >
      {/* ── Section header ── */}
      <div
        style={{
          marginBottom: '22px',
          paddingBottom: '18px',
          borderBottom: '1px solid #F1F3F5',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--cor-primaria)',
            marginBottom: '4px',
          }}
        >
          {eyebrow}
        </span>
        <h2
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--cor-texto)',
            margin: '0 0 4px',
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--cor-texto-secundario)', margin: 0 }}>
          {description}
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={onSubmit} noValidate>
        <div className="row g-3">
          {children}

          {/* Save button always at bottom of the row */}
          <div className="col-12" style={{ marginTop: '4px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '500',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--cor-primaria)',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.65 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {saving && (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
              {saving ? btnLoadingLabel : btnLabel}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}

// ── NavLink ───────────────────────────────────────────────────────────────────
// Sidebar anchor that smooth-scrolls to its target section.
function NavLink({ href, label }) {
  function handleClick(e) {
    e.preventDefault()
    document
      .getElementById(href.replace('#', ''))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      style={{
        display: 'block',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'var(--cor-texto-secundario)',
        textDecoration: 'none',
        marginBottom: '2px',
        transition: 'background-color 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#F8F9FA'
        e.currentTarget.style.color = 'var(--cor-texto)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = 'var(--cor-texto-secundario)'
      }}
    >
      {label}
    </a>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PerfilClinica() {
  const { session, refreshPerfil } = useAuth()

  // ─── Local data (always fetched fresh — never stale from context) ──────────
  const [usuarioLocal, setUsuarioLocal] = useState(null)
  const [carregando,   setCarregando]   = useState(true)

  // ─── Account fields (usuarios) ────────────────────────────────────────────
  const [nome, setNome] = useState('')

  // ─── Clinic fields (clinicas) ─────────────────────────────────────────────
  const [nomeClinica, setNomeClinica] = useState('')
  const [telefone,    setTelefone]    = useState('')
  const [cep,        setCep]        = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero,     setNumero]     = useState('')
  const [bairro,     setBairro]     = useState('')
  const [cidade,     setCidade]     = useState('')
  const [estado,     setEstado]     = useState('')

  // ─── Security fields ──────────────────────────────────────────────────────
  const [senhaAtual,     setSenhaAtual]     = useState('')
  const [novaSenha,      setNovaSenha]      = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  // ─── Section-scoped loading states ────────────────────────────────────────
  const [salvandoConta,   setSalvandoConta]   = useState(false)
  const [salvandoClinica, setSalvandoClinica] = useState(false)
  const [salvandoSenha,   setSalvandoSenha]   = useState(false)

  // ─── Section-scoped feedback messages ─────────────────────────────────────
  const [msgConta,   setMsgConta]   = useState(null)
  const [msgClinica, setMsgClinica] = useState(null)
  const [msgSenha,   setMsgSenha]   = useState(null)

  useEffect(() => {
  if (!session?.user?.id) return

  async function carregar() {
    setCarregando(true)

    const { data: c, error } = await supabase
      .from('clinicas')
      .select('id, nome, telefone, cep, logradouro, numero, bairro, cidade, estado')
      .eq('id', session.user.id)
      .single()

    if (error || !c) {
      console.error('Erro ao buscar clínica:', error?.message)
      setCarregando(false)
      return
    }

    setNomeClinica(c.nome      ?? '')
    setTelefone(c.telefone     ?? '')
    setCep(c.cep               ?? '')
    setLogradouro(c.logradouro ?? '')
    setNumero(c.numero         ?? '')
    setBairro(c.bairro         ?? '')
    setCidade(c.cidade         ?? '')
    setEstado(c.estado         ?? '')

    setCarregando(false)
  }

  carregar()
  }, [session?.user?.id])

  // ─── Handler: save account (usuarios.nome) ────────────────────────────────
  async function handleSalvarConta(e) {
    e.preventDefault()
    const nomeTrimmed = nome.trim()

    if (!nomeTrimmed) {
      setMsgConta({ tipo: 'erro', texto: 'O nome não pode ficar em branco.' })
      return
    }

    setMsgConta(null)
    setSalvandoConta(true)

    const { error } = await supabase
      .from('usuarios')
      .update({ nome: nomeTrimmed })
      .eq('id', session.user.id)

    setSalvandoConta(false)

    if (error) {
      setMsgConta({ tipo: 'erro', texto: 'Não foi possível salvar. Tente novamente.' })
      return
    }

    setUsuarioLocal(prev => ({ ...prev, nome: nomeTrimmed }))
    refreshPerfil(session.user.id) // sync sidebar / header that displays user name
    setMsgConta({ tipo: 'sucesso', texto: 'Nome atualizado com sucesso.' })
  }

  async function handleSalvarClinica(e) {
  e.preventDefault()

  const nomeTrimmed = nomeClinica.trim()
  if (!nomeTrimmed) {
    setMsgClinica({ tipo: 'erro', texto: 'O nome da clínica não pode ficar em branco.' })
    return
  }

  setMsgClinica(null)
  setSalvandoClinica(true)

  const { error } = await supabase
    .from('clinicas')
    .update({
      nome:       nomeTrimmed,
      telefone:   telefone.trim(),
      cep:        cep.trim(),
      logradouro: logradouro.trim(),
      numero:     numero.trim(),
      bairro:     bairro.trim(),
      cidade:     cidade.trim(),
      estado:     estado.trim(),
    })
    .eq('id', session.user.id)   // session.user.id === clinicas.id

  setSalvandoClinica(false)

  if (error) {
    setMsgClinica({ tipo: 'erro', texto: 'Não foi possível salvar. Tente novamente.' })
    return
  }

  refreshPerfil(session.user.id)
  setMsgClinica({ tipo: 'sucesso', texto: 'Dados da clínica atualizados com sucesso.' })
  }

  // ─── Handler: change password (re-auth → updateUser) ──────────────────────
  // Re-authenticating with signInWithPassword verifies the current password on
  // the client without requiring extra DB columns or server functions.
  async function handleSalvarSenha(e) {
    e.preventDefault()
    setMsgSenha(null)

    if (!senhaAtual) {
      setMsgSenha({ tipo: 'erro', texto: 'Digite sua senha atual.' })
      return
    }
    if (novaSenha.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ter no mínimo 6 caracteres.' })
      return
    }
    if (novaSenha !== confirmarSenha) {
      setMsgSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' })
      return
    }

    setSalvandoSenha(true)

    // Step 1: verify current password
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: senhaAtual,
    })

    if (reauthError) {
      setSalvandoSenha(false)
      setMsgSenha({ tipo: 'erro', texto: 'Senha atual incorreta.' })
      return
    }

    // Step 2: update to new password
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvandoSenha(false)

    if (error) {
      setMsgSenha({ tipo: 'erro', texto: 'Não foi possível alterar a senha. Tente novamente.' })
      return
    }

    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarSenha('')
    setMsgSenha({ tipo: 'sucesso', texto: 'Senha alterada com sucesso.' })
  }

  // ─── Shared input style tokens ─────────────────────────────────────────────
  const inBase     = { borderRadius: '8px', fontSize: '14px' }
  const inDisabled = { ...inBase, backgroundColor: '#F8F9FA', color: '#868E96' }

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <Layout headerTitle="Meu Perfil">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="spinner-border" role="status" style={{ color: 'var(--cor-primaria)' }}>
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Layout>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout headerTitle="Meu Perfil">
      <div style={{ maxWidth: '840px' }}>
        <div className="row">

          {/* ── Left nav — desktop only ──────────────────────────────────── */}
          <div
            className="d-none d-md-block col-md-3 col-lg-2"
            style={{ paddingRight: '0' }}
          >
            <nav style={{ position: 'sticky', top: '24px', paddingRight: '16px' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--cor-texto-secundario)',
                  marginBottom: '8px',
                  paddingLeft: '12px',
                }}
              >
                Perfil
              </p>
              <NavLink href="#conta"     label="Conta"      />
              <NavLink href="#clinica"   label="Clínica"    />
              <NavLink href="#seguranca" label="Segurança"  />
            </nav>
          </div>

          {/* ── Content ──────────────────────────────────────────────────── */}
          <div className="col-12 col-md-9 col-lg-10">

            {/* ── 1. Account ─────────────────────────────────────────── */}
            <SectionCard
              id="conta"
              eyebrow="Pessoal"
              title="Dados da Conta"
              description="Seu nome de exibição e o email usado para acessar o sistema."
              onSubmit={handleSalvarConta}
              saving={salvandoConta}
              btnLabel="Salvar alterações"
              btnLoadingLabel="Salvando..."
            >
              <Field label="Nome Completo" htmlFor="input-nome">
                <input
                  id="input-nome"
                  type="text"
                  className="form-control"
                  value={nome}
                  onChange={e => { setNome(e.target.value); setMsgConta(null) }}
                  required
                  style={inBase}
                />
              </Field>

              <Field
                label="Email"
                htmlFor="input-email"
                hint="O email de acesso não pode ser alterado."
              >
                <input
                  id="input-email"
                  type="email"
                  className="form-control"
                  value={session?.user?.email ?? ''}
                  disabled
                  style={inDisabled}
                />
              </Field>

              {msgConta && (
                <div className="col-12">
                  <Feedback msg={msgConta} />
                </div>
              )}
            </SectionCard>

            {/* ── 2. Clinic ──────────────────────────────────────────── */}
            <SectionCard
              id="clinica"
              eyebrow="Organização"
              title="Dados da Clínica"
              description="Nome e contato da sua clínica cadastrada no sistema."
              onSubmit={handleSalvarClinica}
              saving={salvandoClinica}
              btnLabel="Salvar alterações"
              btnLoadingLabel="Salvando..."
            >
              <Field label="Nome da Clínica" htmlFor="input-nome-clinica">
                <input
                  id="input-nome-clinica"
                  type="text"
                  className="form-control"
                  value={nomeClinica}
                  onChange={e => { setNomeClinica(e.target.value); setMsgClinica(null) }}
                  required
                  style={inBase}
                />
              </Field>

              <Field
                label="Telefone"
                htmlFor="input-telefone"
                colClass="col-12 col-sm-7 col-lg-6"
              >
                <input
                  id="input-telefone"
                  type="tel"
                  className="form-control"
                  value={telefone}
                  onChange={e => { setTelefone(e.target.value); setMsgClinica(null) }}
                  placeholder="(00) 00000-0000"
                  style={inBase}
                />
              </Field>

              {/* ── Endereço ── */}
              <Field label="CEP" htmlFor="input-cep" colClass="col-12 col-sm-4 col-lg-3">
                <input
                  id="input-cep"
                  type="text"
                  className="form-control"
                  value={cep}
                  onChange={e => { setCep(e.target.value); setMsgClinica(null) }}
                  placeholder="00000-000"
                  maxLength={9}
                  style={inBase}
                />
              </Field>

              <Field label="Logradouro" htmlFor="input-logradouro" colClass="col-12 col-sm-8 col-lg-6">
                <input
                  id="input-logradouro"
                  type="text"
                  className="form-control"
                  value={logradouro}
                  onChange={e => { setLogradouro(e.target.value); setMsgClinica(null) }}
                  placeholder="Rua, Avenida..."
                  style={inBase}
                />
              </Field>

              <Field label="Número" htmlFor="input-numero" colClass="col-6 col-sm-3 col-lg-2">
                <input
                  id="input-numero"
                  type="text"
                  className="form-control"
                  value={numero}
                  onChange={e => { setNumero(e.target.value); setMsgClinica(null) }}
                  placeholder="Nº"
                  style={inBase}
                />
              </Field>

              <Field label="Bairro" htmlFor="input-bairro" colClass="col-6 col-sm-5 col-lg-4">
                <input
                  id="input-bairro"
                  type="text"
                  className="form-control"
                  value={bairro}
                  onChange={e => { setBairro(e.target.value); setMsgClinica(null) }}
                  style={inBase}
                />
              </Field>

              <Field label="Cidade" htmlFor="input-cidade" colClass="col-12 col-sm-6">
                <input
                  id="input-cidade"
                  type="text"
                  className="form-control"
                  value={cidade}
                  onChange={e => { setCidade(e.target.value); setMsgClinica(null) }}
                  style={inBase}
                />
              </Field>

              <Field label="Estado (UF)" htmlFor="input-estado" colClass="col-12 col-sm-6 col-lg-3">
                <input
                  id="input-estado"
                  type="text"
                  className="form-control"
                  value={estado}
                  onChange={e => { setEstado(e.target.value.toUpperCase()); setMsgClinica(null) }}
                  placeholder="PE"
                  maxLength={2}
                  style={inBase}
                />
              </Field>

              {msgClinica && (
                <div className="col-12">
                  <Feedback msg={msgClinica} />
                </div>
              )}
            </SectionCard>

            {/* ── 3. Security ────────────────────────────────────────── */}
            <SectionCard
              id="seguranca"
              eyebrow="Acesso"
              title="Alterar Senha"
              description="Use uma senha forte e diferente das que já usou antes."
              onSubmit={handleSalvarSenha}
              saving={salvandoSenha}
              btnLabel="Alterar senha"
              btnLoadingLabel="Alterando..."
            >
              <Field label="Senha Atual" htmlFor="input-senha-atual">
                <input
                  id="input-senha-atual"
                  type="password"
                  className="form-control"
                  value={senhaAtual}
                  onChange={e => { setSenhaAtual(e.target.value); setMsgSenha(null) }}
                  placeholder="Digite sua senha atual"
                  autoComplete="current-password"
                  required
                  style={inBase}
                />
              </Field>

              {/* New + confirm on same row from sm breakpoint up */}
              <Field
                label="Nova Senha"
                htmlFor="input-nova-senha"
                hint="Mínimo de 6 caracteres."
                colClass="col-12 col-sm-6"
              >
                <input
                  id="input-nova-senha"
                  type="password"
                  className="form-control"
                  value={novaSenha}
                  onChange={e => { setNovaSenha(e.target.value); setMsgSenha(null) }}
                  placeholder="Nova senha"
                  autoComplete="new-password"
                  required
                  style={inBase}
                />
              </Field>

              <Field
                label="Confirmar Nova Senha"
                htmlFor="input-confirmar-senha"
                colClass="col-12 col-sm-6"
              >
                <input
                  id="input-confirmar-senha"
                  type="password"
                  className="form-control"
                  value={confirmarSenha}
                  onChange={e => { setConfirmarSenha(e.target.value); setMsgSenha(null) }}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                  style={inBase}
                />
              </Field>

              {msgSenha && (
                <div className="col-12">
                  <Feedback msg={msgSenha} />
                </div>
              )}
            </SectionCard>

          </div>
        </div>
      </div>
    </Layout>
  )
}