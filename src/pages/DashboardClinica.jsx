import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { MdLocalGroceryStore } from 'react-icons/md'
import { IoMdAlert } from 'react-icons/io'
import { AiFillAlert } from 'react-icons/ai'
import Layout from '../components/layout/Layout'
import StatCard from '../components/StatCard'
import TabelaEstoque from '../components/TabelaEstoque'
import AlertasCriticos from '../components/AlertasCriticos'

function DashboardClinica() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  // Por enquanto ID fixo, depois virá do login
  const CLINICA_ID = 'cdab23c6-f93f-4217-9d36-5478c745e42f'

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from('estoque_clinica')
      .select('*')
      .eq('clinica_id', CLINICA_ID)
      .order('quantidade', { ascending: true })

    if (error) {
      console.error('Erro ao carregar produtos:', error)
    } else {
      setProdutos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
    await carregarProdutos()
  }

  init()

    const subscription = supabase
      .channel('dashboard-clinica')
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

  const totalProdutos = produtos.length
  const produtosCriticos = produtos.filter(p => p.quantidade < p.quantidade_minima * 0.5).length
  const produtosAtencao = produtos.filter(p => p.quantidade >= p.quantidade_minima * 0.5 && p.quantidade < p.quantidade_minima).length

  return (
    <Layout headerTitle="Dashboard">
      <div style={{ marginBottom: '32px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h5 style={{ marginBottom: '20px', color: 'var(--cor-texto-secundario)', fontWeight: '400', fontSize: '18px' }}>
          Visão Geral
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <StatCard title="Total de produtos" value={totalProdutos} icon={<MdLocalGroceryStore />} bgColor="var(--cor-card-verde)" iconColor="#00D9C0" />
          <StatCard title="Atenção" value={produtosAtencao} icon={<IoMdAlert />} bgColor="var(--cor-card-amarelo)" iconColor="var(--cor-badge-atencao)" />
          <StatCard title="Críticos" value={produtosCriticos} icon={<AiFillAlert />} bgColor="var(--cor-card-rosa)" iconColor="#FF6B6B" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <TabelaEstoque produtos={produtos} />
        <AlertasCriticos />
      </div>
    </Layout>
  )
}

export default DashboardClinica