
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { registrarMovimiento, listarMovimientos, filtrarMovimientosPorTipo } from "../api/movimientoService"
import { listarProductos } from "../api/productoService"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

const Inventario = () => {
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [filtroTipo, setFiltroTipo] = useState("")
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [paginaMovimientos, setPaginaMovimientos] = useState(1)
  const [paginaProductos, setPaginaProductos] = useState(1)
  const movimientosPorPagina = 10
  const productosPorPagina = 10
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      productoId: "",
      cantidad: 1,
      tipo: "INGRESO",
      ubicacion: "",
      observacion: "",
      fecha: new Date().toISOString().split("T")[0],
    },
  })

  const watchedTipo = watch("tipo")
  const watchedCantidad = watch("cantidad")

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (filtroTipo) {
      filtrarMovimientos(filtroTipo)
    } else {
      cargarMovimientos()
    }
  }, [filtroTipo])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      await Promise.all([cargarProductos(), cargarMovimientos()])
    } catch (error) {
      console.error("Error al cargar datos", error)
    } finally {
      setCargando(false)
    }
  }

  const cargarProductos = async () => {
    try {
      const productosData = await listarProductos()
      setProductos(productosData)
    } catch (error) {
      console.error("Error al cargar productos", error)
      Swal.fire("Error", "No se pudieron cargar los productos", "error")
    }
  }

  const cargarMovimientos = async () => {
    try {
      const movimientosData = await listarMovimientos()
      setMovimientos(movimientosData)
    } catch (error) {
      console.error("Error al cargar movimientos", error)
      Swal.fire("Error", "No se pudieron cargar los movimientos", "error")
    }
  }

  const filtrarMovimientos = async (tipo) => {
    try {
      const movimientosFiltrados = await filtrarMovimientosPorTipo(tipo)
      setMovimientos(movimientosFiltrados)
    } catch (error) {
      console.error("Error al filtrar movimientos", error)
    }
  }

  const onSubmit = async (data) => {
    setGuardando(true)
    try {
      await registrarMovimiento(data)
      await cargarMovimientos()
      reset({
        productoId: "",
        cantidad: 1,
        tipo: "INGRESO",
        ubicacion: "",
        observacion: "",
        fecha: new Date().toISOString().split("T")[0],
      })
      Swal.fire({
        title: "¡Registrado!",
        text: "Movimiento registrado correctamente",
        icon: "success",
        confirmButtonColor: "#198754",
      })
    } catch (error) {
      console.error("Error al registrar movimiento", error)
      Swal.fire({
        title: "Error",
        text: "No se pudo registrar el movimiento",
        icon: "error",
        confirmButtonColor: "#dc3545",
      })
    } finally {
      setGuardando(false)
    }
  }

  const getTipoMovimientoIcon = (tipo) => {
    const iconMap = {
      INGRESO: "bi-arrow-down-circle text-success",
      SALIDA: "bi-arrow-up-circle text-danger",
      AJUSTE: "bi-gear-fill text-warning",
    }
    return iconMap[tipo] || "bi-circle"
  }

  const getTipoMovimientoBadge = (tipo) => {
    const badgeMap = {
      INGRESO: "badge bg-success",
      SALIDA: "badge bg-danger",
      AJUSTE: "badge bg-warning text-dark",
    }
    return badgeMap[tipo] || "badge bg-secondary"
  }

  const getStockBadge = (stock) => {
    if (stock < 5) return "badge bg-danger"
    if (stock < 10) return "badge bg-warning text-dark"
    return "badge bg-success"
  }

  const calcularPaginados = (items, pagina, itemsPorPagina) => {
    const inicio = (pagina - 1) * itemsPorPagina
    const fin = inicio + itemsPorPagina
    return items.slice(inicio, fin)
  }

  const calcularTotalPaginas = (totalItems, itemsPorPagina) => {
    return Math.ceil(totalItems / itemsPorPagina)
  }

  const renderPaginacion = (totalItems, paginaActual, setPagina, itemsPorPagina) => {
    const totalPaginas = calcularTotalPaginas(totalItems, itemsPorPagina)

    if (totalPaginas <= 1) return null

    return (
      <nav aria-label="Paginación" className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPagina(paginaActual - 1)} disabled={paginaActual === 1}>
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {[...Array(totalPaginas)].map((_, index) => {
            const numeroPagina = index + 1
            return (
              <li key={numeroPagina} className={`page-item ${paginaActual === numeroPagina ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPagina(numeroPagina)}>
                  {numeroPagina}
                </button>
              </li>
            )
          })}

          <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    )
  }

  if (cargando) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h4 className="mt-3 text-muted">Cargando inventario...</h4>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">
                <i className="bi bi-boxes text-primary me-2"></i>
                Gestión de Inventario
              </h1>
              <p className="text-muted mb-0">Controla los movimientos y stock de tus productos</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={() => navigate("/productos")}>
                <i className="bi bi-box-seam me-2"></i>
                Ver Productos
              </button>
              <button className="btn btn-primary" onClick={() => navigate("/productos/crear")}>
                <i className="bi bi-plus-circle me-2"></i>
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Total Productos</h6>
                  <h3 className="mb-0">{productos.length}</h3>
                </div>
                <i className="bi bi-box-seam display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Ingresos Hoy</h6>
                  <h3 className="mb-0">
                    {
                      movimientos.filter(
                        (m) => m.tipo === "INGRESO" && m.fecha === new Date().toISOString().split("T")[0],
                      ).length
                    }
                  </h3>
                </div>
                <i className="bi bi-arrow-down-circle display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Salidas Hoy</h6>
                  <h3 className="mb-0">
                    {
                      movimientos.filter(
                        (m) => m.tipo === "SALIDA" && m.fecha === new Date().toISOString().split("T")[0],
                      ).length
                    }
                  </h3>
                </div>
                <i className="bi bi-arrow-up-circle display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Stock Bajo</h6>
                  <h3 className="mb-0">{productos.filter((p) => p.stock < 10).length}</h3>
                </div>
                <i className="bi bi-exclamation-triangle display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <ul className="nav nav-pills nav-fill">
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTabIndex === 0 ? "active" : ""}`}
                onClick={() => setSelectedTabIndex(0)}
              >
                <i className="bi bi-arrow-left-right me-2"></i>
                Movimientos de Inventario
                <span className="badge bg-secondary ms-2">{movimientos.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTabIndex === 1 ? "active" : ""}`}
                onClick={() => setSelectedTabIndex(1)}
              >
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Lista de Productos
                <span className="badge bg-secondary ms-2">{productos.length}</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-0">
          {/* Tab: Movimientos */}
          {selectedTabIndex === 0 && (
            <div className="p-4">
              <div className="row">
                {/* Formulario de Registro */}
                <div className="col-lg-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="card-title mb-0">
                        <i className="bi bi-plus-circle me-2"></i>
                        Registrar Movimiento
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-box me-1"></i>
                            Producto *
                          </label>
                          <select
                            className={`form-select ${errors.productoId ? "is-invalid" : ""}`}
                            {...register("productoId", { required: "Selecciona un producto" })}
                          >
                            <option value="">Seleccione un producto</option>
                            {productos.map((producto) => (
                              <option key={producto.id} value={producto.id}>
                                {producto.nombre} (Stock: {producto.stock})
                              </option>
                            ))}
                          </select>
                          {errors.productoId && <div className="invalid-feedback">{errors.productoId.message}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-123 me-1"></i>
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            className={`form-control ${errors.cantidad ? "is-invalid" : ""}`}
                            {...register("cantidad", {
                              required: "La cantidad es obligatoria",
                              min: { value: 1, message: "La cantidad debe ser mayor a 0" },
                            })}
                            min="1"
                          />
                          {errors.cantidad && <div className="invalid-feedback">{errors.cantidad.message}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-arrow-left-right me-1"></i>
                            Tipo de Movimiento *
                          </label>
                          <select className="form-select" {...register("tipo", { required: true })}>
                            <option value="INGRESO">📥 Ingreso</option>
                            <option value="SALIDA">📤 Salida</option>
                            <option value="AJUSTE">⚙️ Ajuste</option>
                          </select>
                          <small className="text-muted">
                            <i className={getTipoMovimientoIcon(watchedTipo)} me-1></i>
                            {watchedTipo === "INGRESO" && "Aumenta el stock"}
                            {watchedTipo === "SALIDA" && "Reduce el stock"}
                            {watchedTipo === "AJUSTE" && "Corrige el stock"}
                          </small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-geo-alt me-1"></i>
                            Ubicación *
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.ubicacion ? "is-invalid" : ""}`}
                            {...register("ubicacion", { required: "La ubicación es obligatoria" })}
                            placeholder="Ej: Almacén A, Estante 1"
                          />
                          {errors.ubicacion && <div className="invalid-feedback">{errors.ubicacion.message}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-chat-text me-1"></i>
                            Observación
                          </label>
                          <textarea
                            className="form-control"
                            {...register("observacion")}
                            rows="2"
                            placeholder="Comentarios adicionales..."
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-calendar-event me-1"></i>
                            Fecha *
                          </label>
                          <input
                            type="date"
                            className={`form-control ${errors.fecha ? "is-invalid" : ""}`}
                            {...register("fecha", { required: "La fecha es obligatoria" })}
                          />
                          {errors.fecha && <div className="invalid-feedback">{errors.fecha.message}</div>}
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={guardando}>
                          {guardando ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Registrando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Registrar Movimiento
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Lista de Movimientos */}
                <div className="col-lg-8">
                  <div className="card shadow-sm">
                    <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Historial de Movimientos
                      </h5>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                      >
                        <option value="">Todos los movimientos</option>
                        <option value="INGRESO">📥 Solo Ingresos</option>
                        <option value="SALIDA">📤 Solo Salidas</option>
                        <option value="AJUSTE">⚙️ Solo Ajustes</option>
                      </select>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-dark">
                            <tr>
                              <th>
                                <i className="bi bi-box me-1"></i>
                                Producto
                              </th>
                              <th>
                                <i className="bi bi-collection me-1"></i>
                                Categoría
                              </th>
                              <th>
                                <i className="bi bi-123 me-1"></i>
                                Cantidad
                              </th>
                              <th>
                                <i className="bi bi-arrow-left-right me-1"></i>
                                Tipo
                              </th>
                              <th>
                                <i className="bi bi-geo-alt me-1"></i>
                                Ubicación
                              </th>
                              <th>
                                <i className="bi bi-calendar-event me-1"></i>
                                Fecha
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {calcularPaginados(movimientos, paginaMovimientos, movimientosPorPagina).map(
                              (movimiento) => (
                                <tr key={movimiento.id}>
                                  <td>
                                    <div className="fw-semibold">{movimiento.productoNombre}</div>
                                    {movimiento.observacion && (
                                      <small className="text-muted">
                                        <i className="bi bi-chat-text me-1"></i>
                                        {movimiento.observacion}
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    <span className="badge bg-light text-dark">{movimiento.categoria}</span>
                                  </td>
                                  <td>
                                    <span className="fw-bold">{movimiento.cantidad}</span>
                                  </td>
                                  <td>
                                    <span className={getTipoMovimientoBadge(movimiento.tipo)}>
                                      <i className={getTipoMovimientoIcon(movimiento.tipo)} me-1></i>
                                      {movimiento.tipo}
                                    </span>
                                  </td>
                                  <td>
                                    <small className="text-muted">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {movimiento.ubicacion}
                                    </small>
                                  </td>
                                  <td>
                                    <small className="text-muted">{movimiento.fecha}</small>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                        {movimientos.length === 0 && (
                          <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <h4 className="text-muted mt-3">No hay movimientos</h4>
                            <p className="text-muted">Registra tu primer movimiento de inventario</p>
                          </div>
                        )}
                      </div>
                      {renderPaginacion(
                        movimientos.length,
                        paginaMovimientos,
                        setPaginaMovimientos,
                        movimientosPorPagina,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Productos */}
          {selectedTabIndex === 1 && (
            <div className="p-4">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>
                        <i className="bi bi-tag me-1"></i>
                        Producto
                      </th>
                      <th>
                        <i className="bi bi-collection me-1"></i>
                        Categoría
                      </th>
                      <th>
                        <i className="bi bi-currency-dollar me-1"></i>
                        Precio
                      </th>
                      <th>
                        <i className="bi bi-boxes me-1"></i>
                        Stock
                      </th>
                      <th className="text-center">
                        <i className="bi bi-gear"></i>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcularPaginados(productos, paginaProductos, productosPorPagina).map((producto) => (
                      <tr key={producto.id}>
                        <td>
                          <div className="fw-semibold">{producto.nombre}</div>
                          <small className="text-muted">Código: {producto.codigo}</small>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">{producto.categoria}</span>
                        </td>
                        <td>
                          <span className="fw-bold text-success">${producto.precio?.toFixed(2)}</span>
                        </td>
                        <td>
                          <span className={getStockBadge(producto.stock)}>
                            <i className="bi bi-box me-1"></i>
                            {producto.stock} unidades
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => navigate(`/productos/editar/${producto.id}`)}
                              title="Editar producto"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => {
                                setValue("productoId", producto.id)
                                setSelectedTabIndex(0)
                              }}
                              title="Registrar movimiento"
                            >
                              <i className="bi bi-arrow-left-right"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {productos.length === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h4 className="text-muted mt-3">No hay productos</h4>
                    <p className="text-muted">Agrega productos para gestionar el inventario</p>
                  </div>
                )}
              </div>
              {renderPaginacion(productos.length, paginaProductos, setPaginaProductos, productosPorPagina)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Inventario
