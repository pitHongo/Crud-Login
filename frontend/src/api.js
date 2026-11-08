// Ayudas comunes para hablar con la API (así cada página no repite lo mismo).
// En producción la dirección viene de VITE_API_URL; en tu PC se usa localhost.
export const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Datos de la sesión guardados en el navegador al iniciar sesión.
export const sesion = {
  token: () => localStorage.getItem('token'),
  usuario: () => localStorage.getItem('usuario') || '',
  rol: () => localStorage.getItem('rol') || '',
  cerrar: () => localStorage.clear(),
}

// Hace una petición con el token y devuelve { ok, status, data }.
// Si el servidor dice 401 (sesión vencida), cierra la sesión y vuelve al login.
export async function pedir(ruta, { metodo = 'GET', cuerpo } = {}) {
  const res = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Authorization: `Token ${sesion.token()}` },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  if (res.status === 401) {
    sesion.cerrar()
    window.location.href = '/login'
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, data }
}

// Convierte los errores de la API en un texto legible para mostrar en pantalla.
export function mensajeError(data) {
  if (!data) return 'No se pudo completar la acción.'
  if (data.detail) return data.detail
  return Object.values(data).flat().join(' ')
}
