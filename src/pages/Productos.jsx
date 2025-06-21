"use client"

import { useState, useEffect } from "react"
import { listarProductos, productosProximosAVencer, eliminarProducto } from "../api/productoService"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

const apiUrl = "http://localhost:8080/api/productos"

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [productosAVencer, setProductosAVencer] = useState([])
  const [productosStockBajo, setProductosStockBajo] = useState([])
  const [filtroNombre, setFiltroNombre] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const navigate = useNavigate()

  const [paginaActual, setPaginaActual] = useState(1)
  const [paginaAVencer, setPaginaAVencer] = useState(1)
  const [paginaStockBajo, setPaginaStockBajo] = useState(1)
  const productosPorPagina = 10

  useEffect(() => {
    if (selectedTabIndex === 0) {
      cargarProductos()
    } else if (selectedTabIndex === 1) {
      cargarProductosAVencer()
    } else if (selectedTabIndex === 2) {
      cargarProductosStockBajo()
    }
  }, [selectedTabIndex, categoriaSeleccionada])

  const cargarProductos = () => {
    listarProductos(filtroNombre, categoriaSeleccionada)
      .then((data) => {
        console.log("Productos cargados:", data)
        setProductos(data)
      })
      .catch((error) => console.error("Error al cargar productos:", error))
  }

  const cargarProductosAVencer = () => {
    productosProximosAVencer()
      .then((data) => {
        console.log("Productos próximos a vencer:", data)
        setProductosAVencer(data)
      })
      .catch((error) => console.error("Error al cargar productos próximos a vencer:", error))
  }

  const cargarProductosStockBajo = () => {
    productosStockBajo()
      .then((data) => {
        console.log("Productos con stock bajo:", data)
        setProductosStockBajo(data)
      })
      .catch((error) => {
        console.error("Error al cargar productos con stock bajo:", error)
        Swal.fire("Error", "No se pudo cargar los productos con stock bajo.", "error")
      })
  }

