// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import LoginClinica from './pages/LoginClinica'
import Dashboard from './pages/Dashboard'
import DashboardClinica from './pages/DashboardClinica'
import Products from './pages/Products'
import EstoqueClinica from './pages/EstoqueClinica'
import Pedidos from './pages/Pedidos'


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginClinica />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardClinica/></ProtectedRoute>} />
           <Route path='/estoque' element={<ProtectedRoute><EstoqueClinica/></ProtectedRoute>} />
           <Route path='/pedidos' element={<ProtectedRoute><Pedidos/></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}