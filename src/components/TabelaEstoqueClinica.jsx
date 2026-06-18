import { useState } from 'react'
import { AiOutlineDelete } from "react-icons/ai"
import { MdOutlineEdit } from "react-icons/md"
import { MdOutlineAddCircleOutline, MdOutlineRemoveCircleOutline } from "react-icons/md"
import ModalConfirmarExclusao from './ModalConfirmarExclusao'
import ModalEditarProdutoClinica from './ModalEditarProdutoClinica'
import ModalMovimentacao from './ModalMovimentacao'

function TabelaEstoqueClinica({ produtos, onDeletar, onAtualizar, clinicaId }) {
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(10)
  const [busca, setBusca] = useState('')
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [modalMovimentacaoAberto, setModalMovimentacaoAberto] = useState(false)
  const [tipoMovimentacao, setTipoMovimentacao] = useState(null)

  function normalizarTexto(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  }

  const produtosFiltrados = produtos.filter(p =>
    normalizarTexto(p.nome).includes(normalizarTexto(busca))
  )

  const indexUltimo = paginaAtual * itensPorPagina
  const indexPrimeiro = indexUltimo - itensPorPagina
  const produtosPaginados = produtosFiltrados.slice(indexPrimeiro, indexUltimo)
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina)

  function getStatusValidade(validade) {
    if (!validade) return null
    const dataValidade = new Date(validade)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const diasRestantes = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24))
    const vencido = dataValidade < hoje

    return {
      texto: vencido ? `Vencido há ${Math.abs(diasRestantes)} dia(s)` : diasRestantes === 0 ? 'Vence hoje!' : diasRestantes <= 30 ? `Vence em ${diasRestantes} dia(s)` : 'Dentro da validade',
      cor: vencido ? '#FF6B6B' : diasRestantes <= 30 ? '#FFB800' : '#00D9C0',
      bg: vencido ? '#FFE5E5' : diasRestantes <= 30 ? '#FFF9E6' : '#E5FBF8'
    }
  }

  function getStatusQuantidade(quantidade, quantidadeMinima) {
    if (quantidade < quantidadeMinima * 0.5) return { texto: 'Crítico', cor: '#FF6B6B', bg: '#FFE5E5' }
    if (quantidade < quantidadeMinima) return { texto: 'Atenção', cor: '#FFB800', bg: '#FFF9E6' }
    return { texto: 'Normal', cor: '#00D9C0', bg: '#E5FBF8' }
  }

  return (
    <div>
      {/* Barra de busca */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Pesquisar produto..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1) }}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E8E8E8', fontSize: '14px', outline: 'none', color: 'var(--cor-texto)' }}
          onFocus={(e) => e.target.style.border = '1px solid var(--cor-primaria)'}
          onBlur={(e) => e.target.style.border = '1px solid #E8E8E8'}
        />
        {busca && (
          <button onClick={() => { setBusca(''); setPaginaAtual(1) }} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--cor-texto-secundario)' }}>✕</button>
        )}
      </div>

      {/* Tabela */}
      <div className="table-responsive">
        <table className="table table-striped" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['Produto', 'Quantidade', 'Status', 'Validade', 'Preço', 'Movimentação', 'Ações'].map(col => (
                <th key={col} style={{ padding: '16px', color: 'var(--cor-texto-secundario)', fontWeight: '500', fontSize: '14px', backgroundColor: 'transparent', border: 'none', textAlign: col === 'Ações' || col === 'Movimentação' ? 'center' : 'left' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produtosPaginados.map((produto, index) => {
              const statusQtd = getStatusQuantidade(produto.quantidade, produto.quantidade_minima)
              const statusVal = getStatusValidade(produto.validade)
              return (
                <tr key={produto.id} style={{ backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white', borderBottom: '1px solid #F5F5F5' }}>
                  <td style={{ padding: '20px 16px', color: 'var(--cor-texto)', fontSize: '14px', border: 'none' }}>
                    {produto.nome}
                  </td>
                  <td style={{ padding: '20px 16px', color: 'var(--cor-texto-secundario)', fontSize: '14px', border: 'none' }}>
                    {produto.quantidade} {produto.unidade}
                  </td>
                  <td style={{ padding: '20px 16px', border: 'none' }}>
                    <span style={{ backgroundColor: statusQtd.bg, color: statusQtd.cor, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                      {statusQtd.texto}
                    </span>
                  </td>
                  <td style={{ padding: '20px 16px', color: 'var(--cor-texto-secundario)', fontSize: '14px', border: 'none' }}>
                    {produto.validade ? new Date(produto.validade).toLocaleDateString('pt-BR') : '—'}
                    {statusVal && (
                      <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: '500', color: statusVal.cor, backgroundColor: statusVal.bg, borderRadius: '6px', padding: '2px 8px', display: 'inline-block', marginLeft: '8px' }}>
                        {statusVal.texto}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '20px 16px', color: 'var(--cor-texto)', fontSize: '14px', border: 'none' }}>
                    {produto.preco ? `R$ ${produto.preco.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '20px 16px', border: 'none', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {/* Botão Entrada */}
                      <button
                        onClick={() => { setProdutoSelecionado(produto); setTipoMovimentacao('entrada'); setModalMovimentacaoAberto(true) }}
                        className="btn btn-sm"
                        title="Entrada"
                        style={{ width: '36px', height: '36px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E8E8', borderRadius: '8px', backgroundColor: 'white', color: '#00D9C0' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5FBF8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <MdOutlineAddCircleOutline size={18} />
                      </button>
                      {/* Botão Saída */}
                      <button
                        onClick={() => { setProdutoSelecionado(produto); setTipoMovimentacao('saida'); setModalMovimentacaoAberto(true) }}
                        className="btn btn-sm"
                        title="Saída"
                        style={{ width: '36px', height: '36px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E8E8', borderRadius: '8px', backgroundColor: 'white', color: '#FF6B6B' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFE5E5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <MdOutlineRemoveCircleOutline size={18} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px', textAlign: 'right', border: 'none' }}>
                    <button
                      onClick={() => { setProdutoSelecionado(produto); setModalEditarAberto(true) }}
                      className="btn btn-sm"
                      style={{ width: '36px', height: '36px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E8E8', borderRadius: '8px', backgroundColor: 'white', color: 'var(--cor-texto-secundario)', marginRight: '8px' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <MdOutlineEdit size={18} />
                    </button>
                    <button
                      onClick={() => { setProdutoParaExcluir(produto); setModalExcluirAberto(true) }}
                      className="btn btn-sm"
                      style={{ width: '36px', height: '36px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E8E8', borderRadius: '8px', backgroundColor: 'white', color: 'var(--cor-texto-secundario)' }}
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
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '14px', color: 'var(--cor-texto-secundario)' }}>Linhas por página</span>
          <select className="form-select form-select-sm" value={itensPorPagina} onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1) }} style={{ width: '80px', border: '1px solid #E8E8E8', borderRadius: '8px', fontSize: '14px' }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button onClick={() => setPaginaAtual(paginaAtual - 1)} disabled={paginaAtual === 1} className="btn btn-sm" style={{ padding: '8px 16px', border: '1px solid #E8E8E8', borderRadius: '8px', backgroundColor: 'white', color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>‹ Anterior</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(i => (
            <button key={i} onClick={() => setPaginaAtual(i)} className="btn btn-sm" style={{ minWidth: '40px', height: '40px', backgroundColor: paginaAtual === i ? 'var(--cor-primaria)' : 'transparent', color: paginaAtual === i ? 'white' : 'var(--cor-texto-secundario)', border: paginaAtual === i ? 'none' : '1px solid #E8E8E8', borderRadius: '8px', margin: '0 4px' }}>{i}</button>
          ))}
          <button onClick={() => setPaginaAtual(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className="btn btn-sm" style={{ padding: '8px 16px', border: '1px solid #E8E8E8', borderRadius: '8px', backgroundColor: 'white', color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>Próximo ›</button>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--cor-texto-secundario)' }}>
          Exibindo {indexPrimeiro + 1}-{Math.min(indexUltimo, produtosFiltrados.length)} de {produtosFiltrados.length} Registros
        </div>
      </div>

      {/* Modais */}
      <ModalConfirmarExclusao
        isOpen={modalExcluirAberto}
        nomeProduto={produtoParaExcluir?.nome}
        onCancelar={() => { setModalExcluirAberto(false); setProdutoParaExcluir(null) }}
        onConfirmar={() => { onDeletar(produtoParaExcluir.id); setModalExcluirAberto(false); setProdutoParaExcluir(null) }}
      />
      <ModalEditarProdutoClinica
        isOpen={modalEditarAberto}
        onClose={() => { setModalEditarAberto(false); onAtualizar() }}
        produto={produtoSelecionado}
      />
      <ModalMovimentacao
        isOpen={modalMovimentacaoAberto}
        onClose={() => { setModalMovimentacaoAberto(false); onAtualizar() }}
        produto={produtoSelecionado}
        tipo={tipoMovimentacao}
        clinicaId={clinicaId}
      />
    </div>
  )
}

export default TabelaEstoqueClinica