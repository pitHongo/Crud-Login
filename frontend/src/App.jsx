import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Crud from './pages/Crud'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir la raíz / a /login por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Módulos públicos */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        
        {/* Módulo protegido (sólo se puede entrar si hay sesión) */}
        <Route 
          path="/crud" 
          element={
            <ProtectedRoute>
              <Crud />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}
