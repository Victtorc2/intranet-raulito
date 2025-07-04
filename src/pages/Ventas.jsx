"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  Eye,
  Printer,
  Filter,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  X,
  Loader,
  CalendarDays,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import "../styles/ventas.component.css"
import { ventaService } from "../api/ventaService"
import * as productoService from "../api/productoService"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Ventas = () => { 
  // Estados principales
  const [activeTab, setActiveTab] = useState("nueva")
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para búsqueda y sugerencias
  const [filteredProductos, setFilteredProductos] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Estados para nueva venta
  const [productosVenta, setProductosVenta] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [subtotal, setSubtotal] = useState(0)
  const [descuento, setDescuento] = useState(0)
  const [impuesto, setImpuesto] = useState(0)
  const [total, setTotal] = useState(0)
  const [observaciones, setObservaciones] = useState("")

  // Estados para historial
  const [ventasFiltradas, setVentasFiltradas] = useState([])
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    metodoPago: "",
    montoMinimo: 0,
  })

  // Estados de carga y modal
  const [processingPayment, setProcessingPayment] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState(null)
  const [notification, setNotification] = useState(null)

  const TASA_IMPUESTO = 0.18

  const formatFecha = (fechaISO) =>
    new Date(`${fechaISO}T00:00:00-05:00`).toLocaleDateString("es-PE");

  const formatHora = (fechaISO, horaStr) => {
    const iso = `${fechaISO}T${horaStr}-05:00`;
    return new Date(iso).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para manejar errores
  const handleError = useCallback((error, defaultMessage) => {
    console.error(error)
    const errorMessage = error.message || defaultMessage
    setError(errorMessage)

    // Limpiar error después de 5 segundos
    setTimeout(() => setError(null), 5000)

    return errorMessage
  }, [])

  // Mostrar notificación
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotification({ mensaje, tipo })
    setTimeout(() => setNotification(null), 5000)
  }

  // Funciones de carga de datos
  const cargarProductos = useCallback(
    async (filtros = {}) => {
      setLoading(true)
      setError(null)
      try {
        const data = await productoService.listarProductos(filtros)
        return data
      } catch (err) {
        handleError(err, "Error al cargar productos")
        return []
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const buscarProductos = useCallback(
  async (termino) => {
    if (!termino || termino.trim().length === 0) {
      return []
    }

    try {
      // Le pasamos el término como 'nombre' al listarProductos
      const data = await productoService.listarProductos(termino)
      return data
    } catch (err) {
      handleError(err, "Error al buscar productos")
      return []
    }
  },
  [handleError],
)

  const cargarHistorialVentas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ventaService.obtenerHistorial()
      setVentas(data)
      setVentasFiltradas(data)
      return data
    } catch (err) {
      handleError(err, "Error al cargar historial de ventas")
      return []
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const cargarEstadisticas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ventaService.obtenerEstadisticas()
      return data
    } catch (err) {
      handleError(err, "Error al cargar estadísticas")
      return null
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const registrarVenta = useCallback(
    async (ventaData) => {
      setLoading(true)
      setError(null)
      try {
        const result = await ventaService.registrarVenta(ventaData)

        // Recargar datos después de registrar
        await Promise.all([cargarHistorialVentas(), cargarEstadisticas()])

        return result
      } catch (err) {
        const errorMessage = handleError(err, "Error al registrar la venta")
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [handleError, cargarHistorialVentas, cargarEstadisticas],
  )

  const filtrarVentas = useCallback(
    async (filtros) => {
      setLoading(true)
      setError(null)
      try {
        let ventasFiltradas = [...ventas]

        // Filtrar por fecha
        if (filtros.fechaInicio || filtros.fechaFin) {
          ventasFiltradas = await ventaService.filtrarVentasPorFecha(filtros.fechaInicio, filtros.fechaFin)
        }

        // Filtrar por método de pago
        if (filtros.metodoPago) {
          ventasFiltradas = ventasFiltradas.filter(
            (venta) => venta.metodoPago.toLowerCase() === filtros.metodoPago.toLowerCase(),
          )
        }

        // Filtrar por monto mínimo
        if (filtros.montoMinimo > 0) {
          ventasFiltradas = ventasFiltradas.filter((venta) => venta.total >= filtros.montoMinimo)
        }

        return ventasFiltradas
      } catch (err) {
        handleError(err, "Error al filtrar ventas")
        return []
      } finally {
        setLoading(false)
      }
    },
    [ventas, handleError],
  )

  const verificarStock = useCallback(
    async (productoId, cantidad) => {
      try {
        return await productoService.verificarStock(productoId, cantidad)
      } catch (err) {
        handleError(err, "Error al verificar stock")
        return false
      }
    },
    [handleError],
  )

  // Efectos
  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    calcularTotales()
  }, [productosVenta, descuento])

  useEffect(() => {
    buscarProductosEnTiempoReal()
  }, [searchTerm])

  // Función para cargar datos iniciales
  const cargarDatosIniciales = async () => {
    try {
      await Promise.all([cargarProductos(), cargarHistorialVentas(), cargarEstadisticas()])
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error)
    }
  }

  // Búsqueda en tiempo real de productos
  const buscarProductosEnTiempoReal = async () => {
    if (searchTerm.length > 2) {
      try {
        const productos = await buscarProductos(searchTerm)
        setFilteredProductos(productos.slice(0, 5))
        setShowSuggestions(true)
      } catch (error) {
        console.error("Error en búsqueda:", error)
        setFilteredProductos([])
        setShowSuggestions(false)
      }
    } else {
      setFilteredProductos([])
      setShowSuggestions(false)
    }
  }

  // Funciones de manejo de productos
  const seleccionarProducto = (producto) => {
    setSelectedProduct(producto)
    setSearchTerm(producto.nombre)
    setShowSuggestions(false)
  }

  const agregarProducto = async () => {
    if (!selectedProduct || cantidad <= 0) {
      mostrarNotificacion("Seleccione un producto y cantidad válida", "error")
      return
    }

    // Verificar stock
    const stockDisponible = await verificarStock(selectedProduct.id, cantidad)
    if (!stockDisponible) {
      mostrarNotificacion(`Stock insuficiente. Stock disponible: ${selectedProduct.stock}`, "error")
      return
    }

    const index = productosVenta.findIndex((item) => item.producto.id === selectedProduct.id)

    if (index !== -1) {
      const cantidadTotal = productosVenta[index].cantidad + cantidad
      const stockSuficiente = await verificarStock(selectedProduct.id, cantidadTotal)

      if (!stockSuficiente) {
        mostrarNotificacion(`Stock insuficiente. Stock disponible: ${selectedProduct.stock}`, "error")
        return
      }

      const newProductos = [...productosVenta]
      newProductos[index].cantidad = cantidadTotal
      setProductosVenta(newProductos)
    } else {
      setProductosVenta([...productosVenta, { producto: selectedProduct, cantidad }])
    }

    setSearchTerm("")
    setSelectedProduct(null)
    setCantidad(1)
    mostrarNotificacion("Producto agregado correctamente", "success")
  }

  const eliminarProducto = (index) => {
    const newProductos = productosVenta.filter((_, i) => i !== index)
    setProductosVenta(newProductos)
    mostrarNotificacion("Producto eliminado", "success")
  }

  const calcularTotales = () => {
    const sub = productosVenta.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
    const imp = sub * TASA_IMPUESTO
    const tot = sub + imp - descuento

    setSubtotal(sub)
    setImpuesto(imp)
    setTotal(Math.max(0, tot))
  }

  // Funciones de pago
  const procesarPago = async (metodoPago) => {
    if (productosVenta.length === 0) {
      mostrarNotificacion("Agregue productos antes de procesar la venta", "error")
      return
    }

    setProcessingPayment(true)
    try {
      const ventaData = {
        productos: productosVenta,
        metodoPago: metodoPago,
        descuento: descuento,
        observaciones: observaciones,
        subtotal: subtotal,
        impuesto: impuesto,
        total: total,
      }

      const result = await registrarVenta(ventaData)

      mostrarNotificacion(
        `Venta procesada con éxito. ID: ${result.id} - Total: S/ ${result.total.toFixed(2)}`,
        "success",
      )

      cancelarVenta()
    } catch (error) {
      mostrarNotificacion(error.message || "Error al procesar la venta", "error")
    } finally {
      setProcessingPayment(false)
    }
  }

  const cancelarVenta = () => {
    setProductosVenta([])
    setSearchTerm("")
    setSelectedProduct(null)
    setCantidad(1)
    setDescuento(0)
    setObservaciones("")
  }

  // Funciones de filtrado
  const aplicarFiltros = async () => {
    try {
      const ventasFiltradas = await filtrarVentas(filtros)
      setVentasFiltradas(ventasFiltradas)
      mostrarNotificacion(`Se encontraron ${ventasFiltradas.length} ventas`, "success")
    } catch (error) {
      mostrarNotificacion("Error al aplicar filtros", error)
    }
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      metodoPago: "",
      montoMinimo: 0,
    })
    setVentasFiltradas(ventas)
    mostrarNotificacion("Filtros limpiados", "success")
  }

  // Funciones de modal
  const verDetalleVenta = (venta) => {
    setSelectedVenta(venta)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setSelectedVenta(null)
  }

  const exportarExcel = () => {
  if (ventasFiltradas.length === 0) {
    mostrarNotificacion("No hay ventas para exportar", "warning");
    return;
  }

  // 1) Preparamos los datos en forma de array de objetos
  const datosParaExcel = ventasFiltradas.map((venta) => {
    const fechaFormateada = formatFecha(venta.fecha);
    const horaFormateada = formatHora(venta.fecha, venta.hora);
    return {
      "ID Venta": venta.id,
      Fecha: fechaFormateada,
      Hora: horaFormateada,
      "Total (S/)": venta.total.toFixed(2),
      "Método": venta.metodoPago,
      "Cant. Productos": (venta.detalles?.length || 0),
    };
  });

  // 2) Creamos un libro de trabajo y una hoja a partir de los datos
  const ws = XLSX.utils.json_to_sheet(datosParaExcel, { origin: "A1" });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");

  // 3) Ajustes opcionales de ancho de columna
  const wscols = [
    { wch: 10 }, // ID Venta
    { wch: 15 }, // Fecha
    { wch: 10 }, // Hora
    { wch: 12 }, // Total
    { wch: 12 }, // Método
    { wch: 15 }, // Cant. Productos
  ];
  ws["!cols"] = wscols;

  // 4) Generamos el archivo y forzamos la descarga
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });
  saveAs(blob, `historial_ventas_${new Date().toISOString().slice(0,10)}.xlsx`);

  mostrarNotificacion("Excel generado correctamente", "success");
};

  

  const imprimirVenta = (venta) => {
    mostrarNotificacion(`Imprimiendo venta #${venta.id}`, "info")
  }

  const limpiarError = () => setError(null)

  return (
    <div className="ventas-container">
      <div className="ventas-wrapper">
        {/* Notificaciones */}
        {notification && (
          <div className={`notification ${notification.tipo}`}>
            <div className="notification-content">
              {notification.tipo === "success" && <CheckCircle size={20} />}
              {notification.tipo === "error" && <AlertCircle size={20} />}
              {notification.tipo === "info" && <AlertCircle size={20} />}
              <span>{notification.mensaje}</span>
              <button onClick={() => setNotification(null)} className="notification-close">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Error global */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={limpiarError} className="error-close">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="ventas-header">
          <h1 className="ventas-title">Gestión de Ventas</h1>
        </div>

        {/* Tabs Container */}
        <div className="tabs-container">
          <nav className="tabs-nav">
            {[
              { id: "nueva", label: "Nueva Venta" },
              { id: "historial", label: "Historial de Ventas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Nueva Venta Tab */}
          {activeTab === "nueva" && (
            <div className="space-y-5">
              {/* Grid principal */}
              <div className="venta-grid">
                {/* Formulario de productos */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">Gestión de Ventas</h2>
                      <p className="card-subtitle">Ingrese los productos para registrar una nueva venta</p>
                    </div>
                  </div>

                  <div className="card-body space-y-5">
                    {/* Búsqueda de producto */}
                    <div className="form-group">
                      <label className="form-label">Buscar Producto</label>
                      <div className="search-container">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Ingrese código o nombre del producto"
                          className="form-control"
                        />
                        <Search className="search-icon" />
                      </div>

                      {/* Sugerencias */}
                      {showSuggestions && filteredProductos.length > 0 && (
                        <div className="suggestions-dropdown">
                          {filteredProductos.map((producto) => (
                            <button
                              key={producto.id}
                              onClick={() => seleccionarProducto(producto)}
                              className="suggestion-item"
                            >
                              <div className="suggestion-name">{producto.nombre}</div>
                              <div className="suggestion-price">
                                S/ {producto.precio.toFixed(2)} - Stock: {producto.stock}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="form-group">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                        placeholder="Ingrese la cantidad"
                        className="form-control"
                      />
                    </div>

                    {/* Observaciones */}
                    <div className="form-group">
                      <label className="form-label">Observaciones (Opcional)</label>
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Observaciones adicionales"
                        className="form-control"
                        rows="3"
                      />
                    </div>

                    {/* Botón agregar */}
                    <div className="text-center">
                      <button
                        onClick={agregarProducto}
                        disabled={!selectedProduct || loading}
                        className="btn btn-primary"
                      >
                        {loading ? <Loader size={16} className="spinner" /> : <Plus size={16} />}
                        Agregar Producto
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resumen de venta */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Resumen de Venta</h2>
                    <button disabled={productosVenta.length === 0} className="btn-cart">
                      <ShoppingCart size={16} />
                      Cargar Venta
                    </button>
                  </div>

                  <div className="card-body">
                    <div className="summary-content">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>S/ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Descuento:</span>
                        <div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={descuento}
                            onChange={(e) => setDescuento(Number.parseFloat(e.target.value) || 0)}
                            className="form-control"
                            style={{ width: "100px", display: "inline-block" }}
                          />
                        </div>
                      </div>
                      <div className="summary-row">
                        <span>Impuesto (18%):</span>
                        <span>S/ {impuesto.toFixed(2)}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>S/ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <h3>Información de Pago</h3>
                    <div className="payment-grid">
                      <button
                        onClick={() => procesarPago("EFECTIVO")}
                        disabled={productosVenta.length === 0 || processingPayment}
                        className="btn btn-success"
                      >
                        {processingPayment ? <Loader size={16} className="spinner" /> : <Banknote size={16} />}
                        Efectivo
                      </button>
                      <button
                        onClick={() => procesarPago("TARJETA")}
                        disabled={productosVenta.length === 0 || processingPayment}
                        className="btn btn-info"
                      >
                        {processingPayment ? <Loader size={16} className="spinner" /> : <CreditCard size={16} />}
                        Tarjeta
                      </button>
                    </div>
                    <button
                      onClick={cancelarVenta}
                      disabled={productosVenta.length === 0}
                      className="btn btn-danger w-full payment-cancel"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabla de productos */}
              <div className="card">
                <div className="card-body">
                  {productosVenta.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosVenta.map((item, index) => (
                            <tr key={index}>
                              <td className="font-medium">{item.producto.nombre}</td>
                              <td>S/ {item.producto.precio.toFixed(2)}</td>
                              <td>{item.cantidad}</td>
                              <td>S/ {(item.producto.precio * item.cantidad).toFixed(2)}</td>
                              <td>
                                <button onClick={() => eliminarProducto(index)} className="btn-icon btn-icon-delete">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <ShoppingCart className="empty-state-icon" />
                      <h3 className="empty-state-title">No hay productos</h3>
                      <p className="empty-state-subtitle">Agregue productos para registrar la venta</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Historial de Ventas Tab */}
          {activeTab === "historial" && (
            <div className="space-y-5">
              {/* Filtros */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Filtros de Búsqueda</h2>
                </div>
                <div className="card-body">
                  <div className="filters-grid">
                    <div className="form-group">
                      <label className="form-label">Fecha Inicio</label>
                      <input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha Fin</label>
                      <input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Método de Pago</label>
                      <select
                        value={filtros.metodoPago}
                        onChange={(e) => setFiltros({ ...filtros, metodoPago: e.target.value })}
                        className="form-control"
                      >
                        <option value="">Todos</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monto Mínimo</label>
                      <input
                        type="number"
                        value={filtros.montoMinimo}
                        onChange={(e) =>
                          setFiltros({ ...filtros, montoMinimo: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0.00"
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="filter-actions">
                    <button onClick={aplicarFiltros} className="btn btn-primary" disabled={loading}>
                      {loading ? <Loader size={16} className="spinner" /> : <Filter size={16} />}
                      Aplicar Filtros
                    </button>
                    <button onClick={limpiarFiltros} className="btn btn-secondary">
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabla de ventas */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Historial de Ventas</h2>
                  <button onClick={exportarExcel} className="btn btn-success">
                    <FileSpreadsheet size={16} />
                    Exportar Excel
                  </button>
                </div>

                {loading && activeTab === "historial" ? (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                    <span>Cargando ventas...</span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID Venta</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Total</th>
                          <th>Método Pago</th>
                          <th>Productos</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventasFiltradas.length > 0 ? (
                          ventasFiltradas.map((venta) => (
                            <tr key={venta.id}>
                              <td className="font-medium">#{venta.id}</td>
                              <td>{formatFecha(venta.fecha)}</td>
                              <td>{formatHora(venta.fecha, venta.hora)}</td>
                              <td className="font-semibold text-green">S/ {venta.total.toFixed(2)}</td>
                              <td>
                                <span className={`badge ${venta.metodoPago === "EFECTIVO" ? "badge-success" : "badge-info"}`}>
                                  {venta.metodoPago}
                                </span>
                              </td>
                              <td>{venta.detalles?.length || 0} item(s)</td>
                              <td>
                                <div className="flex gap-2">
                                  <button onClick={() => verDetalleVenta(venta)} className="btn-icon btn-icon-view">
                                    <Eye size={16} />
                                  </button>
                                  <button onClick={() => imprimirVenta(venta)} className="btn-icon btn-icon-print">
                                    <Printer size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7">
                              <div className="empty-state">
                                <FileSpreadsheet className="empty-state-icon" />
                                <h3 className="empty-state-title">No se encontraron ventas</h3>
                                <p className="empty-state-subtitle">Intente ajustar los filtros de búsqueda</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Resumen del período */}
              <div className="summary-grid">
                <div className="summary-card blue-purple">
                  <div className="summary-icon">
                    <ShoppingCart size={40} />
                  </div>
                  <div className="summary-info">
                    <h3>{ventasFiltradas.length}</h3>
                    <p>Total Ventas</p>
                  </div>
                </div>
                <div className="summary-card green-teal">
                  <div className="summary-icon">
                    <DollarSign size={40} />
                  </div>
                  <div className="summary-info">
                    <h3>S/ {ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0).toFixed(2)}</h3>
                    <p>Monto Total</p>
                  </div>
                </div>
                <div className="summary-card orange-red">
                  <div className="summary-icon">
                    <TrendingUp size={40} />
                  </div>
                  <div className="summary-info">
                    <h3>
                      S/{" "}
                      {ventasFiltradas.length > 0
                        ? (
                            ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0) / ventasFiltradas.length
                          ).toFixed(2)
                        : "0.00"}
                    </h3>
                    <p>Promedio por Venta</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Modal para detalle de venta */}
        {showModal && selectedVenta && (
          <div
            className="modal-overlay  fixed inset-0 bg-black/50 flex items-center justify-center"
            style={{ zIndex: 9999 }} // por si acaso
          >
            <div className="modal-content bg-white rounded-lg overflow-hidden w-full max-w-xl">
              
              {/* Header púrpura */}
              <div
                className="modal-header bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center px-6 py-4"
                style={{ paddingLeft: '1rem' /* inline */ }}
              >
                <h2 className="modal-title text-lg font-semibold !pl-6">
                  Detalle de Venta #{selectedVenta.id}
                </h2>
                <button
                  onClick={cerrarModal}
                  className="modal-close text-white bg-transparent hover:bg-transparent p-1"
                  style={{ backgroundColor: 'transparent' }} // inline
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="modal-body bg-white p-6 space-y-8">

                {/* — Tabla 1: Resumen de Venta */}
                <div className="rounded-md p-4">
                  <table
                    className="w-full table-fixed border-t border-b border-gray-300"
                    style={{ borderTopWidth: '1px', borderBottomWidth: '1px' }}
                  >
                    <tbody>
                      {[
                        ['Fecha:', formatFecha(selectedVenta.fecha)],
                        ['Hora:', formatHora(selectedVenta.fecha, selectedVenta.hora)],
                        ['Método de Pago:', selectedVenta.metodoPago],
                        [
                          'Total:',
                          <span className="font-semibold text-green-600">
                            S/ {selectedVenta.total.toFixed(2)}
                          </span>,
                        ],
                      ].map(([label, value], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium w-1/3">{label}</td>
                          <td className="px-4 py-3">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* — Tabla 2: Productos */}
                <div className="rounded-md p-4">
                  <h3 className="text-gray-700 mb-3 font-semibold">Productos</h3>
                  <table
                    className="w-full table-auto border-t border-b border-gray-300"
                    style={{ borderTopWidth: '1px', borderBottomWidth: '1px' }}
                  >
                    <thead>
                      <tr className="bg-gray-100">
                        {['Producto','Precio Unitario','Cantidad','Subtotal'].map((h, i) => (
                          <th
                            key={i}
                            className={`
                              px-4 py-2 text-sm font-medium text-gray-600 
                              ${i===0? 'text-left': i===3 ? 'text-right':'text-center'}
                            `}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVenta.detalles?.length > 0 ? (
                        selectedVenta.detalles.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.productoNombre || item.nombre}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-center">
                              S/ {(item.precioUnitario ?? item.precio).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-center">{item.cantidad}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-right font-medium">
                              S/ {item.subtotal.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                            No hay productos disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ventas
