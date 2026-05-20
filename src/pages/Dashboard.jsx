import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { MdLocalGroceryStore } from 'react-icons/md'
import { IoMdAlert } from 'react-icons/io'
import { AiFillAlert } from 'react-icons/ai'
import Layout from '../components/layout/Layout'
import StatCard from '../components/StatCard'
import TabelaEstoque from '../components/TabelaEstoque'
import AlertasCriticos from '../components/AlertasCriticos'

function Dashboard() {
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
          const nivelA = (a.quantidadeAtual / a.quantidadeMaxima) * 100
          const nivelB = (b.quantidadeAtual / b.quantidadeMaxima) * 100
          return nivelA - nivelB
        })

        setProdutos(dados)
      } catch (erro) {
        console.error('Erro:', erro)
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="spinner-border" style={{ color: 'var(--cor-primaria)' }} />
      </div>
    )
  }

  const totalProdutos = produtos.length
  const produtosCriticos = produtos.filter(p => (p.quantidadeAtual / p.quantidadeMaxima) < 0.2).length
  const produtosAtencao = produtos.filter(p => {
    const nivel = p.quantidadeAtual / p.quantidadeMaxima
    return nivel >= 0.2 && nivel < 0.5
  }).length

  return (
    <Layout headerTitle="Dashboard">
      {/* Visão Geral */}
      <div style={{ marginBottom: '32px' }}>
        <h5 style={{ 
          marginBottom: '20px', 
          color: 'var(--cor-texto-secundario)', 
          fontWeight: '400',
          fontSize: '18px'
        }}>
          Visão Geral
        </h5>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px' 
        }}>
          <StatCard 
            title="Total de produtos"
            value={totalProdutos}
            icon={<MdLocalGroceryStore />}
            bgColor="var(--cor-card-verde)"
            iconColor="#00D9C0"
          />
          <StatCard 
            title="Atenção"
            value={produtosAtencao}
            icon={<IoMdAlert />}
            bgColor="var(--cor-card-amarelo)"
            iconColor= "var(--cor-badge-atencao)"
          />
          <StatCard 
            title="Críticos"
            value={produtosCriticos}
            icon={<AiFillAlert />}
            bgColor="var(--cor-card-rosa)"
            iconColor="#FF6B6B"
          />
        </div>
      </div>

      {/* Tabela e Alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <TabelaEstoque produtos={produtos} />
        <AlertasCriticos />
      </div>
    </Layout>
  )
}

export default Dashboard