import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DashboardClinica from './pages/DashboardClinica'
import Products from './pages/Products'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>}></Route>
        <Route path='/estoque' element={<Products/>}></Route>
        <Route path='/clinica' element={<DashboardClinica/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App