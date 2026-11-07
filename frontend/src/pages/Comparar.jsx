import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { pedir, mensajeError } from '../api'
import { dinero, porcentaje, fechaCorta } from '../formato'

// Filas de la tabla. Las que tienen "campo" resaltan en verde el mejor (mayor) valor.
const FILAS = [
  { etiqueta: 'Fecha', valor: e => fechaCorta(e.fecha) },
  { etiqueta: 'Recinto', valor: e => `${e.recinto} (${e.ciudad})` },
  { etiqueta: 'Aforo', valor: e => e.aforo.toLocaleString('en-US') },
  { etiqueta: 'Asistencia', campo: 'asistencia', valor: e => e.asistencia.toLocaleString('en-US') },
  { etiqueta: 'Ocupación', campo: 'ocupacion', valor: e => porcentaje(e.ocupacion) },
  { etiqueta: 'Nivel', valor: e => <span className={`nivel nivel-${e.nivel.toLowerCase()}`}>{e.nivel}</span> },
  { etiqueta: 'Ingresos por entradas', campo: 'ingresos_entradas', valor: e => dinero(e.ingresos_entradas) },
  { etiqueta: 'Ingresos por merchandising', campo: 'ingresos_merch', valor: e => dinero(e.ingresos_merch) },
  { etiqueta: 'Ingresos totales', campo: 'ingresos_totales', valor: e => dinero(e.ingresos_totales) },
  { etiqueta: 'Ingreso por asistente', campo: 'ingreso_por_asistente', valor: e => dinero(e.ingreso_por_asistente, 2) },
]

export default function Comparar() {
  const [disponibles, setDisponibles] = useState([])   // eventos Realizados que se pueden comparar
  const [elegidos, setElegidos] = useState(['', '', ''])
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { cargarDisponibles() }, [])

  async function cargarDisponibles() {
    const r = await pedir('/rendimiento/')
    if (r.ok) setDisponibles([...r.data.eventos].sort((a, b) => a.fecha.localeCompare(b.fecha)))
  }

  function elegir(posicion, valor) {
    const copia = [...elegidos]
    copia[posicion] = valor
    setElegidos(copia)
  }

  async function comparar(e) {
    e.preventDefault()
    const r = await pedir(`/comparar/?ids=${elegidos.filter(Boolean).join(',')}`)
    if (!r.ok) { setError(mensajeError(r.data)); setResultado(null); return }
    setError('')
    setResultado(r.data)
  }

  return (
    <div className="contenedor ancho">
      <Navbar />
      <h1>Comparar eventos</h1>
      {error && <div className="error">{error}</div>}
      {disponibles.length < 2 && <p className="vacio">Se necesitan al menos 2 eventos realizados para comparar.</p>}

      <form className="filtros" onSubmit={comparar}>
        {elegidos.map((valor, i) => (
          <label key={i}>Evento {i + 1}{i === 2 ? ' (opcional)' : ''}
            <select value={valor} onChange={e => elegir(i, e.target.value)}>
              <option value="">Elegir...</option>
              {disponibles.map(ev => (
                <option key={ev.id} value={ev.id}
                  disabled={elegidos.some((otro, j) => j !== i && otro === String(ev.id))}>
                  {ev.nombre} - {fechaCorta(ev.fecha)}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button type="submit">Comparar</button>
      </form>

      {resultado && (
        <>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Métrica</th>
                  {resultado.map(ev => <th key={ev.id} className="num">{ev.nombre}</th>)}
                </tr>
              </thead>
              <tbody>
                {FILAS.map(fila => {
                  const mejor = fila.campo ? Math.max(...resultado.map(ev => ev[fila.campo])) : null
                  return (
                    <tr key={fila.etiqueta}>
                      <td>{fila.etiqueta}</td>
                      {resultado.map(ev => (
                        <td key={ev.id} className={`num ${fila.campo && ev[fila.campo] === mejor ? 'mejor' : ''}`}>
                          {fila.valor(ev)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="cambiar">Verde: mejor valor entre los eventos comparados.</p>
        </>
      )}
    </div>
  )
}
