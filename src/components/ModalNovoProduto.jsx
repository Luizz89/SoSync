import { useState } from 'react'
import { supabase } from '../config/supabase'
import { IoMdClose } from 'react-icons/io'

function ModalNovoProduto({ isOpen, onClose, produtosExistentes = [] }) {
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
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

    setSalvando(true)

    const { error } = await supabase
      .from('produtos')
      .insert({
        nome: formData.nome.trim(),
        quantidade: parseInt(formData.quantidade),
        validade: formData.validade || null
      })

    if (error) {
      console.error('Erro ao adicionar produto:', error)
      setErro('Erro ao salvar produto. Tente novamente.')
    } else {
      setFormData({ nome: '', quantidade: '', validade: '' })
      onClose()
    }

    setSalvando(false)
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '20px', padding: '32px',
          width: '90%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h5 style={{ margin: 0, fontSize: '20px', fontWeight: '500', color: 'var(--cor-texto)' }}>
            Novo Produto
          </h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-texto-secundario)' }}>
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Insira o nome do produto"
              className="form-control"
              style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }}
            />
          </div>

          {/* Quantidade */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>
              Quantidade
            </label>
            <input
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              placeholder="Informe a quantidade"
              min="0"
              className="form-control"
              style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }}
            />
          </div>

          {/* Validade */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--cor-texto)' }}>
              Data de Validade
            </label>
            <input
              type="date"
              name="validade"
              value={formData.validade}
              onChange={handleChange}
              className="form-control"
              style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1px solid #E8E8E8' }}
            />
          </div>

          {/* Erro */}
          {erro && (
            <div style={{ padding: '12px', backgroundColor: '#FFE5E5', color: '#FF6B6B', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {erro}
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ padding: '12px', fontSize: '14px', fontWeight: '500', borderRadius: '10px', border: '1px solid #E8E8E8', backgroundColor: 'white', color: 'var(--cor-texto)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="btn"
              style={{
                padding: '12px', fontSize: '14px', fontWeight: '500', borderRadius: '10px', border: 'none',
                background: salvando ? '#cccccc' : 'linear-gradient(135deg, var(--cor-primaria) 0%, #00B8A3 100%)',
                color: 'white', cursor: salvando ? 'not-allowed' : 'pointer'
              }}
            >
              {salvando ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalNovoProduto