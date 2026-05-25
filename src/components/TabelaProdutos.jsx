import { useState } from 'react'
import { AiOutlineDelete } from "react-icons/ai"
import { MdOutlineEdit } from "react-icons/md"
import ModalEditarProduto from './ModalEditarProduto'
import ModalConfirmarExclusao from './ModalConfirmarExclusao'

function TabelaProdutos({ produtos , onDeletar }) {
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(10)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null)
  const [busca, setBusca] = useState('')


  function calcularNivel(atual, maximo) {
    return Math.round((atual / maximo) * 100)
  }


  const produtosFiltrados = produtos.filter(p =>
  p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .includes(busca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
)


  // Cálculo de paginação
  const indexUltimo = paginaAtual * itensPorPagina
  const indexPrimeiro = indexUltimo - itensPorPagina
  const produtosPaginados = produtosFiltrados.slice(indexPrimeiro, indexUltimo)
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina)

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
      {/* Barra de busca */}
<div style={{ marginBottom: '20px', position: 'relative' }}>
  <span style={{
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--cor-texto-secundario)', fontSize: '16px'
  }}>

  </span>
  <input
    type="text"
    placeholder="Pesquisar produto..."
    value={busca}
    onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1) }}
    style={{
      width: '100%', padding: '12px 12px 12px 12px',
      borderRadius: '12px', border: '1px solid #E8E8E8',
      fontSize: '14px', outline: 'none',
      color: 'var(--cor-texto)'
    }}
    onFocus={(e) => e.target.style.border = '1px solid var(--cor-primaria)'}
    onBlur={(e) => e.target.style.border = '1px solid #E8E8E8'}
  />
  {busca && (
    <button
      onClick={() => { setBusca(''); setPaginaAtual(1) }}
      style={{
        position: 'absolute', right: '14px', top: '50%',
        transform: 'translateY(-50%)', background: 'none',
        border: 'none', cursor: 'pointer', fontSize: '16px',
        color: 'var(--cor-texto-secundario)'
      }}
    >
      ✕
    </button>
  )}
</div>
      {/* Tabela */}
      <div className="table-responsive">
        <table className="table table-striped" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
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
                    border: 'none',
                  }}>
                    {produto.validade || '—'}
                    {produto.validade && (() => {
                      const [dia, mes, ano] = produto.validade.split('/')
                      const dataValidade = new Date(`${ano}-${mes}-${dia}`)
                      const hoje = new Date()
                      hoje.setHours(0, 0, 0, 0)
                      const vencido = dataValidade < hoje
                      const diasRestantes = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24))

                      return (
                        <div style={{
                          marginTop: '4px',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: vencido ? '#FF6B6B' : diasRestantes <= 30 ? '#FFD93D' : '#00D9C0',
                          backgroundColor: vencido ? '#FFE5E5' : diasRestantes <= 30 ? '#FFF8E1' : '#E5FBF8',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          display: 'grid',
                          width: 'fit-content'
                        }}>
                          {vencido 
                            ? `Vencido há ${Math.abs(diasRestantes)} dia(s)` 
                            : diasRestantes === 0 
                              ? 'Vence hoje!' 
                              : diasRestantes <= 30 
                                ? `Vence em ${diasRestantes} dia(s)`
                                : 'Dentro da validade'}
                        </div>
                      )
                    })()}
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

                    {/*botao editar*/}
                    <button
                      className="btn btn-sm"
                      onClick={() => { setProdutoSelecionado(produto); setModalEditarAberto(true) }}
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

                    {/*botao deletar*/}
                    <button 
                    onClick={() => { setProdutoParaExcluir(produto); setModalExcluirAberto(true) }}
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
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffbbbb'}
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
          Exibindo {indexPrimeiro + 1}-{Math.min(indexUltimo, produtosFiltrados.length)} de {produtosFiltrados.length} Registros
        </div>
      </div>
      <ModalEditarProduto
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        produto={produtoSelecionado}
        fornecedorId="FxJRkTuDGTn9bfZm3Nwi"
      />
      <ModalConfirmarExclusao
        isOpen={modalExcluirAberto}
        nomeProduto={produtoParaExcluir?.nome}
        onCancelar={() => { setModalExcluirAberto(false); setProdutoParaExcluir(null) }}
        onConfirmar={() => {
          onDeletar(produtoParaExcluir.id)
          setModalExcluirAberto(false)
          setProdutoParaExcluir(null)
        }}
      />
    </div>
  )
}

export default TabelaProdutos