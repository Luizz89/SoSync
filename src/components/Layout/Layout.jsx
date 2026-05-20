import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children, headerTitle }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      
      <div style={{ marginLeft: 'var(--sidebar-width)', width: '100%', minHeight: '100vh' }}>
        <Header title={headerTitle} />
        
        <main style={{ padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout