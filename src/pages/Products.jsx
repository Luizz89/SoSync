import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import Layout from '../components/layout/Layout'
import TabelaProdutos from '../components/TabelaProdutos'
import ModalNovoProduto from '../components/ModalNovoProduto'

function Products() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao carregar produtos:', error)
    } else {
      setProdutos(data)
    }
    setLoading(false)
  }

  async function deletarProduto(id) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar produto:', error)
      alert('Erro ao deletar produto.')
    } else {
      setProdutos(produtos.filter(p => p.id !== id))
    }
  }

  useEffect(() => {
    carregarProdutos()

    const subscription = supabase
      .channel('produtos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
        carregarProdutos()
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
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
          <h5 style={{ margin: 0, color: 'var(--cor-texto)', fontWeight: '400', fontSize: '20px' }}>Produtos</h5>
          <button
            onClick={() => setModalAberto(true)}
            className='btn'
            style={{ background: 'var(--cor-primaria)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(179,179,179,0.4)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
            Novo Produto
          </button>
        </div>

        <TabelaProdutos produtos={produtos} onDeletar={deletarProduto} produtosExistentes={produtos} />
      </div>

      <ModalNovoProduto
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); carregarProdutos() }}
        produtosExistentes={produtos}
      />
    </Layout>
  )
}

export default Products