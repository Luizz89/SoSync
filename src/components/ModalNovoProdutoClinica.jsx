import { useState } from 'react'
import { supabase } from '../config/supabase'
import { IoMdClose } from 'react-icons/io'

function ModalNovoProdutoClinica({ isOpen, onClose, clinicaId, produtosExistentes = [] }) {
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    quantidade_minima: '',
    unidade: 'unidades',
    preco: '',
    validade: ''
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function normalizarTexto(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!formData.nome.trim()) {
      setErro('Nome do produto é obrigatório')
      return
    }

    const jaExiste = produtosExistentes.some(p => normalizarTexto(p.nome) === normalizarTexto(formData.nome))
    if (jaExiste) {
      setErro(`O produto "${formData.nome.trim()}" já existe no estoque!`)
      return
    }

    if (!formData.quantidade || parseInt(formData.quantidade) < 0) {
      setErro('Quantidade inválida')
      return
    }

    if (!formData.quantidade_minima || parseInt(formData.quantidade_minima) < 0) {
      setErro('Quantidade mínima inválida')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('estoque_clinica')
      .insert({
        clinica_id: clinicaId,
        nome: formData.nome.trim(),
        quantidade: parseInt(formData.quantidade),
        quantidade_minima: parseInt(formData.quantidade_minima),
        unidade: formData.unidade,
        preco: formData.preco ? parseFloat(formData.preco) : null,
        validade: formData.validade || null
      })

    if (error) {
      console.error('Erro ao adicionar produto:', error)
      setErro('Erro ao salvar produto. Tente novamente.')
    } else {
      setFormData({ nome: '', quantidade: '', quantidade_minima: '', unidade: 'unidades', preco: '', validade: '' })
      onClose()
    }

    setSalvando(false)
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '500', color: 'var(--cor-texto)' }}>Novo Produto</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-texto-secundario)' }}>
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Nome</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome do produto" className="form-control" style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }} />
          </div>

          {/* Quantidade e Quantidade Mínima */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Quantidade Atual</label>
              <input type="number" name="quantidade" value={formData.quantidade} onChange={handleChange} placeholder="0" min="0" className="form-control" style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Quantidade Mínima</label>
              <input type="number" name="quantidade_minima" value={formData.quantidade_minima} onChange={handleChange} placeholder="10" min="0" className="form-control" style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }} />
            </div>
          </div>

          {/* Unidade e Preço */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Unidade</label>
              <select name="unidade" value={formData.unidade} onChange={handleChange} className="form-control" style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }}>
                <option value="unidades">Unidades</option>
                <option value="caixas">Caixas</option>
                <option value="ampolas">Ampolas</option>
                <option value="frascos">Frascos</option>
                <option value="pares">Pares</option>
                <option value="kg">Kg</option>
                <option value="litros">Litros</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Preço</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>R$</span>
                <input type="number" name="preco" value={formData.preco} onChange={handleChange} placeholder="0,00" step="0.01" min="0" className="form-control" style={{ padding: '12px 16px 12px 40px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }} />
              </div>
            </div>
          </div>

          {/* Validade */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Data de Validade</label>
            <input type="date" name="validade" value={formData.validade} onChange={handleChange} className="form-control" style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }} />
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
            <button type="submit" disabled={salvando} className="btn" style={{ padding: '12px', fontSize: '14px', fontWeight: '500', borderRadius: '10px', border: 'none', background: salvando ? '#cccccc' : 'linear-gradient(135deg, var(--cor-primaria) 0%, #00B8A3 100%)', color: 'white', cursor: salvando ? 'not-allowed' : 'pointer' }}>
              {salvando ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalNovoProdutoClinica