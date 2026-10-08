import { useState, useEffect } from 'react'

const API = 'http://localhost:8000/api'

export default function App() {
  // ----- Estados de sesión -----
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [usuarioActivo, setUsuarioActivo] = useState(localStorage.getItem('usuario') || '')

  // "login" o "registro": decide qué pantalla se ve cuando no hay sesión
  const [pantalla, setPantalla] = useState('login')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  // ----- Campos del login -----
  const [loginUsuario, setLoginUsuario] = useState('')   // acepta usuario O correo
  const [loginClave, setLoginClave] = useState('')

  // ----- Campos del registro -----
  const [reg, setReg] = useState({
    nombre: '', apellido: '', correo: '', celular: '', usuario: '', clave: '',
  })
  const cambiarReg = e => setReg({ ...reg, [e.target.name]: e.target.value })

  // ----- Campos y lista del CRUD -----
  const [nombre, setNombre] = useState('')
  const [gym, setGym] = useState('')
  const [peleadores, setPeleadores] = useState([])

  const cabeceras = () => ({ 'Content-Type': 'application/json', 'Authorization': `Token ${token}` })

  useEffect(() => { if (token) leer() }, [])

  // ================= REGISTRO =================
  async function registrar(e) {
    e.preventDefault()
    setError(''); setOk('')
    // Validación rápida en el navegador (el backend igual valida)
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
    // Cuenta creada: volvemos al login con un mensaje verde
    setOk('Cuenta creada. Ahora inicia sesión.')
    setPantalla('login')
    setReg({ nombre: '', apellido: '', correo: '', celular: '', usuario: '', clave: '' })
  }

  // ================= LOGIN / LOGOUT =================
  async function iniciarSesion(e) {
    e.preventDefault()
    setError(''); setOk('')
    const res = await fetch(`${API}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsuario, password: loginClave }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.detail || 'Error al iniciar sesión.'); return }
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', data.username)
    setToken(data.token)
    setUsuarioActivo(data.username)
    setLoginClave('')
    leer(data.token)
  }

  function salir() {
    localStorage.clear()
    setToken(null)
    setPeleadores([])
    setPantalla('login')
  }

  // ================= CRUD =================
  async function leer(t = token) {
    const res = await fetch(`${API}/peleadores/`, { headers: { 'Authorization': `Token ${t}` } })
    if (res.status === 401) { salir(); return }
    setPeleadores(await res.json())
  }

  async function crear(e) {
    e.preventDefault()
    if (!nombre.trim() || !gym.trim()) { setError('Completa todos los campos.'); return }
    setError('')
    await fetch(`${API}/peleadores/`, {
      method: 'POST', headers: cabeceras(),
      body: JSON.stringify({ nombre, gimnasio: gym }),
    })
    setNombre(''); setGym(''); leer()
  }

  async function cambiarEstado(p) {
    await fetch(`${API}/peleadores/${p.id}/`, {
      method: 'PATCH', headers: cabeceras(),
      body: JSON.stringify({ apto_medico: !p.apto_medico }),
    })
    leer()
  }

  async function eliminar(p) {
    await fetch(`${API}/peleadores/${p.id}/`, { method: 'DELETE', headers: cabeceras() })
    leer()
  }

  // ================= PANTALLA =================
  return (
    <div className="contenedor">
      <h1>Torneo Regional de MMA</h1>
      {error && <div className="error">{error}</div>}
      {ok && <div className="ok">{ok}</div>}

      {/* ---------- SIN SESIÓN: login o registro ---------- */}
      {!token && pantalla === 'login' && (
        <>
          <h3>Iniciar sesión</h3>
          <form className="formulario columna" onSubmit={iniciarSesion}>
            <input placeholder="Usuario o correo" value={loginUsuario} onChange={e => setLoginUsuario(e.target.value)} />
            <input placeholder="Contraseña" type="password" value={loginClave} onChange={e => setLoginClave(e.target.value)} />
            <button type="submit">Entrar</button>
          </form>
          <p className="cambiar">
            ¿No tienes cuenta?{' '}
            <button className="enlace" onClick={() => { setPantalla('registro'); setError(''); setOk('') }}>
              Crear una cuenta
            </button>
          </p>
        </>
      )}

      {!token && pantalla === 'registro' && (
        <>
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
            ¿Ya tienes cuenta?{' '}
            <button className="enlace" onClick={() => { setPantalla('login'); setError(''); setOk('') }}>
              Iniciar sesión
            </button>
          </p>
        </>
      )}

      {/* ---------- CON SESIÓN: el CRUD ---------- */}
      {token && (
        <>
          <div className="barra">
            <span>👤 {usuarioActivo}</span>
            <button className="btn-salir" onClick={salir}>Cerrar sesión</button>
          </div>

          <form className="formulario" onSubmit={crear}>
            <input placeholder="Nombre del peleador" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input placeholder="Gimnasio o Club" value={gym} onChange={e => setGym(e.target.value)} />
            <button type="submit">Inscribir</button>
          </form>

          <h3>Lista Oficial de Competidores</h3>
          <ul>
            {peleadores.length === 0 && <li className="vacio">No hay competidores inscritos aún.</li>}
            {peleadores.map(p => (
              <li key={p.id} className={p.apto_medico ? '' : 'baja-medica'}>
                <div className="info-peleador">
                  <span className="nombre">{p.nombre}</span>
                  <span className="gym">Gym: {p.gimnasio} | Estado: {p.apto_medico ? '🟢 Apto' : '🔴 Baja Médica'}</span>
                </div>
                <div className="acciones">
                  <button className="btn-estado" onClick={() => cambiarEstado(p)}>Estado Médico</button>
                  <button className="btn-eliminar" onClick={() => eliminar(p)}>Retirar</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
