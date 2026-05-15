import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import TabelaProdutos from '../components/TabelaProdutos'
import Layout from '../components/Layout/Layout'

export function Dashboard() {
    const [produtos, setProdutos] = useState([])
    const [loading, setLoading] = useState(true)

    const FORNECEDOR_ID = 'FxJRkTuDGTn9bfZm3Nwi'

    useEffect(() => {
        async function carregarProdutos() {
            try {
                const produtosRef = collection(db, `fornecedores/${FORNECEDOR_ID}/produtos`)
                const snapshot = await getDocs(produtosRef)
    
                const dados = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
    
                dados.sort((a, b) => {
                    const nivelA = (a.qtdAtual / a.qtdMaxima) * 100
                    const nivelB = (b.qtdAtual / b.qtdMaxima) * 100
                    return nivelA - nivelB
                })
    
                setProdutos(dados)
            } catch(erro) {
                console.error('Erro ao carregar produtos: ', erro)
                alert('Erro ao carregar produtos. Verifique o console.')
            } finally {
                setLoading(false)
            }
        }

        carregarProdutos()
    }, [])

    if (loading){
        return(
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role='status'>
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        )
    }

    const totalProdutos = produtos.length
    const produtosCriticos = produtos.filter(p => (p.qtdAtual / p.qtdMaxima) < 0.2).length
    const produtosAtencao = produtos.filter(p => {
        const nivel = p.qtdAtual/p.qtdMaxima
        return nivel >= 0.2 && nivel < 0.5
    }).length

    const headerActions = (
      <>
        <button className="btn btn-outline-primary btn-sm">Exportar</button>
        <button className='btn btn-primary btn-sm'>Novo Produto</button>
      </>
    )

   return (
    <Layout 
      showHeader={true}
      headerTitle="Dashboard"
      headerSubtitle="Visão Geral"
      headerActions={headerActions}
    >

    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard - Fornecedor</h2>
          <p className="text-muted mb-0">Visão geral do estoque de produtos</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total de Produtos</h6>
                  <h3 className="mb-0">{totalProdutos}</h3>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>
                  📦
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Em Atenção</h6>
                  <h3 className="mb-0">{produtosAtencao}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>
                  ⚠️
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-danger">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Críticos</h6>
                  <h3 className="mb-0">{produtosCriticos}</h3>
                </div>
                <div className="text-danger" style={{ fontSize: '2rem' }}>
                  🚨
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de produtos */}
      <TabelaProdutos produtos={produtos} />
    </div>
    </Layout>
  )
}

export default Dashboard