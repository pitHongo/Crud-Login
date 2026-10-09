import { useState } from 'react'
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom'

const API = 'http://localhost:8000/api'

export default function Login() {
  const [loginUsuario, setLoginUsuario] = useState('')
  const [loginClave, setLoginClave] = useState('')
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  // Mensaje de éxito si viene de registrarse
  const okMessage = location.state?.mensaje || ''

  // Si ya tiene sesión, lo mandamos al crud para que no vea el login
  if (localStorage.getItem('token')) {
    return <Navigate to="/crud" replace />
  }

  async function iniciarSesion(e) {
    e.preventDefault()
    setError('')
    const res = await fetch(`${API}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsuario, password: loginClave }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.detail || 'Error al iniciar sesión.'); return }
    
    // Guardar credenciales
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', data.username)
    
    // Redirigir a la ruta protegida /crud
    navigate('/crud')
  }

  return (
    <div className="contenedor">
      <h1>Torneo Regional de MMA</h1>
      {error && <div className="error">{error}</div>}
      {okMessage && <div className="ok">{okMessage}</div>}
      
      <h3>Iniciar sesión</h3>
      <form className="formulario columna" onSubmit={iniciarSesion}>
        <input placeholder="Usuario o correo" value={loginUsuario} onChange={e => setLoginUsuario(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={loginClave} onChange={e => setLoginClave(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
      <p className="cambiar">
        ¿No tienes cuenta? <Link className="enlace" to="/registro">Crear una cuenta</Link>
      </p>
    </div>
  )
}
