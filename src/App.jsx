import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './config/firebase'
import { Dashboard } from './pages/Dashboard'


function App() {
  return <Dashboard />
  const [clinicas, setClinicas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarClinicas(){
      const querySnapshot = await getDocs(collection(db, 'clinicas'))
      const dados = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setClinicas(dados)
      setLoading(false)
    }
    carregarClinicas()
  }, [])

  if (loading) {
    return <div className="container mt-5">Carregando...</div>
  }

  return (
    <div className="container mt-5">
      <h1>Clínicas Conectadas</h1>
      <div className='row mt-4'>
        {clinicas.map(clinica => (
          <div key={clinica.id} className='col-md-4 mb-3'>
            <div className='card'>
              <div className="card-body">
                <h5 className="card-title">{clinica.nome}</h5>
                <span className="badge bg-success">{clinica.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
