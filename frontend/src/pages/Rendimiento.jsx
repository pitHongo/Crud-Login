import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { pedir, mensajeError } from '../api'
import { dinero, porcentaje, fechaCorta } from '../formato'

const SIN_FILTROS = { desde: '', hasta: '', ciudad: '', recinto: '', evento: '' }

export default function Rendimiento() {
  const [recintos, setRecintos] = useState([])
  const [eventos, setEventos] = useState([])   // eventos Realizados, para el selector de evento
  const [filtros, setFiltros] = useState(SIN_FILTROS)
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  // Al entrar: carga los recintos (para los selectores) y el rendimiento sin filtros.
  useEffect(() => {
    cargarRecintos()
    buscar(SIN_FILTROS, true)
  }, [])

  async function cargarRecintos() {
    const r = await pedir('/recintos/')
    if (r.ok) setRecintos(r.data)
  }

  async function buscar(f, primeraVez = false) {
    const params = new URLSearchParams(Object.entries(f).filter(([, valor]) => valor))
    const r = await pedir(`/rendimiento/?${params}`)
    if (!r.ok) { setError(mensajeError(r.data)); return }
    setError('')
    setDatos(r.data)
    if (primeraVez) setEventos(r.data.eventos)   // la consulta sin filtros trae todos los eventos Realizados
  }

  const cambiar = e => setFiltros({ ...filtros, [e.target.name]: e.target.value })

  function limpiar() {
    setFiltros(SIN_FILTROS)
    buscar(SIN_FILTROS)
  }

  const ciudades = [...new Set(recintos.map(r => r.ciudad))]
  const recintosVisibles = recintos.filter(r => !filtros.ciudad || r.ciudad === filtros.ciudad)
  const recintoElegido = recintos.find(r => r.id === Number(filtros.recinto))   // el nombre del recinto es único
  const eventosVisibles = eventos.filter(e =>
    (!filtros.ciudad || e.ciudad === filtros.ciudad) && (!recintoElegido || e.recinto === recintoElegido.nombre))

  return (
    <div className="contenedor ancho">
      <Navbar />
      <h1>Rendimiento de eventos</h1>
      {error && <div className="error">{error}</div>}

      <form className="filtros" onSubmit={e => { e.preventDefault(); buscar(filtros) }}>
        <label>Fecha de inicio
          <input type="date" name="desde" value={filtros.desde} onChange={cambiar} />
        </label>
        <label>Fecha de fin
          <input type="date" name="hasta" value={filtros.hasta} onChange={cambiar} />
        </label>
        <label>Ciudad
          <select name="ciudad" value={filtros.ciudad} onChange={cambiar}>
            <option value="">Todas</option>
            {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>Recinto
          <select name="recinto" value={filtros.recinto} onChange={cambiar}>
            <option value="">Todos</option>
            {recintosVisibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </label>
        <label>Evento
          <select name="evento" value={filtros.evento} onChange={cambiar}>
            <option value="">Todos</option>
            {eventosVisibles.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </label>
        <button type="submit">Buscar</button>
        <button type="button" className="btn-salir" onClick={limpiar}>Limpiar</button>
      </form>

      {datos && (
        <>
          <div className="kpis">
            <div className="kpi"><span>Eventos analizados</span><strong>{datos.resumen.eventos_analizados}</strong></div>
            <div className="kpi"><span>Ocupación promedio</span><strong>{porcentaje(datos.resumen.ocupacion_promedio)}</strong></div>
            <div className="kpi"><span>Ingresos totales</span><strong>{dinero(datos.resumen.ingresos_totales)}</strong></div>
            <div className="kpi"><span>Ingreso por asistente</span><strong>{dinero(datos.resumen.ingreso_por_asistente, 2)}</strong></div>
          </div>

          {datos.eventos.length === 0 ? (
            <p className="vacio">No hay eventos realizados para estos filtros.</p>
          ) : (
            <>
              <h3 className="subtitulo">Detalle por evento</h3>
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Evento</th><th>Fecha</th><th>Recinto</th>
                      <th className="num">Asistencia / Aforo</th><th className="num">Ocupación</th>
                      <th>Nivel</th><th className="num">Ingresos</th><th className="num">vs. promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.eventos.map(e => (
                      <tr key={e.id}>
                        <td>{e.nombre}</td>
                        <td>{fechaCorta(e.fecha)}</td>
                        <td>{e.recinto} ({e.ciudad})</td>
                        <td className="num">{e.asistencia.toLocaleString('en-US')} / {e.aforo.toLocaleString('en-US')}</td>
                        <td className="num">{porcentaje(e.ocupacion)}</td>
                        <td><span className={`nivel nivel-${e.nivel.toLowerCase()}`}>{e.nivel}</span></td>
                        <td className="num">{dinero(e.ingresos_totales)}</td>
                        <td className={`num ${e.diferencia_vs_promedio >= 0 ? 'positivo' : 'negativo'}`}>
                          {e.diferencia_vs_promedio > 0 ? '+' : ''}{e.diferencia_vs_promedio} pp
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="subtitulo">Ranking de recintos por ocupación promedio</h3>
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>#</th><th>Recinto</th><th>Ciudad</th>
                      <th className="num">Eventos</th><th className="num">Ocupación prom.</th><th className="num">Ingresos totales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.ranking_recintos.map((r, i) => (
                      <tr key={r.recinto}>
                        <td>{i + 1}</td><td>{r.recinto}</td><td>{r.ciudad}</td>
                        <td className="num">{r.eventos}</td>
                        <td className="num">{porcentaje(r.ocupacion_promedio)}</td>
                        <td className="num">{dinero(r.ingresos_totales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="cambiar">pp = puntos porcentuales respecto a la ocupación promedio del período.</p>
            </>
          )}
        </>
      )}
    </div>
  )
}
