import { NavLink, useNavigate } from 'react-router-dom'
import { sesion } from '../api'

const TODOS = ['administrador', 'organizador', 'inversor']
const GESTION = ['administrador', 'organizador']

// Opciones del menú. Cada una indica qué roles la pueden ver.
const OPCIONES = [
  { ruta: '/rendimiento', texto: 'Rendimiento', roles: TODOS },
  { ruta: '/comparar', texto: 'Comparar', roles: TODOS },
  { ruta: '/eventos', texto: 'Eventos', roles: GESTION },
  { ruta: '/recintos', texto: 'Recintos', roles: GESTION },
  { ruta: '/gimnasios', texto: 'Gimnasios', roles: GESTION },
  { ruta: '/crud', texto: 'Peleadores', roles: GESTION },
]

const NOMBRE_ROL = { administrador: 'Administrador', organizador: 'Organizador', inversor: 'Inversor' }

export default function Navbar() {
  const navigate = useNavigate()
  const rol = sesion.rol()

  function salir() {
    sesion.cerrar()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <nav>
        {OPCIONES.filter(o => o.roles.includes(rol)).map(o => (
          <NavLink key={o.ruta} to={o.ruta} className={({ isActive }) => (isActive ? 'activo' : '')}>
            {o.texto}
          </NavLink>
        ))}
      </nav>
      <div className="usuario">
        <span>👤 {sesion.usuario()} · {NOMBRE_ROL[rol] || 'Sin rol'}</span>
        <button className="btn-salir" onClick={salir}>Cerrar sesión</button>
      </div>
    </header>
  )
}
