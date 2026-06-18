import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { IoMdClose } from 'react-icons/io'

function ModalEditarProduto({ isOpen, onClose, produto }) {
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    validade: ''
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome || '',
        quantidade: produto.quantidade || '',
        validade: produto.validade || ''
      })
    }
  }, [produto])

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

    if (!formData.quantidade || parseInt(formData.quantidade) < 0) {
      setErro('Quantidade inválida')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('produtos')
      .update({
        nome: formData.nome.trim(),
        quantidade: parseInt(formData.quantidade),
        validade: formData.validade || null
      })
      .eq('id', produto.id)

    if (error) {
      console.error('Erro ao editar produto:', error)
      setErro('Erro ao salvar alterações. Tente novamente.')
    } else {
      onClose()
    }

    setSalvando(false)
  }

  if (!isOpen) return null

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '500', color: 'var(--cor-texto)' }}>Editar Produto</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-texto-secundario)' }}>
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Nome</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome do produto" className="form-control" style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>Quantidade</label>
            <input type="number" name="quantidade" value={formData.quantidade} onChange={handleChange} placeholder="0" min="0" className="form-control" style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }} />
          </div>

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
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarProduto