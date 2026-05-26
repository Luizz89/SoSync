import { useState, useEffect } from 'react'
import { collection, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

function ClinicasCard() {
  const [clinicas, setClinicas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const clinicasRef = collection(db, 'clinicas')

    const unsubscribe = onSnapshot(clinicasRef, async (snapshot) => {
      const dados = await Promise.all(
        snapshot.docs.map(async (docClinica) => {
          const clinica = { id: docClinica.id, ...docClinica.data() }

          // Busca o estoque da clínica
          const estoqueRef = collection(db, `clinicas/${clinica.id}/estoque-clinica`)
          const estoqueSnapshot = await getDocs(estoqueRef)
          const produtos = estoqueSnapshot.docs.map(d => d.data())

          const totalProdutos = produtos.length

          return { ...clinica, totalProdutos}
        })
      )

      setClinicas(dados)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  function getStatusStyle(status) {
    if (status === 'Faltando') return { backgroundColor: '#FFE5E5', color: '#FF6B6B' }
    if (status === 'Atenção') return { backgroundColor: '#fcf9ef', color: '#FFB800' }
    return { backgroundColor: '#E5FBF8', color: '#00D9C0' }
  }


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
          <div style={{ padding: '32px',
            textAlign: 'center', 
            color: 'var(--cor-texto-secundario)',
            fontSize: '14px' }}>
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
                gap: '12px'
            }}>
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