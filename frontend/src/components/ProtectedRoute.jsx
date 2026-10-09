import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    // Si no hay sesión, lo devuelve inmediatamente al login
    return <Navigate to="/login" replace />
  }
  // Si hay sesión, le permite ver el componente (el CRUD)
  return children
}
