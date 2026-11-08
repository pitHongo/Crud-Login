import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { API } from '../api'

// ==========================================
// VISTA (V) del patrón MVC: Interfaz gráfica
// ==========================================

export default function Crud() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  
  const [peleadores, setPeleadores] = useState([])
  const [nombre, setNombre] = useState('')
  const [gimnasios, setGimnasios] = useState([])
  const [gym, setGym] = useState('')   // id del gimnasio elegido en el dropdown
  const [error, setError] = useState('')

  const cabeceras = () => ({ 'Content-Type': 'application/json', 'Authorization': `Token ${token}` })

  // Cargar datos al iniciar
  useEffect(() => { 
    if (token) {
      leer()
      leerGimnasios()
    }
  }, [])

  async function leer() {
    const res = await fetch(`${API}/peleadores/`, { headers: cabeceras() })
    if (res.status === 401) { salir(); return }
    setPeleadores(await res.json())
  }

  async function leerGimnasios() {
    const res = await fetch(`${API}/gimnasios/`, { headers: cabeceras() })
    if (res.ok) setGimnasios(await res.json())
  }

  function salir() {
    localStorage.clear()
    navigate('/login')
  }

  async function crear(e) {
    e.preventDefault()
    if (!nombre.trim() || !gym) { setError('Completa todos los campos.'); return }
    setError('')
    await fetch(`${API}/peleadores/`, {
      method: 'POST', headers: cabeceras(),
      body: JSON.stringify({ nombre, gimnasio: Number(gym) }),
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

  return (
    <div className="contenedor ancho">
      <Navbar />
      <h1>FightMetrics</h1>
      {error && <div className="error">{error}</div>}

      <form className="formulario" onSubmit={crear}>
        <input placeholder="Nombre del peleador" value={nombre} onChange={e => setNombre(e.target.value)} />
        <select value={gym} onChange={e => setGym(e.target.value)}>
          <option value="">Gimnasio o Club...</option>
          {gimnasios.map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.ciudad})</option>)}
        </select>
        <button type="submit">Inscribir</button>
      </form>

      <h3>Lista Oficial de Competidores</h3>
      <ul>
        {peleadores.length === 0 && <li className="vacio">No hay competidores inscritos aún.</li>}
        {peleadores.map(p => (
          <li key={p.id} className={p.apto_medico ? '' : 'baja-medica'}>
            <div className="info-peleador">
              <span className="nombre">{p.nombre}</span>
              <span className="gym">Gym: {p.gimnasio_nombre} | Estado: {p.apto_medico ? '🟢 Apto' : '🔴 Baja Médica'}</span>
            </div>
            <div className="acciones">
              <button className="btn-estado" onClick={() => cambiarEstado(p)}>Estado Médico</button>
              <button className="btn-eliminar" onClick={() => eliminar(p)}>Retirar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
