import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API = 'http://localhost:8000/api'

export default function Registro() {
  const [reg, setReg] = useState({
    nombre: '', apellido: '', correo: '', celular: '', usuario: '', clave: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const cambiarReg = e => setReg({ ...reg, [e.target.name]: e.target.value })

  async function registrar(e) {
    e.preventDefault()
    setError('')
    if (Object.values(reg).some(v => !v.trim())) {
      setError('Todos los campos son obligatorios.'); return
    }
    if (reg.clave.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.'); return
    }
    const res = await fetch(`${API}/registro/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reg),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.detail || 'No se pudo crear la cuenta.'); return }
    
    // Si se crea, redirigir al login
    navigate('/login', { state: { mensaje: 'Cuenta creada exitosamente. Ahora inicia sesión.' } })
  }

  return (
    <div className="contenedor">
      <h1>Torneo Regional de MMA</h1>
      {error && <div className="error">{error}</div>}
      
      <h3>Crear cuenta</h3>
      <form className="formulario columna" onSubmit={registrar}>
        <input name="nombre" placeholder="Nombre" value={reg.nombre} onChange={cambiarReg} />
        <input name="apellido" placeholder="Apellido" value={reg.apellido} onChange={cambiarReg} />
        <input name="correo" type="email" placeholder="Correo electrónico" value={reg.correo} onChange={cambiarReg} />
        <input name="celular" placeholder="Número de celular" value={reg.celular} onChange={cambiarReg} />
        <input name="usuario" placeholder="Nombre de usuario (único)" value={reg.usuario} onChange={cambiarReg} />
        <input name="clave" type="password" placeholder="Contraseña (mínimo 8 caracteres)" value={reg.clave} onChange={cambiarReg} />
        <button type="submit">Registrarme</button>
      </form>
      <p className="cambiar">
        ¿Ya tienes cuenta? <Link className="enlace" to="/login">Iniciar sesión</Link>
      </p>
    </div>
  )
}
