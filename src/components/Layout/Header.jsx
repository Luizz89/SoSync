import { IoMdSettings, IoMdNotificationsOutline } from 'react-icons/io'

function Header({ title }) {
  return (
    <div 
      style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        borderBottom: '1px solid #F0F0F0'
      }}
    >
      <h4 style={{ 
        margin: 0, 
        color: 'var(--cor-texto-secundario)', 
        fontWeight: '400',
        fontSize: '24px'
      }}>
        {title}
      </h4>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Configurações */}
        <button 
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--cor-texto-secundario)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IoMdSettings size={24} />
        </button>

        {/* Notificações */}
        <button 
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--cor-texto-secundario)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IoMdNotificationsOutline size={24} />
        </button>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--cor-texto)', fontSize: '14px', fontWeight: '500' }}>
            ADMIN_USER
          </span>
          <div 
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: '#718096',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            AU
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header