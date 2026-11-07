// Formatos para mostrar números y fechas (los usan varias páginas).
export const dinero = (n, decimales = 0) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}`

export const porcentaje = n => `${Number(n).toFixed(1)} %`

// '2026-09-05' -> '05/09/2026'
export const fechaCorta = f => f.split('-').reverse().join('/')

export const ESTADOS = { programado: 'Programado', realizado: 'Realizado', cancelado: 'Cancelado' }

// Nivel de ocupación: misma regla que backend/torneo/servicios.py (Alta >= 80, Media >= 50, Baja < 50).
export const nivelOcupacion = o => (o >= 80 ? 'Alta' : o >= 50 ? 'Media' : 'Baja')
