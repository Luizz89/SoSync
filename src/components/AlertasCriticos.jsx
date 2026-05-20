function AlertasCriticos() {
  const alertas = [
    { id: 1, produto: 'Luvas Látex Descartáveis', nivel: 'Crítico' },
    { id: 2, produto: 'Luvas Látex Descartáveis', nivel: 'Crítico' },
    { id: 3, produto: 'Luvas Látex Descartáveis', nivel: 'Crítico' },
    { id: 4, produto: 'Luvas Látex Descartáveis', nivel: 'Atenção' },
    { id: 5, produto: 'Luvas Látex Descartáveis', nivel: 'Atenção' },
  ]

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h5 style={{ margin: 0, color: 'var(--cor-texto)', fontWeight: '400', fontSize: '18px' }}>
          Alertas Críticos
        </h5>
        <button style={{
          background: 'white',
          border: '1px solid #E8E8E8',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '13px',
          color: 'var(--cor-texto)',
          cursor: 'pointer'
        }}>
          Reabastecer
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alertas.map((alerta) => (
          <div 
            key={alerta.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#FAFAFA',
              borderRadius: '12px'
            }}
          >
            <span style={{ color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>
              {alerta.produto}
            </span>
            <span style={{
              backgroundColor: alerta.nivel === 'Crítico' ? '#FFE5E5' : '#FFF9E6',
              color: alerta.nivel === 'Crítico' ? '#FF6B6B' : '#FFD93D',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {alerta.nivel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AlertasCriticos