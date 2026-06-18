import { useState } from 'react'
import { supabase } from '../config/supabase'
import { IoMdClose } from 'react-icons/io'
import { MdOutlineAddCircleOutline, MdOutlineRemoveCircleOutline } from 'react-icons/md'

function ModalMovimentacao({ isOpen, onClose, produto, tipo, clinicaId }) {
  const [quantidade, setQuantidade] = useState('')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!quantidade || parseInt(quantidade) <= 0) {
      setErro('Informe uma quantidade válida')
      return
    }

    const qtd = parseInt(quantidade)

    if (tipo === 'saida' && qtd > produto.quantidade) {
      setErro(`Quantidade insuficiente! Estoque atual: ${produto.quantidade} ${produto.unidade}`)
      return
    }

    setSalvando(true)

    // Calcula nova quantidade
    const novaQuantidade = tipo === 'entrada'
      ? produto.quantidade + qtd
      : produto.quantidade - qtd

    // Atualiza quantidade no estoque
    const { error: erroEstoque } = await supabase
      .from('estoque_clinica')
      .update({ quantidade: novaQuantidade })
      .eq('id', produto.id)

    if (erroEstoque) {
      console.error('Erro ao atualizar estoque:', erroEstoque)
      setErro('Erro ao atualizar estoque. Tente novamente.')
      setSalvando(false)
      return
    }

    // Registra movimentação
    const { error: erroMovimentacao } = await supabase
      .from('movimentacoes')
      .insert({
        produto_id: produto.id,
        clinica_id: clinicaId,
        tipo: tipo,
        quantidade: qtd,
        observacao: observacao.trim() || null
      })

    if (erroMovimentacao) {
      console.error('Erro ao registrar movimentação:', erroMovimentacao)
    }

    setQuantidade('')
    setObservacao('')
    setSalvando(false)
    onClose()
  }

  if (!isOpen || !produto) return null

  const isEntrada = tipo === 'entrada'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '440px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: isEntrada ? '#E5FBF8' : '#FFE5E5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isEntrada ? '#00D9C0' : '#FF6B6B'
            }}>
              {isEntrada ? <MdOutlineAddCircleOutline size={22} /> : <MdOutlineRemoveCircleOutline size={22} />}
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '500', color: 'var(--cor-texto)' }}>
                {isEntrada ? 'Entrada de Material' : 'Saída de Material'}
              </h5>
              <span style={{ fontSize: '13px', color: 'var(--cor-texto-secundario)' }}>
                {produto.nome}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-texto-secundario)' }}>
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Info estoque atual */}
        <div style={{
          padding: '16px', borderRadius: '12px', marginBottom: '24px',
          backgroundColor: isEntrada ? '#E5FBF8' : '#FFF9F9',
          border: `1px solid ${isEntrada ? '#00D9C0' : '#FFE5E5'}`
        }}>
          <span style={{ fontSize: '13px', color: 'var(--cor-texto-secundario)' }}>Estoque atual</span>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--cor-texto)', marginTop: '4px' }}>
            {produto.quantidade} <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--cor-texto-secundario)' }}>{produto.unidade}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quantidade */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>
              Quantidade a {isEntrada ? 'adicionar' : 'retirar'}
            </label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              min="1"
              className="form-control"
              style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }}
              autoFocus
            />
            {quantidade && parseInt(quantidade) > 0 && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--cor-texto-secundario)' }}>
                Estoque após movimentação: <strong style={{ color: isEntrada ? '#00D9C0' : '#FF6B6B' }}>
                  {isEntrada ? produto.quantidade + parseInt(quantidade) : produto.quantidade - parseInt(quantidade)} {produto.unidade}
                </strong>
              </div>
            )}
          </div>

          {/* Observação */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>
              Observação <span style={{ fontWeight: '400', color: 'var(--cor-texto-secundario)' }}>(opcional)</span>
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder={isEntrada ? 'Ex: Compra de reposição...' : 'Ex: Utilizado em procedimento...'}
              className="form-control"
              rows={3}
              style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8', resize: 'none' }}
            />
          </div>

          {erro && (
            <div style={{ padding: '12px', backgroundColor: '#FFE5E5', color: '#FF6B6B', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn" style={{ padding: '12px', fontSize: '14px', fontWeight: '500', borderRadius: '10px', border: '1px solid #E8E8E8', backgroundColor: 'white', color: 'var(--cor-texto)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="btn" style={{
              padding: '12px', fontSize: '14px', fontWeight: '500', borderRadius: '10px', border: 'none',
              background: salvando ? '#cccccc' : isEntrada ? 'linear-gradient(135deg, #00D9C0, #00B8A3)' : 'linear-gradient(135deg, #FF6B6B, #ff5252)',
              color: 'white', cursor: salvando ? 'not-allowed' : 'pointer'
            }}>
              {salvando ? 'Salvando...' : isEntrada ? 'Confirmar Entrada' : 'Confirmar Saída'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalMovimentacao