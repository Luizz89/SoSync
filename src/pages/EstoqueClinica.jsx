import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import Layout from '../components/layout/Layout'
import TabelaEstoqueClinica from '../components/TabelaEstoqueClinica'
import ModalNovoProdutoClinica from '../components/ModalNovoProdutoClinica'


function EstoqueClinica() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)

  // Por enquanto sem autenticação, usando ID fixo para teste
  const CLINICA_ID = 'cdab23c6-f93f-4217-9d36-5478c745e42f'

  
  async function carregarProdutos() {
    const { data, error } = await supabase
      .from('estoque_clinica')
      .select('*')
      .eq('clinica_id', CLINICA_ID)
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
      .from('estoque_clinica')
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
      .channel('estoque-clinica')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_clinica' }, carregarProdutos)
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
    <Layout headerTitle="Estoque da Clínica">
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '32px' }}>
          <h5 style={{ margin: 0, color: 'var(--cor-texto)', fontWeight: '400', fontSize: '20px' }}>
            Meu Estoque
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

        <TabelaEstoqueClinica
          produtos={produtos}
          onDeletar={deletarProduto}
          onAtualizar={carregarProdutos}
          clinicaId={CLINICA_ID}
        />
      </div>

      <ModalNovoProdutoClinica
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); carregarProdutos() }}
        clinicaId={CLINICA_ID}
        produtosExistentes={produtos}
      />
    </Layout>
  )
  
}

export default EstoqueClinica