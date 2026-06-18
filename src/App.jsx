import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardClinica from './pages/DashboardClinica'
import Products from './pages/Products'
import EstoqueClinica from './pages/EstoqueClinica'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<DashboardClinica/>} />
        <Route path='/estoque' element={<Products/>} />
        <Route path='/estoque-clinica' element={<EstoqueClinica/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App