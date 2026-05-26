import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { IoMdClose } from 'react-icons/io'

function ModalNovoProduto({ isOpen, onClose, fornecedorId, produtosExistentes = [] }) {
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    qtdAtual: '',
    qtdMaxima: '',
    dataEntrada: '',
    validade: ''
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    // Validações
    if (!formData.nome.trim()) {
      setErro('Nome do produto é obrigatório')
      return 
    }
    const nomeDigitado = normalizarTexto(formData.nome)
    const jaExiste = produtosExistentes.some(p => normalizarTexto(p.nome) === nomeDigitado)
    if (jaExiste) {
      setErro(`O produto "${formData.nome.trim()}" já existe no estoque!`)
      return
    }
    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      setErro('Preço deve ser maior que zero')
      return
    }
    if (!formData.qtdAtual || parseInt(formData.qtdAtual) < 0) {
      setErro('Quantidade atual inválida')
      return
    }
    if (!formData.qtdMaxima || parseInt(formData.qtdMaxima) <= 0) {
      setErro('Quantidade máxima deve ser maior que zero')
      return
    }

    setSalvando(true)

    try {
      const produtosRef = collection(db, `fornecedores/${fornecedorId}/produtos`)
      
      await addDoc(produtosRef, {
        nome: formData.nome.trim(),
        preco: parseFloat(formData.preco),
        qtdAtual: parseInt(formData.qtdAtual),
        qtdMaxima: parseInt(formData.qtdMaxima),
        unidade: 'unidades', // valor padrão
        dataEntrada: formData.dataEntrada || null,
        validade: formData.validade || null,
        ativo: true,
        criadoEm: serverTimestamp()
      })

      // Limpa o formulário e fecha o modal
      setFormData({
        nome: '',
        preco: '',
        qtdAtual: '',
        qtdMaxima: '',
        dataEntrada: '',
        validade: ''
      })
      onClose()
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      setErro('Erro ao salvar produto. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay de fundo */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        {/* Modal */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}
        >
          {/* Header do Modal */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h5 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '500',
              color: 'var(--cor-texto)'
            }}>
              Novo Produto
            </h5>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--cor-texto-secundario)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IoMdClose size={24} />
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {/* Nome */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--cor-texto)'
              }}>
                Nome
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Insira o nome do produto"
                className="form-control"
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: '1px solid #E8E8E8'
                }}
              />
            </div>

            {/* Preço */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--cor-texto)'
              }}>
                Preço
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--cor-texto-secundario)',
                  fontSize: '14px'
                }}>
                  R$
                </span>
                <input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  placeholder="00,00"
                  step="0.01"
                  min="0"
                  className="form-control"
                  style={{
                    padding: '12px 16px 12px 45px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E8E8E8'
                  }}
                />
              </div>
            </div>

            {/* Quantidade Atual e Comprada (lado a lado) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--cor-texto)'
                }}>
                  Quantidade Atual
                </label>
                <input
                  type="number"
                  name="qtdAtual"
                  value={formData.qtdAtual}
                  onChange={handleChange}
                  placeholder="Informe a quantidade"
                  min="0"
                  className="form-control"
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E8E8E8'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--cor-texto)'
                }}>
                  Quantidade Comprada
                </label>
                <input
                  type="number"
                  name="qtdMaxima"
                  value={formData.qtdMaxima}
                  onChange={handleChange}
                  placeholder="Informe a quantidade"
                  min="0"
                  className="form-control"
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E8E8E8'
                  }}
                />
              </div>
            </div>

            {/* Data de Entrada e Validade (lado a lado) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--cor-texto)'
                }}>
                  Data de Entrada
                </label>
                <input
                  type="date"
                  name="dataEntrada"
                  value={formData.dataEntrada}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E8E8E8'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--cor-texto)'
                }}>
                  Data de Validade
                </label>
                <input
                  type="date"
                  name="validade"
                  value={formData.validade}
                  onChange={handleChange}
                  className="form-control"
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E8E8E8'
                  }}
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div style={{
                padding: '12px',
                backgroundColor: '#FFE5E5',
                color: '#FF6B6B',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {erro}
              </div>
            )}

            {/* Botões */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn"
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '10px',
                  border: '1px solid #E8E8E8',
                  backgroundColor: 'white',
                  color: 'var(--cor-texto)'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="btn"
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '10px',
                  border: 'none',
                  background: salvando ? '#cccccc' : 'var(--cor-primaria)',
                  color: 'white',
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  transition: 'var(--default-transition)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(179, 179, 179, 0.4)' }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'None' }}
              >
                {salvando ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ModalNovoProduto