import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/produtos', icon: '📦', label: 'Produtos' },
    { path: '/clinicas', icon: '🏥', label: 'Clínicas' },
    { path: '/pedidos', icon: '🛒', label: 'Pedidos' },
    { path: '/alertas', icon: '⚠️', label: 'Alertas' },
    { path: '/relatorios', icon: '📈', label: 'Relatórios' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="d-flex flex-column bg-dark text-white" 
         style={{ width: '250px', minHeight: '100vh', position: 'fixed', left: 0, top: 0 }}>
      
      {/* Logo/Brand */}
      <div className="p-3 border-bottom border-secondary">
        <h4 className="mb-0">
          <span style={{ color: '#4CAF50' }}>Só</span>Sync
        </h4>
        <small className="text-muted">Fornecedor</small>
      </div>

      {/* Menu Items */}
      <nav className="flex-grow-1 py-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`d-flex align-items-center px-3 py-2 text-decoration-none ${
              isActive(item.path) 
                ? 'bg-primary text-white' 
                : 'text-white-50'
            }`}
            style={{
              transition: 'all 0.2s',
              borderLeft: isActive(item.path) ? '3px solid #4CAF50' : '3px solid transparent'
            }}
          >
            <span className="me-3" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-3 border-top border-secondary">
        <div className="d-flex align-items-center">
          <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-2"
               style={{ width: '40px', height: '40px' }}>
            <span>👤</span>
          </div>
          <div>
            <div className="small fw-bold">Fornecedor</div>
            <div className="small text-muted">Dental Supply</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar