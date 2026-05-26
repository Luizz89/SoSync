import { Link, useLocation } from 'react-router-dom';
import { AiOutlineHome, AiOutlineBarChart } from 'react-icons/ai';
import { MdContentCopy, MdOutlineSupervisedUserCircle } from 'react-icons/md';
import { IoMdAdd } from 'react-icons/io';
import { VscArchive } from "react-icons/vsc";
import { HiOutlineCalendar, HiOutlineDocumentSearch } from "react-icons/hi";
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../config/firebase';
import ModalNovoProduto from '../ModalNovoProduto';

function Sidebar() {
  const location = useLocation()
  const [produtos, setProdutos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)

  const FORNECEDOR_ID = 'FxJRkTuDGTn9bfZm3Nwi'

  const menuItems = [
    { path: '/', icon: <AiOutlineHome size={24} />, label: 'Dashboard' },
    { path: '/estoque', icon: <VscArchive size={24}/>, label: 'Controle de Estoque' },
    { path: '/agenda', icon: <HiOutlineCalendar size={24} />, label: 'Agenda' },
    { path: '/docs', icon: <HiOutlineDocumentSearch size={24} />, label: 'Docs' },
    { path: '/clinica', icon: <MdOutlineSupervisedUserCircle size={24} />, label: 'Perfil Clinica' },
  ]

  const isActive = (path) => location.pathname === path

  useEffect(() => {
      const produtosRef = collection(db, `fornecedores/${FORNECEDOR_ID}/produtos`)
      
      const unsubscribe = onSnapshot(produtosRef, (snapshot) => {
        const dados = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
  
        dados.sort((a, b) => a.nome.localeCompare(b.nome))
  
        setProdutos(dados)
      }, (error) => {
        console.error('Erro ao carregar produtos:', error)
      })
  
      return () => unsubscribe()
    }, [])

  return (
    <div 
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
        zIndex: 1000
      }}
    >
      {/* Logo */}
      <div 
        style={{
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, #00D9C0 0%, #00B8A3 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '20px',
          marginBottom: '30px'
        }}
      >
        BS
      </div>

      {/* Botão Adicionar */}
      <button
        style={{
          width: '50px',
          height: '50px',
          background: 'var(--cor-primaria)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
          cursor: 'pointer',
          transition: 'var(--default-transition)'
        }}
        onClick={() => setModalAberto(true)}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <IoMdAdd size={28} />
      </button>

      {/* Menu Items */}
      <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive(item.path) ? 'var(--cor-primaria)' : 'var(--cor-texto-secundario)',
              textDecoration: 'none',
              borderRadius: '12px',
              backgroundColor: isActive(item.path) ? 'white' : 'transparent',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'
              }
            }}
            onMouseOut={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
      <ModalNovoProduto 
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        fornecedorId={FORNECEDOR_ID}
        produtosExistentes={produtos}
      />
    </div>
  )
}

export default Sidebar