// src/api/ventaService.js

const apiUrl = 'http://localhost:8080/api/ventas'

// Helpers
const getAuthToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null

const getCurrentUser = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('usuario') || 'usuario_sistema'
    : 'usuario_sistema'

const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }
  return response
}

// Servicio de ventas
export const ventaService = {
  // 1. Registrar nueva venta
  async registrarVenta(ventaData) {
    const token   = getAuthToken()
    const usuario = getCurrentUser()
    if (!token) throw new Error('No se encontró token de autenticación')

    const dto = {
      productos: ventaData.productos.map((item) => ({
        productoId: item.producto.id,
        cantidad:   item.cantidad,
        precio:     item.producto.precio,
      })),
      metodoPago:    ventaData.metodoPago.toUpperCase(),
      descuento:     ventaData.descuento || 0,
      observaciones: ventaData.observaciones || '',
    }

    const res = await fetch(apiUrl, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${token}`,
        usuario,
      },
      body: JSON.stringify(dto),
    })

    await handleApiError(res)
    return res.json()
  },

  // 2. Obtener historial
  async obtenerHistorial() {
    const token = getAuthToken()
    if (!token) throw new Error('No se encontró token de autenticación')

    const res = await fetch(`${apiUrl}/historial`, {
      method:  'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    await handleApiError(res)
    return res.json()
  },

  // 3. Obtener estadísticas
  async obtenerEstadisticas() {
    const token = getAuthToken()
    if (!token) throw new Error('No se encontró token de autenticación')

    const res = await fetch(`${apiUrl}/estadisticas`, {
      method:  'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    await handleApiError(res)
    return res.json()
  },

  // 4. Reporte por día
  async obtenerReportePorDia() {
    const token = getAuthToken()
    if (!token) throw new Error('No se encontró token de autenticación')

    const res = await fetch(`${apiUrl}/reporte/por-dia`, {
      method:  'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    await handleApiError(res)
    return res.json()
  },

  // 5. Reporte por mes
  async obtenerReportePorMes() {
    const token = getAuthToken()
    if (!token) throw new Error('No se encontró token de autenticación')

    const res = await fetch(`${apiUrl}/reporte/por-mes`, {
      method:  'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    await handleApiError(res)
    return res.json()
  },

  // 6. Filtrar ventas por fecha (auxiliar en front)
  async filtrarVentasPorFecha(fechaInicio, fechaFin) {
    const historial = await this.obtenerHistorial()
    if (!fechaInicio && !fechaFin) return historial

    return historial.filter((venta) => {
      const fecha = new Date(venta.fecha)
      let ok = true

      if (fechaInicio) {
        ok = ok && fecha >= new Date(fechaInicio)
      }
      if (fechaFin) {
        const fin = new Date(fechaFin)
        fin.setHours(23, 59, 59, 999)
        ok = ok && fecha <= fin
      }
      return ok
    })
  },
}
