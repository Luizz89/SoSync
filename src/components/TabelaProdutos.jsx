import { useState } from 'react'
import { AiOutlineDelete } from "react-icons/ai"
import { MdOutlineEdit } from "react-icons/md"

function TabelaProdutos({ produtos }) {
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(10)

  function calcularNivel(atual, maximo) {
    return Math.round((atual / maximo) * 100)
  }

  // Cálculo de paginação
  const indexUltimo = paginaAtual * itensPorPagina
  const indexPrimeiro = indexUltimo - itensPorPagina
  const produtosPaginados = produtos.slice(indexPrimeiro, indexUltimo)
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina)

  function mudarPagina(numeroPagina) {
    setPaginaAtual(numeroPagina)
  }

  function gerarBotoesPaginacao() {
    const botoes = []
    const maxBotoesVisiveis = 5
    let inicio = Math.max(1, paginaAtual - 2)
    let fim = Math.min(totalPaginas, inicio + maxBotoesVisiveis - 1)

    if (fim - inicio < maxBotoesVisiveis - 1) {
      inicio = Math.max(1, fim - maxBotoesVisiveis + 1)
    }

    for (let i = inicio; i <= fim; i++) {
      botoes.push(
        <button
          key={i}
          onClick={() => mudarPagina(i)}
          className="btn btn-sm"
          style={{
            minWidth: '40px',
            height: '40px',
            backgroundColor: paginaAtual === i ? 'var(--cor-primaria)' : 'transparent',
            color: paginaAtual === i ? 'white' : 'var(--cor-texto-secundario)',
            border: paginaAtual === i ? 'none' : '1px solid #E8E8E8',
            borderRadius: '8px',
            margin: '0 4px',
            fontWeight: paginaAtual === i ? '500' : '400'
          }}
        >
          {i}
        </button>
      )
    }

    return botoes
  }

  return (
    <div>
      {/* Tabela */}
      <div className="table-responsive">
        <table className="table table-hover mb-0 table-striped" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <th style={{
                padding: '16px',
                color: 'var(--cor-texto-secundario)',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none'
              }}>
                Produto
              </th>
              <th style={{
                padding: '16px',
                color: 'var(--cor-texto-secundario)',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none'
              }}>
                Quantidade
              </th>
              <th style={{
                padding: '16px',
                color: 'var(--cor-texto-secundario)',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none'
              }}>
                Nível
              </th>
              <th style={{
                padding: '16px',
                color: 'var(--cor-texto-secundario)',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none'
              }}>
                Data de Entrada
              </th>
              <th style={{
                padding: '16px',
                color: 'var(--cor-texto-secundario)',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none'
              }}>
                Validade
              </th>
              <th style={{
                padding: '16px',
                color: 'var(--cor-texto-secundario)',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none'
              }}>
                Preço
              </th>
              <th style={{
                padding: '16px',
                color: 'var(--cor-texto-secundario)',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'right'
              }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {produtosPaginados.map((produto, index) => {
              const nivel = calcularNivel(produto.qtdAtual, produto.qtdMaxima)
              return (
                <tr 
                  key={produto.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white',
                    borderBottom: '1px solid #F5F5F5'
                  }}
                >
                  <td style={{ 
                    padding: '20px 16px', 
                    color: 'var(--cor-texto)', 
                    fontSize: '14px',
                    border: 'none'
                  }}>
                    {produto.nome}
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    color: 'var(--cor-texto-secundario)', 
                    fontSize: '14px',
                    border: 'none'
                  }}>
                    {produto.qtdAtual}/{produto.qtdMaxima} {produto.unidade}
                  </td>
                  <td style={{ padding: '20px 16px', border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '100px',
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
                  <td style={{ 
                    padding: '20px 16px', 
                    color: 'var(--cor-texto-secundario)', 
                    fontSize: '14px',
                    border: 'none'
                  }}>
                    {produto.dataEntrada || '30/01/2025'}
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    color: 'var(--cor-texto-secundario)', 
                    fontSize: '14px',
                    border: 'none'
                  }}>
                    {produto.validade || '30/01/2026'}
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    color: 'var(--cor-texto)', 
                    fontSize: '14px',
                    border: 'none'
                  }}>
                    R${produto.preco ? produto.preco.toFixed(2) : '800,00'}
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    textAlign: 'right',
                    border: 'none'
                  }}>
                    <button 
                      className="btn btn-sm"
                      style={{
                        width: '36px',
                        height: '36px',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E8E8E8',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: 'var(--cor-texto-secundario)',
                        marginRight: '8px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <MdOutlineEdit size={18} />
                    </button>
                    <button 
                      className="btn btn-sm"
                      style={{
                        width: '36px',
                        height: '36px',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E8E8E8',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: 'var(--cor-texto-secundario)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFE5E5'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <AiOutlineDelete size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="d-flex justify-content-between align-items-center" style={{ marginTop: '24px' }}>
        {/* Seletor de itens por página */}
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '14px', color: 'var(--cor-texto-secundario)' }}>
            Linhas por página
          </span>
          <select 
            className="form-select form-select-sm"
            value={itensPorPagina}
            onChange={(e) => {
              setItensPorPagina(Number(e.target.value))
              setPaginaAtual(1)
            }}
            style={{
              width: '80px',
              border: '1px solid #E8E8E8',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Botões de navegação */}
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => mudarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="btn btn-sm"
            style={{
              padding: '8px 16px',
              border: '1px solid #E8E8E8',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: 'var(--cor-texto-secundario)',
              fontSize: '14px'
            }}
          >
            ‹ Anterior
          </button>

          {gerarBotoesPaginacao()}

          {totalPaginas > 5 && paginaAtual < totalPaginas - 2 && (
            <>
              <span style={{ color: 'var(--cor-texto-secundario)', margin: '0 8px' }}>...</span>
              <button
                onClick={() => mudarPagina(totalPaginas)}
                className="btn btn-sm"
                style={{
                  minWidth: '40px',
                  height: '40px',
                  backgroundColor: 'transparent',
                  color: 'var(--cor-texto-secundario)',
                  border: '1px solid #E8E8E8',
                  borderRadius: '8px',
                  margin: '0 4px'
                }}
              >
                {totalPaginas}
              </button>
            </>
          )}

          <button
            onClick={() => mudarPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className="btn btn-sm"
            style={{
              padding: '8px 16px',
              border: '1px solid #E8E8E8',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: 'var(--cor-texto-secundario)',
              fontSize: '14px'
            }}
          >
            Próximo ›
          </button>
        </div>

        {/* Contador de registros */}
        <div style={{ fontSize: '14px', color: 'var(--cor-texto-secundario)' }}>
          Exibindo {indexPrimeiro + 1}-{Math.min(indexUltimo, produtos.length)} de {produtos.length} Registros
        </div>
      </div>
    </div>
  )
}

export default TabelaProdutos