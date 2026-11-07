import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Crud from './pages/Crud'
import Rendimiento from './pages/Rendimiento'
import Comparar from './pages/Comparar'
import Eventos from './pages/Eventos'
import Recintos from './pages/Recintos'
import Gimnasios from './pages/Gimnasios'
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

        {/* Módulos protegidos del core: rendimiento de eventos */}
        <Route path="/rendimiento" element={<ProtectedRoute><Rendimiento /></ProtectedRoute>} />
        <Route path="/comparar" element={<ProtectedRoute><Comparar /></ProtectedRoute>} />
        <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
        <Route path="/recintos" element={<ProtectedRoute><Recintos /></ProtectedRoute>} />
        <Route path="/gimnasios" element={<ProtectedRoute><Gimnasios /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
