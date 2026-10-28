function TabelaEstoque({ produtos }) {
  // Nível = quantidade atual em relação ao estoque mínimo (mesma regra do Dashboard).
  // Protegido contra valores vazios/zero para nunca gerar NaN e limitado entre 0 e 100.
  function calcularNivel(atual, referencia) {
    const a = Number(atual)
    const r = Number(referencia)
    if (!Number.isFinite(a) || !Number.isFinite(r) || r <= 0) return 0
    return Math.min(100, Math.max(0, Math.round((a / r) * 100)))
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
            const nivel = calcularNivel(produto.quantidade, produto.quantidade_minima)
            return (
              <tr key={produto.id} style={{ borderBottom: '1px solid #F8F8F8' }}>
                <td style={{ padding: '16px 0', color: 'var(--cor-texto)', fontSize: '14px' }}>
                  {produto.nome}
                </td>
                <td style={{ padding: '16px 0', color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>
                  {produto.quantidade} {produto.unidade}
                  <span style={{ fontSize: '12px', marginLeft: '6px', opacity: 0.7 }}>(mín. {produto.quantidade_minima})</span>
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
                        background: 'var(--cor-primaria)',
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