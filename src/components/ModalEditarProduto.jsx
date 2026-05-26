import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

function ModalEditarProduto({ isOpen, onClose, produto, fornecedorId }) {
  const [form, setForm] = useState({
    nome: '',
    qtdAtual: '',
    qtdMaxima: '',
    unidade: '',
    dataEntrada: '',
    validade: '',
    preco: ''
  })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (produto) {
      setForm({
        nome: produto.nome || '',
        qtdAtual: produto.qtdAtual || '',
        qtdMaxima: produto.qtdMaxima || '',
        unidade: produto.unidade || '',
        dataEntrada: produto.dataEntrada || '',
        validade: produto.validade || '',
        preco: produto.preco || ''
      })
    }
  }, [produto])

  async function salvar() {
    setSalvando(true)
    try {
      const produtoRef = doc(db, `fornecedores/${fornecedorId}/produtos`, produto.id)
      await updateDoc(produtoRef, {
        nome: form.nome,
        qtdAtual: Number(form.qtdAtual),
        qtdMaxima: Number(form.qtdMaxima),
        unidade: form.unidade,
        dataEntrada: form.dataEntrada,
        validade: form.validade,
        preco: Number(form.preco)
      })
      onClose()
    } catch (erro) {
      console.error('Erro ao editar produto:', erro)
      alert('Erro ao salvar alterações.')
    } finally {
      setSalvando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px',
        padding: '32px', width: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <h5 style={{ marginBottom: '24px', fontWeight: '500' }}>Editar Produto</h5>

        {[
          { label: 'Nome', key: 'nome', type: 'text' },
          { label: 'Quantidade Atual', key: 'qtdAtual', type: 'number' },
          { label: 'Quantidade Máxima', key: 'qtdMaxima', type: 'number' },
          { label: 'Unidade', key: 'unidade', type: 'text' },
          { label: 'Data de Entrada', key: 'dataEntrada', type: 'text' },
          { label: 'Validade', key: 'validade', type: 'text' },
          { label: 'Preço', key: 'preco', type: 'number' }
        ].map(({ label, key, type }) => (
          <div key={key} style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: 'var(--cor-texto-secundario)', marginBottom: '6px', display: 'block' }}>
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1px solid #E8E8E8', fontSize: '14px', outline: 'none'
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            className="btn"
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E8E8E8', fontSize: '14px' }}
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="btn"
            style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--cor-primaria)', color: 'white', border: 'none', fontSize: '14px' }}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalEditarProduto