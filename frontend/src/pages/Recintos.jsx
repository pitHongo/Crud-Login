import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { pedir, mensajeError, sesion } from '../api'

const VACIO = { nombre: '', ciudad: '', aforo: '' }

export default function Recintos() {
  const esAdmin = sesion.rol() === 'administrador'
  const [recintos, setRecintos] = useState([])
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null)   // id del recinto que se edita (null = crear uno nuevo)
  const [error, setError] = useState('')

  useEffect(() => { leer() }, [])

  async function leer() {
    const r = await pedir('/recintos/')
    if (r.ok) setRecintos(r.data)
  }

  const cambiar = e => setForm({ ...form, [e.target.name]: e.target.value })

  async function guardar(e) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.ciudad.trim() || !form.aforo) { setError('Completa todos los campos.'); return }
    const cuerpo = { nombre: form.nombre.trim(), ciudad: form.ciudad.trim(), aforo: Number(form.aforo) }
    const r = editando
      ? await pedir(`/recintos/${editando}/`, { metodo: 'PUT', cuerpo })
      : await pedir('/recintos/', { metodo: 'POST', cuerpo })
    if (!r.ok) { setError(mensajeError(r.data)); return }
    cancelar()
    leer()
  }

  function editar(r) {
    setEditando(r.id)
    setForm({ nombre: r.nombre, ciudad: r.ciudad, aforo: String(r.aforo) })
    setError('')
  }

  function cancelar() {
    setEditando(null)
    setForm(VACIO)
    setError('')
  }

  async function eliminar(r) {
    if (!window.confirm(`¿Eliminar ${r.nombre}?`)) return
    const res = await pedir(`/recintos/${r.id}/`, { metodo: 'DELETE' })
    if (!res.ok) { setError(mensajeError(res.data)); return }
    leer()
  }

  return (
    <div className="contenedor ancho">
      <Navbar />
      <h1>Recintos</h1>
      {error && <div className="error">{error}</div>}

      {esAdmin ? (
        <form className="formulario" onSubmit={guardar}>
          <input name="nombre" placeholder="Nombre del recinto" value={form.nombre} onChange={cambiar} />
          <input name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={cambiar} />
          <input name="aforo" type="number" min="1" placeholder="Aforo (capacidad)" value={form.aforo} onChange={cambiar} />
          <button type="submit">{editando ? 'Guardar cambios' : 'Agregar'}</button>
          {editando && <button type="button" className="btn-salir" onClick={cancelar}>Cancelar</button>}
        </form>
      ) : (
        <p className="cambiar">Solo el Administrador puede crear o modificar recintos.</p>
      )}

      {recintos.length === 0 ? (
        <p className="vacio">No hay recintos registrados.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th><th>Ciudad</th><th className="num">Aforo</th>
                {esAdmin && <th className="num">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {recintos.map(r => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>{r.ciudad}</td>
                  <td className="num">{r.aforo.toLocaleString('en-US')}</td>
                  {esAdmin && (
                    <td className="num acciones">
                      <button className="btn-estado" onClick={() => editar(r)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => eliminar(r)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
