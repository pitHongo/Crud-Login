import { useState, useEffect } from 'react'
import { pedir, mensajeError } from '../api'
import { dinero, porcentaje, fechaCorta, nivelOcupacion, ESTADOS } from '../formato'

const VENTA_VACIA = { tipo: 'entrada', descripcion: '', cantidad: '1', precio: '' }
const TIPOS = { entrada: 'Entrada', merchandising: 'Merchandising' }

// Panel para gestionar un evento: asistencia, ventas y estado.
export default function EventoDetalle({ evento, aforo, alCambiar, alCerrar }) {
  const [asistencia, setAsistencia] = useState(String(evento.asistencia))
  const [ventas, setVentas] = useState([])
  const [venta, setVenta] = useState(VENTA_VACIA)
  const [error, setError] = useState('')

  // Al elegir otro evento: reinicia el panel y carga sus ventas.
  useEffect(() => {
    setAsistencia(String(evento.asistencia))
    setVenta(VENTA_VACIA)
    setError('')
    leerVentas()
  }, [evento.id])

  async function leerVentas() {
    const r = await pedir(`/ventas/?evento=${evento.id}`)
    if (r.ok) setVentas(r.data)
  }

  // Cambia la asistencia o el estado del evento y avisa a la lista para que se actualice.
  async function actualizar(cambios) {
    const r = await pedir(`/eventos/${evento.id}/`, { metodo: 'PATCH', cuerpo: cambios })
    if (!r.ok) { setError(mensajeError(r.data)); return }
    setError('')
    alCambiar()
  }

  function cambiarEstado(estado) {
    if (estado === 'realizado' && evento.asistencia === 0) {
      setError('Registra la asistencia antes de marcar el evento como Realizado.')
      return
    }
    actualizar({ estado })
  }

  async function agregarVenta(e) {
    e.preventDefault()
    if (venta.precio === '') { setError('Escribe el precio por unidad.'); return }
    const r = await pedir('/ventas/', {
      metodo: 'POST',
      cuerpo: { evento: evento.id, tipo: venta.tipo, descripcion: venta.descripcion.trim(),
                cantidad: Number(venta.cantidad), precio_unitario: venta.precio },
    })
    if (!r.ok) { setError(mensajeError(r.data)); return }
    setError('')
    setVenta(VENTA_VACIA)
    leerVentas()
  }

  async function eliminarVenta(v) {
    await pedir(`/ventas/${v.id}/`, { metodo: 'DELETE' })
    leerVentas()
  }

  const cambiarVenta = e => setVenta({ ...venta, [e.target.name]: e.target.value })
  const suma = tipo => ventas.filter(v => v.tipo === tipo).reduce((total, v) => total + Number(v.monto), 0)
  const entradas = suma('entrada')
  const entradasVendidas = ventas.filter(v => v.tipo === 'entrada').reduce((total, v) => total + v.cantidad, 0)
  const totalLinea = Number(venta.cantidad || 0) * Number(venta.precio || 0)   // vista previa del total de la venta
  const merch = suma('merchandising')
  const ocupacion = aforo ? (Number(asistencia || 0) / aforo) * 100 : 0

  return (
    <div className="panel">
      <div className="panel-cabecera">
        <h3>{evento.nombre} <span className={`estado estado-${evento.estado}`}>{ESTADOS[evento.estado]}</span></h3>
        <button className="btn-salir" onClick={alCerrar}>Cerrar</button>
      </div>
      <p className="datos">
        Recinto: {evento.recinto_nombre} · Fecha: {fechaCorta(evento.fecha)} · Aforo: {aforo ? aforo.toLocaleString('en-US') : '-'}
      </p>
      {error && <div className="error">{error}</div>}

      <h3 className="subtitulo">Asistencia</h3>
      <div className="formulario">
        <input type="number" min="0" placeholder="Asistencia (personas)" value={asistencia}
               onChange={e => setAsistencia(e.target.value)} />
        <button type="button" onClick={() => actualizar({ asistencia: Number(asistencia || 0) })}>Guardar asistencia</button>
      </div>
      <p className="datos">
        Ocupación calculada: <strong>{porcentaje(ocupacion)}</strong> · Nivel:{' '}
        <span className={`nivel nivel-${nivelOcupacion(ocupacion).toLowerCase()}`}>{nivelOcupacion(ocupacion)}</span>
      </p>

      <h3 className="subtitulo">Ventas del evento</h3>
      <form className="formulario" onSubmit={agregarVenta}>
        <select name="tipo" value={venta.tipo} onChange={cambiarVenta}>
          <option value="entrada">Entrada</option>
          <option value="merchandising">Merchandising</option>
        </select>
        <input name="descripcion" placeholder="Descripción (General, VIP, Camisetas...)" value={venta.descripcion} onChange={cambiarVenta} />
        <input name="cantidad" type="number" min="1" placeholder="Cantidad" value={venta.cantidad} onChange={cambiarVenta} />
        <input name="precio" type="number" min="0" step="0.01" placeholder="Precio por unidad ($)" value={venta.precio} onChange={cambiarVenta} />
        <button type="submit">Agregar venta</button>
      </form>
      <p className="datos">Total de esta venta: <strong>{dinero(totalLinea, 2)}</strong> (cantidad × precio por unidad)</p>

      {ventas.length === 0 ? (
        <p className="vacio">Este evento aún no tiene ventas registradas.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr><th>Tipo</th><th>Descripción</th><th className="num">Cantidad</th><th className="num">Precio unidad</th><th className="num">Total</th><th className="num">Acciones</th></tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                  <td>{TIPOS[v.tipo]}</td>
                  <td>{v.descripcion}</td>
                  <td className="num">{v.cantidad.toLocaleString('en-US')}</td>
                  <td className="num">{v.precio_unitario === null ? '-' : dinero(v.precio_unitario, 2)}</td>
                  <td className="num">{dinero(v.monto, 2)}</td>
                  <td className="num acciones"><button className="btn-eliminar" onClick={() => eliminarVenta(v)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="datos">
        Entradas vendidas: <strong>{entradasVendidas.toLocaleString('en-US')}</strong>
        {aforo ? <> de {aforo.toLocaleString('en-US')} ({porcentaje((entradasVendidas / aforo) * 100)} del aforo)</> : null}
      </p>
      <p className="datos">
        Total entradas: <strong>{dinero(entradas, 2)}</strong> · Total merchandising: <strong>{dinero(merch, 2)}</strong> ·
        Ingresos totales: <strong>{dinero(entradas + merch, 2)}</strong>
      </p>

      <div className="acciones">
        {evento.estado === 'programado' ? (
          <>
            <button onClick={() => cambiarEstado('realizado')}>Marcar como Realizado</button>
            <button className="btn-eliminar" onClick={() => cambiarEstado('cancelado')}>Cancelar evento</button>
          </>
        ) : (
          <button className="btn-estado" onClick={() => cambiarEstado('programado')}>Volver a Programado</button>
        )}
      </div>
      <p className="cambiar">Al marcar el evento como Realizado queda habilitado para el análisis de rendimiento.</p>
    </div>
  )
}
