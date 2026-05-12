import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import TabelaProdutos from '../components/TabelaProdutos'

function Dashboard() {
    const [produtos, setProdutos] = useState([])
    const [loading, setLoading] = useState(true)

    const FORNECEDOR_ID = 'FxJRkTuDGTn9bfZm3Nwi'

    useEffect(() => {
        async function carregarProdutos() {
            try {
                const produtosRef = collection(db, 'fornecedores/${FORNECEDOR_ID}/produtos')
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

    
}