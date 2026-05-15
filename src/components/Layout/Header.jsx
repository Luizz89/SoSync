function Header({ title, subtitle, actions }) {
  return (
    <div className="bg-white border-bottom shadow-sm mb-4" 
         style={{ marginLeft: '250px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container-fluid py-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">{title}</h4>
            {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
          </div>
          
          {/* Ações opcionais (botões, filtros, etc) */}
          {actions && (
            <div className="d-flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header