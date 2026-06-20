// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import LoginClinica from './pages/LoginClinica'
import Dashboard from './pages/Dashboard'
import DashboardClinica from './pages/DashboardClinica'
import Products from './pages/Products'
import EstoqueClinica from './pages/EstoqueClinica'


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginClinica />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardClinica />} />
              <Route path='/estoque' element={<EstoqueClinica/>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/estoque" replace />} />
          </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}