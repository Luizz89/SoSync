import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

function ClinicasCard() {
  const [clinicas, setClinicas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarClinicas() {
      const { data: clinicasData, error: erroClinicas } = await supabase
        .from('clinicas')
        .select('*')

      if (erroClinicas) {
        console.error('Erro ao carregar clínicas:', erroClinicas)
        setLoading(false)
        return
      }

      const dados = await Promise.all(
        clinicasData.map(async (clinica) => {
          const { data: produtos, error: erroProdutos } = await supabase
            .from('produtos')
            .select('id')
            .eq('clinica_id', clinica.id)

          if (erroProdutos) {
            console.error('Erro ao carregar produtos:', erroProdutos)
            return { ...clinica, totalProdutos: 0 }
          }

          return { ...clinica, totalProdutos: produtos.length }
        })
      )

      setClinicas(dados)
      setLoading(false)
    }

    carregarClinicas()

    const subscription = supabase
      .channel('clinicas-card')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinicas' }, carregarClinicas)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, carregarClinicas)
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [])

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '20px',
      padding: '32px', height: '100%'
    }}>
      <h5 style={{ margin: '0 0 24px 0', color: 'var(--cor-texto)', fontWeight: '400', fontSize: '18px' }}>
        Clínicas Conectadas
      </h5>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div className="spinner-border spinner-border-sm" style={{ color: 'var(--cor-primaria)' }} />
          </div>
        ) : clinicas.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>
            <p style={{ margin: 0 }}>Nenhuma clínica conectada.</p>
          </div>
        ) : (
          clinicas.map(clinica => (
            <div key={clinica.id} style={{
                padding: '16px',
                color: 'var(--cor-texto)',
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'left',
                gap: '12px',
                cursor: 'pointer'
            }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--cor-fundo-cinza)' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>
              <span style={{
                  padding: '6px 14px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: '500',
                  color: 'var(--cor-primaria)', 
                  backgroundColor: 'var(--cor-card-verde)', 
                  width: 'fit-content'
                  }}>
                  Ativa
              </span>
              <div>
                  <span style={{ color: 'var(--cor-texto)',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '4px', 
                      fontFamily: 'Inter, sans-serif' }}>
                      {clinica.nome}
                  </span>
                  <span style={{ color: 'var(--cor-texto-secundario)',
                      fontSize: '12px',
                      display: 'block' }}>
                  {clinica.totalProdutos} produto(s) no estoque
                  </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ClinicasCard