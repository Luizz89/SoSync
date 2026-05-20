function StatCard({ title, value, icon, bgColor, iconColor }) {
  return (
    <div 
      style={{
        backgroundColor: bgColor,
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
        <div style={{ color: iconColor, fontSize: '40px' }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatCard