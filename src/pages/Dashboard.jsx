import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { BiClinic } from "react-icons/bi"
import { LuPackageCheck } from "react-icons/lu"
import { AiOutlineAlert } from "react-icons/ai"
import Layout from '../components/Layout/Layout'
import StatCard from '../components/StatCard'
import ClinicasCard from '../components/ClinicasCard'
import AlertasCriticos from '../components/AlertasCriticos'
 

function Dashboard() {
  const [totalClinicas, setTotalClinicas] = useState(0)
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [produtosCriticos, setProdutosCriticos] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarStats() {
      const { count: countClinicas } = await supabase
        .from('clinicas')
        .select('*', { count: 'exact', head: true })

      const { count: countProdutos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })

      const { count: countCriticos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .lt('quantidade', 10)

      setTotalClinicas(countClinicas || 0)
      setTotalProdutos(countProdutos || 0)
      setProdutosCriticos(countCriticos || 0)
      setLoading(false)
    }

    carregarStats()

    const subscription = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinicas' }, carregarStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, carregarStats)
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
    <Layout headerTitle="Dashboard">
      <div style={{ marginBottom: '32px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h5 style={{ marginBottom: '20px', color: 'var(--cor-texto-secundario)', fontWeight: '400', fontSize: '18px' }}>
          Visão Geral
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <StatCard title="Clínicas Conectadas" value={totalClinicas} icon={<BiClinic />} bgColor="var(--cor-card-verde)" iconColor="#00D9C0" />

          <StatCard title="Produtos cadastrados"
           value={totalProdutos}
            icon={<LuPackageCheck />} 
            bgColor="var(--cor-azul-claro)" 
            iconColor="var(--cor-azul)" />

          <StatCard title="Críticos" value={produtosCriticos} icon={<AiOutlineAlert />} bgColor="var(--cor-card-rosa)" iconColor="#FF6B6B" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <ClinicasCard />
        <AlertasCriticos />
      </div>
    </Layout>
  )
}

export default Dashboard