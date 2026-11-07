import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { pedir, mensajeError } from '../api'

const VACIO = { nombre: '', ciudad: '' }

// Gimnasios o clubes: alimentan el dropdown de la pantalla Peleadores.
export default function Gimnasios() {
  const [gimnasios, setGimnasios] = useState([])
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null)   // id del gimnasio que se edita (null = crear uno nuevo)
  const [error, setError] = useState('')

  useEffect(() => { leer() }, [])

  async function leer() {
    const r = await pedir('/gimnasios/')
    if (r.ok) setGimnasios(r.data)
  }

  const cambiar = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function guardar(e) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.ciudad.trim()) { setError('Completa todos los campos.'); return }
    const cuerpo = { nombre: form.nombre.trim(), ciudad: form.ciudad.trim() }
    const r = editando
      ? await pedir(`/gimnasios/${editando}/`, { metodo: 'PUT', cuerpo })
      : await pedir('/gimnasios/', { metodo: 'POST', cuerpo })
    if (!r.ok) { setError(mensajeError(r.data)); return }
    cancelar()
    leer()
  }

  function editar(g) {
    setEditando(g.id)
    setForm({ nombre: g.nombre, ciudad: g.ciudad })
    setError('')
  }

  function cancelar() {
    setEditando(null)
    setForm(VACIO)
    setError('')
  }

  async function eliminar(g) {
    if (!window.confirm(`¿Eliminar ${g.nombre}?`)) return
    const res = await pedir(`/gimnasios/${g.id}/`, { metodo: 'DELETE' })
    if (!res.ok) { setError(mensajeError(res.data)); return }
    leer()
  }

  return (
    <div className="contenedor ancho">
      <Navbar />
      <h1>Gimnasios</h1>
      {error && <div className="error">{error}</div>}

      <form className="formulario" onSubmit={guardar}>
        <input name="nombre" placeholder="Nombre del gimnasio o club" value={form.nombre} onChange={cambiar} />
        <input name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={cambiar} />
        <button type="submit">{editando ? 'Guardar cambios' : 'Agregar'}</button>
        {editando && <button type="button" className="btn-salir" onClick={cancelar}>Cancelar</button>}
      </form>

      {gimnasios.length === 0 ? (
        <p className="vacio">No hay gimnasios registrados.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr><th>Nombre</th><th>Ciudad</th><th className="num">Acciones</th></tr>
            </thead>
            <tbody>
              {gimnasios.map(g => (
                <tr key={g.id}>
                  <td>{g.nombre}</td>
                  <td>{g.ciudad}</td>
                  <td className="num acciones">
                    <button className="btn-estado" onClick={() => editar(g)}>Editar</button>
                    <button className="btn-eliminar" onClick={() => eliminar(g)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
