import { useState, useEffect } from 'react'
import { collection, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

function ListaClinicas() {
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

          // Calcula o status
          const totalProdutos = produtos.length
          const criticos = produtos.filter(p => p.quantidade < 10).length
          const atencao = produtos.filter(p => p.quantidade >= 10 && p.quantidade < 20).length

          let status = 'Normal'
          if (criticos > 0) status = 'Faltando'
          else if (atencao > 0) status = 'Atenção'

          return { ...clinica, totalProdutos, criticos, atencao, status }
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
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
                backgroundColor: '#FAFAFA',
                color: 'var(--cor-texto)',
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between', 
                alignItems: 'center'
            }}>
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
                {clinica.criticos > 0 && (
                  <span style={{ color: '#FF6B6B', 
                    fontSize: '12px',
                    display: 'block' }}>
                    {clinica.criticos} produto(s) em falta
                  </span>
                )}
                {clinica.atencao > 0 && (
                  <span style={{ color: '#FFB800',
                    fontSize: '12px',
                    display: 'block' }}>
                    {clinica.atencao} produto(s) em atenção
                  </span>
                )}
              </div>
              <span style={{
                ...getStatusStyle(clinica.status),
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '13px', fontWeight: '500',
                whiteSpace: 'nowrap', marginLeft: '12px'
              }}>
                {clinica.status}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '16px',
        padding: '12px', 
        backgroundColor: '#F5F5F5', 
        borderRadius: '8px', 
        fontSize: '12px', 
        color: 'var(--cor-texto-secundario)',
        textAlign: 'center' }}>
        {clinicas.length} clínica(s) conectada(s)
      </div>
    </div>
  )
}

export default ListaClinicas