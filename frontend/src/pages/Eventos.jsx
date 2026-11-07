import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import EventoDetalle from '../components/EventoDetalle'
import { pedir, mensajeError } from '../api'
import { fechaCorta, ESTADOS } from '../formato'

const VACIO = { nombre: '', fecha: '', recinto: '' }

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [recintos, setRecintos] = useState([])
  const [form, setForm] = useState(VACIO)
  const [ciudad, setCiudad] = useState('')   // filtro: el recinto depende de la ciudad elegida
  const [seleccionado, setSeleccionado] = useState(null)   // id del evento que se está gestionando
  const [error, setError] = useState('')

  useEffect(() => {
    leer()
    leerRecintos()
  }, [])

  async function leer() {
    const r = await pedir('/eventos/')
    if (r.ok) setEventos(r.data)
  }

  async function leerRecintos() {
    const r = await pedir('/recintos/')
    if (r.ok) setRecintos(r.data)
  }

  const cambiar = e => setForm({ ...form, [e.target.name]: e.target.value })

  // Dropdowns en cascada: la ciudad filtra los recintos; al cambiar de ciudad se reinicia el recinto.
  const ciudades = [...new Set(recintos.map(r => r.ciudad))].sort()
  const recintosDeCiudad = recintos.filter(r => r.ciudad === ciudad)
  const elegirCiudad = e => { setCiudad(e.target.value); setForm({ ...form, recinto: '' }) }

  async function crear(e) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.fecha || !form.recinto) { setError('Completa todos los campos.'); return }
    const r = await pedir('/eventos/', {
      metodo: 'POST',
      cuerpo: { nombre: form.nombre.trim(), fecha: form.fecha, recinto: Number(form.recinto) },
    })
    if (!r.ok) { setError(mensajeError(r.data)); return }
    setError('')
    setForm(VACIO)
    setCiudad('')
    leer()
  }

  async function eliminar(ev) {
    if (!window.confirm(`¿Eliminar ${ev.nombre} y sus ventas?`)) return
    await pedir(`/eventos/${ev.id}/`, { metodo: 'DELETE' })
    if (seleccionado === ev.id) setSeleccionado(null)
    leer()
  }

  const elegido = eventos.find(ev => ev.id === seleccionado)
  const aforo = elegido ? recintos.find(r => r.id === elegido.recinto)?.aforo : null

  return (
    <div className="contenedor ancho">
      <Navbar />
      <h1>Eventos</h1>
      {error && <div className="error">{error}</div>}

      <form className="formulario" onSubmit={crear}>
        <input name="nombre" placeholder="Nombre del evento" value={form.nombre} onChange={cambiar} />
        <input name="fecha" type="date" value={form.fecha} onChange={cambiar} />
        <select value={ciudad} onChange={elegirCiudad}>
          <option value="">Ciudad...</option>
          {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="recinto" value={form.recinto} onChange={cambiar} disabled={!ciudad}>
          <option value="">Recinto...</option>
          {recintosDeCiudad.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <button type="submit">Crear evento</button>
      </form>

      {eventos.length === 0 ? (
        <p className="vacio">No hay eventos registrados aún.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Evento</th><th>Fecha</th><th>Recinto</th><th>Estado</th>
                <th className="num">Asistencia</th><th className="num">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map(ev => (
                <tr key={ev.id}>
                  <td>{ev.nombre}</td>
                  <td>{fechaCorta(ev.fecha)}</td>
                  <td>{ev.recinto_nombre}</td>
                  <td><span className={`estado estado-${ev.estado}`}>{ESTADOS[ev.estado]}</span></td>
                  <td className="num">{ev.asistencia.toLocaleString('en-US')}</td>
                  <td className="num acciones">
                    <button className="btn-estado" onClick={() => setSeleccionado(ev.id)}>Gestionar</button>
                    <button className="btn-eliminar" onClick={() => eliminar(ev)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {elegido && (
        <EventoDetalle evento={elegido} aforo={aforo} alCambiar={leer} alCerrar={() => setSeleccionado(null)} />
      )}
    </div>
  )
}
