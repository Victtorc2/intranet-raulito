
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { registrarMovimiento, listarMovimientos, filtrarMovimientosPorTipo } from "../api/movimientoService"
import { listarProductos } from "../api/productoService"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import "../styles/Inventario.css"

const Inventario = () => {
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [filtroTipo, setFiltroTipo] = useState("")
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, reset } = useForm()

  useEffect(() => {
    cargarProductos()
    cargarMovimientos()
  }, [])

  useEffect(() => {
    if (filtroTipo) {
      filtrarMovimientos(filtroTipo)
    }
  }, [filtroTipo])

  const cargarProductos = async () => {
    try {
      const productosData = await listarProductos()
      setProductos(productosData)
    } catch (error) {
      console.error("Error al cargar productos", error)
    }
  }

  const cargarMovimientos = async () => {
    try {
      const movimientosData = await listarMovimientos()
      setMovimientos(movimientosData)
    } catch (error) {
      console.error("Error al cargar movimientos", error)
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
    try {
      await registrarMovimiento(data)
      cargarMovimientos()
      reset()
      Swal.fire("Éxito", "Movimiento registrado correctamente", "success")
    } catch (error) {
      console.error("Error al registrar movimiento", error)
    }
  }

  return (
    <div className="inventario-container">
      <div className="header">
        <h1 className="title">Gestión de Inventario</h1>
        <p className="subtitle">Administra tus productos y movimientos de inventario</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${selectedTabIndex === 0 ? "tab-active" : ""}`}
            onClick={() => setSelectedTabIndex(0)}
          >
            Movimientos
          </button>
          <button
            className={`tab ${selectedTabIndex === 1 ? "tab-active" : ""}`}
            onClick={() => setSelectedTabIndex(1)}
          >
            Productos
          </button>
        </div>
      </div>

      {selectedTabIndex === 0 && (
        <div className="content-section">
          <div className="form-card">
            <h2 className="section-title">Registrar Movimiento</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="label">Producto</label>
                  <select {...register("productoId")} required className="select">
                    <option value="">Seleccione un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Cantidad</label>
                  <input
                    type="number"
                    {...register("cantidad", { valueAsNumber: true })}
                    min="1"
                    required
                    className="input"
                    placeholder="Ingrese la cantidad"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Tipo de Movimiento</label>
                  <select {...register("tipo")} required className="select">
                    <option value="INGRESO">Ingreso</option>
                    <option value="SALIDA">Salida</option>
                    <option value="AJUSTE">Ajuste</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Ubicación</label>
                  <input
                    type="text"
                    {...register("ubicacion")}
                    required
                    className="input"
                    placeholder="Ubicación del producto"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Observación</label>
                  <input
                    type="text"
                    {...register("observacion")}
                    className="input"
                    placeholder="Observaciones adicionales"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Fecha</label>
                  <input type="date" {...register("fecha")} required className="input" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Registrar Movimiento
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h2 className="section-title">Historial de Movimientos</h2>
              <div className="filter-group">
                <label className="label">Filtrar por tipo:</label>
                <select onChange={(e) => setFiltroTipo(e.target.value)} className="select select-sm">
                  <option value="">Todos</option>
                  <option value="INGRESO">Entradas</option>
                  <option value="SALIDA">Salidas</option>
                  <option value="AJUSTE">Ajustes</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Tipo</th>
                    <th>Ubicación</th>
                    <th>Observación</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td className="font-medium">{movimiento.productoNombre}</td>
                      <td>{movimiento.categoria}</td>
                      <td className="text-center">{movimiento.cantidad}</td>
                      <td>
                        <span className={`badge badge-${movimiento.tipo.toLowerCase()}`}>{movimiento.tipo}</span>
                      </td>
                      <td>{movimiento.ubicacion}</td>
                      <td>{movimiento.observacion}</td>
                      <td>{movimiento.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTabIndex === 1 && (
        <div className="content-section">
          <div className="table-card">
            <h2 className="section-title">Lista de Productos</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id}>
                      <td className="font-medium">{producto.nombre}</td>
                      <td>{producto.categoria}</td>
                      <td className="font-medium">${producto.precio}</td>
                      <td className="text-center">
                        <span className={`stock-badge ${producto.stock < 10 ? "stock-low" : "stock-normal"}`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => navigate(`/productos/editar/${producto.id}`)}
                            className="btn btn-secondary btn-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => navigate(`/productos/eliminar/${producto.id}`)}
                            className="btn btn-danger btn-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventario
