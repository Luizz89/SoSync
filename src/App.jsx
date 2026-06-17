import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardClinica from './pages/DashboardClinica'
import Products from './pages/Products'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<DashboardClinica/>}></Route>
        <Route path='/estoque' element={<Products/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App