const eliminarProductoHandler = async (producto) => {
  try {
    const result = await Swal.fire({
      title: `¿Seguro que deseas eliminar el producto ${producto.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      // Eliminar producto
      await eliminarProducto(producto.id);

      // Actualizar el estado local para eliminar el producto de las listas
      setProductos((prevProductos) => prevProductos.filter(p => p.id !== producto.id));
      setProductosAVencer((prevProductosAVencer) => prevProductosAVencer.filter(p => p.id !== producto.id));
      setProductosStockBajo((prevProductosStockBajo) => prevProductosStockBajo.filter(p => p.id !== producto.id));

      // Mostrar mensaje de éxito
      Swal.fire("¡Eliminado!", "El producto ha sido eliminado correctamente.", "success");
    }
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    Swal.fire("Error", "No se pudo eliminar el producto", "error");
  }
};


  const renderProductoImagen = (productoId) => {
    return `${apiUrl}/${productoId}/imagen?${Date.now()}`
  }

  const calcularProductosPaginados = (productos, paginaActual) => {
    const inicio = (paginaActual - 1) * productosPorPagina
    const fin = inicio + productosPorPagina
    return productos.slice(inicio, fin)
  }

  const calcularTotalPaginas = (totalProductos) => {
    return Math.ceil(totalProductos / productosPorPagina)
  }

  const renderPaginacion = (totalProductos, paginaActual, setPagina) => {
    const totalPaginas = calcularTotalPaginas(totalProductos)

    if (totalPaginas <= 1) return null

    return (
      <nav aria-label="Paginación de productos" className="mt-3">
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

  const getCategoriaIcon = (categoria) => {
    const iconMap = {
      Dulces: "bi-candy",
      Bebidas: "bi-cup-straw",
      Gaseosas: "bi-droplet",
      Carnes: "bi-meat",
      Frutas: "bi-apple",
      Lácteos: "bi-milk",
      Panadería: "bi-bread-slice",
    }
    return iconMap[categoria] || "bi-box"
  }

  const getStockBadge = (stock) => {
    if (stock < 5) return "badge bg-danger"
    if (stock < 10) return "badge bg-warning text-dark"
    return "badge bg-success"
  }

  useEffect(() => {
    setPaginaActual(1)
    setPaginaAVencer(1)
    setPaginaStockBajo(1)
  }, [filtroNombre, categoriaSeleccionada])

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-box-seam text-primary me-2"></i>
                Gestión de Productos
              </h2>
              <p className="text-muted mb-0">Administra tu inventario de productos</p>
            </div>
            <button className="btn btn-primary btn-lg shadow-sm" onClick={() => navigate("/productos/crear")}>
              <i className="bi bi-plus-circle me-2"></i>
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-search me-1"></i>
                Buscar Producto
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Buscar por nombre o código..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                <i className="bi bi-funnel me-1"></i>
                Categoría
              </label>
              <select
                className="form-select form-select-lg"
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              >
                <option value="">
                  <i className="bi bi-grid-3x3-gap"></i> Todas las categorías
                </option>
                <option value="Dulces">🍬 Dulces</option>
                <option value="Bebidas">🥤 Bebidas</option>
                <option value="Gaseosas">🥤 Gaseosas</option>
                <option value="Carnes">🥩 Carnes</option>
                <option value="Frutas">🍎 Frutas</option>
                <option value="Lácteos">🥛 Lácteos</option>
                <option value="Panadería">🍞 Panadería</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-outline-secondary btn-lg w-100" onClick={cargarProductos}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Actualizar
              </button>
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
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Todos los Productos
                <span className="badge bg-secondary ms-2">{productos.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTabIndex === 1 ? "active" : ""}`}
                onClick={() => setSelectedTabIndex(1)}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Por Vencer
                <span className="badge bg-warning text-dark ms-2">{productosAVencer.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTabIndex === 2 ? "active" : ""}`}
                onClick={() => setSelectedTabIndex(2)}
              >
                <i className="bi bi-arrow-down-circle me-2"></i>
                Stock Bajo
                <span className="badge bg-danger ms-2">{productosStockBajo.length}</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-0">
          {/* Tab: Todos los Productos */}
          {selectedTabIndex === 0 && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center">
                      <i className="bi bi-image"></i>
                    </th>
                    <th>
                      <i className="bi bi-tag me-1"></i>
                      Producto
                    </th>
                    <th>
                      <i className="bi bi-collection me-1"></i>
                      Categoría
                    </th>
                    <th>
                      <i className="bi bi-upc me-1"></i>
                      Código
                    </th>
                    <th>
                      <i className="bi bi-currency-dollar me-1"></i>
                      Precio
                    </th>
                    <th>
                      <i className="bi bi-boxes me-1"></i>
                      Stock
                    </th>
                    <th>
                      <i className="bi bi-calendar-event me-1"></i>
                      Vencimiento
                    </th>
                    <th className="text-center">
                      <i className="bi bi-gear"></i>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calcularProductosPaginados(productos, paginaActual).map((producto) => (
                    <tr key={producto.id}>
                      <td className="text-center">
                        {producto.imagen ? (
                          <img
                            src={renderProductoImagen(producto.id) || "/placeholder.svg"}
                            alt={producto.nombre}
                            className="rounded-circle border"
                            style={{ width: "75px", height: "75px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder-product.png"
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "75px", height: "75px" }}
                          >
                            <i className="bi bi-image text-muted fs-4"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{producto.nombre}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          <i className={`${getCategoriaIcon(producto.categoria)} me-1`}></i>
                          {producto.categoria}
                        </span>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">{producto.codigo}</code>
                      </td>
                      <td>
                        <span className="fw-bold text-success">${producto.precio?.toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={getStockBadge(producto.stock)}>{producto.stock} unidades</span>
                      </td>
                      <td>
                        <small className="text-muted">
                          <i className="bi bi-calendar3 me-1"></i>
                          {producto.fechaVencimiento}
                        </small>
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
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarProductoHandler(producto)}
                            title="Eliminar producto"
                          >
                            <i className="bi bi-trash3"></i>
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
                  <p className="text-muted">Agrega tu primer producto para comenzar</p>
                </div>
              )}
              {renderPaginacion(productos.length, paginaActual, setPaginaActual)}
            </div>
          )}

          {/* Tab: Productos por Vencer */}
          {selectedTabIndex === 1 && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-warning">
                  <tr>
                    <th className="text-center">
                      <i className="bi bi-image"></i>
                    </th>
                    <th>
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Producto
                    </th>
                    <th>
                      <i className="bi bi-calendar-x me-1"></i>
                      Fecha de Vencimiento
                    </th>
                    <th className="text-center">
                      <i className="bi bi-gear"></i>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calcularProductosPaginados(productosAVencer, paginaAVencer).map((producto) => (
                    <tr key={producto.id} className="table-warning">
                      <td className="text-center">
                        {producto.imagen ? (
                          <img
                            src={renderProductoImagen(producto.id) || "/placeholder.svg"}
                            alt={producto.nombre}
                            className="rounded-circle border border-warning"
                            style={{ width: "75px", height: "75px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder-product.png"
                            }}
                          />
                        ) : (
                          <div
                            className="bg-warning bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "75px", height: "75px" }}
                          >
                            <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{producto.nombre}</div>
                        <small className="text-muted">¡Próximo a vencer!</small>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-calendar-event me-1"></i>
                          {producto.fechaVencimiento}
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
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarProductoHandler(producto)}
                            title="Eliminar producto"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {productosAVencer.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle display-1 text-success"></i>
                  <h4 className="text-success mt-3">¡Excelente!</h4>
                  <p className="text-muted">No hay productos próximos a vencer</p>
                </div>
              )}
              {renderPaginacion(productosAVencer.length, paginaAVencer, setPaginaAVencer)}
            </div>
          )}

          {/* Tab: Stock Bajo */}
          {selectedTabIndex === 2 && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-danger">
                  <tr>
                    <th className="text-center">
                      <i className="bi bi-image"></i>
                    </th>
                    <th>
                      <i className="bi bi-arrow-down-circle me-1"></i>
                      Producto
                    </th>
                    <th>
                      <i className="bi bi-boxes me-1"></i>
                      Stock Disponible
                    </th>
                    <th className="text-center">
                      <i className="bi bi-gear"></i>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calcularProductosPaginados(productosStockBajo, paginaStockBajo).map((producto) => (
                    <tr key={producto.id} className={producto.stock < 5 ? "table-danger" : "table-warning"}>
                      <td className="text-center">
                        {producto.imagen ? (
                          <img
                            src={renderProductoImagen(producto.id) || "/placeholder.svg"}
                            alt={producto.nombre}
                            className="rounded-circle border border-danger"
                            style={{ width: "75px", height: "75px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder-product.png"
                            }}
                          />
                        ) : (
                          <div
                            className="bg-danger bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "75px", height: "75px" }}
                          >
                            <i className="bi bi-exclamation-circle text-danger fs-4"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{producto.nombre}</div>
                        <small className="text-danger">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Stock crítico
                        </small>
                      </td>
                      <td>
                        <span className={getStockBadge(producto.stock)}>
                          <i className="bi bi-box me-1"></i>
                          {producto.stock} unidades
                        </span>
                        {producto.stock < 5 && (
                          <div className="mt-1">
                            <small className="text-danger fw-bold">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              ¡Reabastecer urgente!
                            </small>
                          </div>
                        )}
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
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarProductoHandler(producto)}
                            title="Eliminar producto"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {productosStockBajo.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle display-1 text-success"></i>
                  <h4 className="text-success mt-3">¡Stock saludable!</h4>
                  <p className="text-muted">Todos los productos tienen stock suficiente</p>
                </div>
              )}
              {renderPaginacion(productosStockBajo.length, paginaStockBajo, setPaginaStockBajo)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Productos
