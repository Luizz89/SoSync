function AlertasCriticos({ produtos }) {
  // Filtra produtos críticos (< 20%) e em atenção (20-50%)
  const produtosCriticos = produtos.filter(produto => {
    const nivel = (produto.qtdAtual / produto.qtdMaxima)
    return nivel < 0.5 // Mostra produtos abaixo de 50%
  }).map(produto => {
    const nivel = (produto.qtdAtual / produto.qtdMaxima)
    return {
      id: produto.id,
      produto: produto.nome,
      nivel: nivel < 0.2 ? 'Crítico' : 'Atenção',
      nivelPercentual: Math.round(nivel * 100)
    }
  }).sort((a, b) => {
    // Ordena: críticos primeiro, depois por nível percentual (menor primeiro)
    if (a.nivel === 'Crítico' && b.nivel !== 'Crítico') return -1
    if (a.nivel !== 'Crítico' && b.nivel === 'Crítico') return 1
    return a.nivelPercentual - b.nivelPercentual
  })

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      height: '100%'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <h5 style={{ 
          margin: 0, 
          color: 'var(--cor-texto)', 
          fontWeight: '400', 
          fontSize: '18px' 
        }}>
          Alertas Críticos
        </h5>
        <button style={{
          background: 'white',
          border: '1px solid #E8E8E8',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '13px',
          color: 'var(--cor-texto)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Reabastecer
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {produtosCriticos.length === 0 ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            color: 'var(--cor-texto-secundario)',
            fontSize: '14px'
          }}>
            <p style={{ margin: 0 }}>🎉 Nenhum alerta crítico!</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
              Todos os produtos estão com estoque adequado.
            </p>
          </div>
        ) : (
          produtosCriticos.map((alerta) => (
            <div 
              key={alerta.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#FAFAFA',
                borderRadius: '12px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
            >
              <div style={{ flex: 1 }}>
                <span style={{ 
                  color: 'var(--cor-texto)', 
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  {alerta.produto}
                </span>
                <span style={{ 
                  color: 'var(--cor-texto-secundario)', 
                  fontSize: '12px'
                }}>
                  Estoque: {alerta.nivelPercentual}%
                </span>
              </div>
              <span style={{
                backgroundColor: alerta.nivel === 'Crítico' ? '#FFE5E5' : '#FFF9E6',
                color: alerta.nivel === 'Crítico' ? '#FF6B6B' : '#FFD93D',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                marginLeft: '12px'
              }}>
                {alerta.nivel}
              </span>
            </div>
          ))
        )}
      </div>

      {produtosCriticos.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#F5F5F5',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--cor-texto-secundario)',
          textAlign: 'center'
        }}>
          {produtosCriticos.filter(a => a.nivel === 'Crítico').length} crítico(s) • {' '}
          {produtosCriticos.filter(a => a.nivel === 'Atenção').length} em atenção
        </div>
      )}
    </div>
  )
}

export default AlertasCriticos