import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

function AlertasCriticos() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarAlertas() {
      const { data, error } = await supabase
        .from('estoque_clinica')
        .select('id, nome, quantidade, quantidade_minima, clinica_id')
        .order('quantidade', { ascending: true })

      if (error) {
        console.error('Erro ao carregar alertas:', error)
        setLoading(false)
        return
      }

      const dados = data
        .filter(p => p.quantidade < p.quantidade_minima)
        .map(p => ({
          id: p.id,
          produto: p.nome,
          quantidade: p.quantidade,
          quantidade_minima: p.quantidade_minima,
          nivel: p.quantidade < p.quantidade_minima * 0.5 ? 'Crítico' : 'Atenção'
        }))

      setAlertas(dados)
      setLoading(false)
    }

    carregarAlertas()

    const subscription = supabase
      .channel('alertas-criticos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_clinica' }, carregarAlertas)
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [])

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}>
      <h5 style={{ margin: '0 0 24px 0', color: 'var(--cor-texto)', fontWeight: '400', fontSize: '18px' }}>
        Alertas Críticos
      </h5>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div className="spinner-border spinner-border-sm" style={{ color: 'var(--cor-primaria)' }} />
          </div>
        ) : alertas.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--cor-texto-secundario)', fontSize: '14px' }}>
            <p style={{ margin: 0 }}>🎉 Nenhum alerta crítico!</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Todos os produtos estão com estoque adequado.</p>
          </div>
        ) : (
          alertas.map(alerta => (
            <div key={alerta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--cor-texto)', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  {alerta.produto}
                </span>
                <span style={{ color: 'var(--cor-texto-secundario)', fontSize: '12px' }}>
                  Qtd: {alerta.quantidade} / Mínimo: {alerta.quantidade_minima}
                </span>
              </div>
              <span style={{
                backgroundColor: alerta.nivel === 'Crítico' ? '#FFE5E5' : '#FFF9E6',
                color: alerta.nivel === 'Crítico' ? '#FF6B6B' : '#FFD93D',
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '13px', fontWeight: '500',
                whiteSpace: 'nowrap', marginLeft: '12px'
              }}>
                {alerta.nivel}
              </span>
            </div>
          ))
        )}
      </div>

      {alertas.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F5F5F5', borderRadius: '8px', fontSize: '12px', color: 'var(--cor-texto-secundario)', textAlign: 'center' }}>
          {alertas.filter(a => a.nivel === 'Crítico').length} crítico(s) • {alertas.filter(a => a.nivel === 'Atenção').length} em atenção
        </div>
      )}
    </div>
  )
}

export default AlertasCriticos