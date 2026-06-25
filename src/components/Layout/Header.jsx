// src/components/layout/Header.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { LuUser, LuLogOut, LuChevronUp, LuChevronDown } from 'react-icons/lu'
import { useAuth } from '../../context/AuthContext'

function Header({ title }) {
  const { clinica, session, signOut } = useAuth()
  const navigate = useNavigate()

  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const dropdownRef = useRef(null)

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  async function handleSair() {
    setSaindo(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  // Iniciais para o avatar: usa nome da clínica ou email como fallback
  const nomeExibido = clinica?.nome ?? session?.user?.email ?? ''
  const iniciais = nomeExibido
    .split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <div
      style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        borderBottom: '1px solid #F0F0F0',
      }}
    >
      {/* Título da página */}
      <h4
        style={{
          margin: 0,
          color: 'var(--cor-texto-secundario)',
          fontWeight: '400',
          fontSize: '24px',
        }}
      >
        {title}
      </h4>

      {/* Ações do lado direito */}
      <div className="d-flex align-items-center gap-3">

        {/* Dropdown de usuário */}
        <div className="position-relative" ref={dropdownRef}>

          {/* Trigger */}
          <button
            onClick={() => setDropdownAberto(v => !v)}
            className="d-flex align-items-center gap-2"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#718096',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                flexShrink: 0,
              }}
            >
              {iniciais}
            </div>

            {/* Nome — esconde em telas pequenas */}
            <span
              className="d-none d-sm-inline"
              style={{ color: 'var(--cor-texto)', fontSize: '14px', fontWeight: '500', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {nomeExibido}
            </span>

            {/* Chevron */}
            <span style={{ color: 'var(--cor-texto-secundario)', display: 'flex' }}>
              {dropdownAberto ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
            </span>
          </button>

          {/* Menu */}
          {dropdownAberto && (
            <div
              className="position-absolute end-0"
              style={{
                top: 'calc(100% + 8px)',
                minWidth: '180px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                border: '1px solid #F0F0F0',
                padding: '6px',
                zIndex: 1000,
              }}
            >
              {/* Minha conta */}
              <button
                onClick={() => { navigate('/perfil'); setDropdownAberto(false) }}
                className="d-flex align-items-center gap-2 w-100"
                style={{
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: 'var(--cor-texto-secundario)',
                  cursor: 'pointer',
                  marginBottom: '2px',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#F5f5f5' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'none' }}
              >
                <LuUser size={16} />
                Minha conta
              </button>

              {/* Sair */}
              <button
                onClick={handleSair}
                disabled={saindo}
                className="d-flex align-items-center gap-2 w-100"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: 'var(--cor-texto-secundario)',
                  cursor: saindo ? 'not-allowed' : 'pointer',
                  opacity: saindo ? 0.6 : 1,
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#F5f5f5' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'none' }}
              >
                <LuLogOut size={16} />
                {saindo ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header