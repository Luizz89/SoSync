import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children, showHeader = false, headerTitle, headerSubtitle, headerActions }) {
  return (
    <div className="d-flex">
      <Sidebar />
      
      <div className="flex-grow-1" style={{ marginLeft: '250px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {showHeader && (
          <Header 
            title={headerTitle} 
            subtitle={headerSubtitle}
            actions={headerActions}
          />
        )}
        
        <main className={showHeader ? '' : 'py-4'}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout