import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Layout from '../components/layout/Layout'
import TabelaProdutos from '../components/TabelaProdutos'
import ModalNovoProduto from '../components/ModalNovoProduto'

function Products() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)

  const FORNECEDOR_ID = ' '

  async function deletarProduto(id) {
    try {
      await deleteDoc(doc(db, `fornecedores/${FORNECEDOR_ID}/produtos`, id))
      setProdutos(produtos.filter(p => p.id !== id))
    } catch (erro) {
      console.error('Erro ao deletar produto:', erro)
      alert('Erro ao deletar produto.')
    }
  }

  useEffect(() => {
    const produtosRef = collection(db, `fornecedores/${FORNECEDOR_ID}/produtos`)
    
    const unsubscribe = onSnapshot(produtosRef, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      dados.sort((a, b) => a.nome.localeCompare(b.nome))

      setProdutos(dados)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao carregar produtos:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner-border" style={{ color: 'var(--cor-primaria)' }} />
      </div>
    )
  }

  return (
    <Layout headerTitle="Controle de Estoque">
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '32px' }}>
          <h5 style={{ margin: 0, color: 'var(--cor-texto)', fontWeight: '400', fontSize: '20px' }}>
            Produtos
          </h5>
          <button 
            onClick={() => setModalAberto(true)}  
            className='btn'
            style={{ background: 'var(--cor-primaria)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all .2s ease 0s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(179, 179, 179, 0.4)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'None' }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
            Novo Produto
          </button>        
        </div>

        <TabelaProdutos produtos={produtos} onDeletar={deletarProduto} />
      </div>

      <ModalNovoProduto 
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        fornecedorId={FORNECEDOR_ID}
        produtosExistentes={produtos}
      />
    </Layout>
  )
}

export default Products