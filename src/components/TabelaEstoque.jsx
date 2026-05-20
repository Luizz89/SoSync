function TabelaEstoque({ produtos }) {
  function calcularNivel(atual, maximo) {
    return Math.round((atual / maximo) * 100)
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <h5 style={{ 
        margin: '0 0 24px 0', 
        color: 'var(--cor-texto)', 
        fontWeight: '400',
        fontSize: '20px'
      }}>
        Estoque
      </h5>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
            <th style={{
              textAlign: 'left',
              padding: '12px 0',
              color: 'var(--cor-texto-secundario)',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Produto
            </th>
            <th style={{
              textAlign: 'left',
              padding: '12px 0',
              color: 'var(--cor-texto-secundario)',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Quantidade
            </th>
            <th style={{
              textAlign: 'left',
              padding: '12px 0',
              color: 'var(--cor-texto-secundario)',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Nível
            </th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => {
            const nivel = calcularNivel(produto.quantidadeAtual, produto.quantidadeMaxima)
            return (
              <tr key={produto.id} style={{ borderBottom: '1px solid #F8F8F8' }}>
                <td style={{ padding: '16px 0', color: 'var(--cor-texto)', fontSize: '14px' }}>
                  {produto.nome}
                </td>
                <td style={{ padding: '16px 0', color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>
                  {produto.quantidadeAtual}/{produto.quantidadeMaxima} {produto.unidade}
                </td>
                <td style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '180px',
                      height: '8px',
                      backgroundColor: '#E8E8E8',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${nivel}%`,
                        height: '100%',
                        background: nivel >= 50 ? '#00D9C0' : nivel >= 20 ? '#2D3748' : '#2D3748',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ 
                      color: 'var(--cor-texto-secundario)', 
                      fontSize: '14px',
                      minWidth: '40px'
                    }}>
                      {nivel}%
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TabelaEstoque