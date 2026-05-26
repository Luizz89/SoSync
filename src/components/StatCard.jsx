function StatCard({ title, value, icon, bgColor, iconColor }) {
  return (
    <div 
      style={{
        backgroundColor: 'var(--cor-fundo-cinza)',
        borderRadius: '20px',
        padding: '32px',
        height: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ 
            margin: '0 0 8px 0', 
            color: 'var(--cor-texto-secundario)', 
            fontSize: '16px',
            fontWeight: '400'
          }}>
            {title}
          </p>
          <h1 style={{ 
            margin: 0, 
            fontSize: '56px', 
            fontWeight: '700',
            color: 'var(--cor-texto)'
          }}>
            {value}
          </h1>
        </div>
        <div style={{ 
          backgroundColor: bgColor,
          color: iconColor, 
          fontSize: '40px',
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '0.6rem'
          }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatCard