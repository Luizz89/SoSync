import { useState, useEffect } from 'react'
import { collection, onSnapshot,} from 'firebase/firestore'
import { db } from '../config/firebase'
import { MdLocalGroceryStore } from 'react-icons/md'
import { IoMdAlert } from 'react-icons/io'
import { AiOutlineAlert } from "react-icons/ai";
import Layout from '../components/layout/Layout'
import StatCard from '../components/StatCard'
import TabelaEstoque from '../components/TabelaEstoque'
import ListaClinicas from '../components/ListaClinicas'
import AlertasCriticos from '../components/AlertasCriticos'
import ClinicasCard from '../components/ClinicasCard'
import { BiClinic } from "react-icons/bi";
import { LuPackageCheck } from "react-icons/lu";


function Dashboard() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  const FORNECEDOR_ID = 'FxJRkTuDGTn9bfZm3Nwi'

  useEffect(() => {
    // onSnapshot escuta mudanças em tempo real
    const produtosRef = collection(db, `fornecedores/${FORNECEDOR_ID}/produtos`)
    
    const unsubscribe = onSnapshot(produtosRef, (snapshot) => {
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Ordena por nível crítico (menor primeiro)
      dados.sort((a, b) => {
        const nivelA = (a.qtdAtual / a.qtdMaxima) * 100
        const nivelB = (b.qtdAtual / b.qtdMaxima) * 100
        return nivelA - nivelB
      })

      setProdutos(dados)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao carregar produtos:', error)
      setLoading(false)
    })

    // Cleanup: cancela a escuta quando o componente desmontar
    return () => unsubscribe()
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
  const produtosCriticos = produtos.filter(p => (p.qtdAtual / p.qtdMaxima) < 0.2).length
  const produtosAtencao = produtos.filter(p => {
    const nivel = p.qtdAtual / p.qtdMaxima
    return nivel >= 0.2 && nivel < 0.5
  }).length

  return (
    <Layout headerTitle="Dashboard">
      {/* Visão Geral */}
      <div style={{ 
        marginBottom: '32px',
        backgroundColor: 'White',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
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
            title="Clínicas Conectadas"
            value={totalProdutos}
            icon={<BiClinic />}
            bgColor="var(--cor-card-verde)"
            iconColor="#00D9C0"
          />
          <StatCard 
            title="Produtos cadastrados"
            value={produtosAtencao}
            icon={<LuPackageCheck />}
            bgColor="var(--cor-azul-claro)"
            iconColor= "var(--cor-azul)"
          />
          <StatCard 
            title="Críticos"
            value={produtosCriticos}
            icon={<AiOutlineAlert />}
            bgColor="var(--cor-card-rosa)"
            iconColor="#FF6B6B"
          />
        </div>
      </div>

      {/* Tabela e Alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <TabelaEstoque produtos={produtos} />
        <ListaClinicas/> 
        <ClinicasCard/>
      </div>
    </Layout>
  )
}


export default Dashboard