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

  // Si ya tiene sesión (con rol), lo mandamos al rendimiento para que no vea el login
  if (localStorage.getItem('token') && localStorage.getItem('rol')) {
    return <Navigate to="/rendimiento" replace />
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
    localStorage.setItem('rol', data.rol)
    
    // Redirigir a la ruta protegida /rendimiento
    navigate('/rendimiento')
  }

  return (
    <div className="auth">
      <aside className="auth-marca">
        <h1>FightMetrics</h1>
      </aside>

      <section className="auth-form">
        <h2>Iniciar sesión</h2>
        <p className="auth-sub">Ingresa con tu usuario o correo electrónico</p>
        {error && <div className="error">{error}</div>}
        {okMessage && <div className="ok">{okMessage}</div>}

        <form onSubmit={iniciarSesion}>
          <label>Usuario o correo
            <input placeholder="Usuario o correo" value={loginUsuario} onChange={e => setLoginUsuario(e.target.value)} />
          </label>
          <label>Contraseña
            <input placeholder="Contraseña" type="password" value={loginClave} onChange={e => setLoginClave(e.target.value)} />
          </label>
          <button type="submit">Entrar</button>
        </form>
        <p className="cambiar">
          ¿No tienes cuenta? <Link className="enlace" to="/registro">Crear una cuenta</Link>
        </p>
      </section>
    </div>
  )
}
