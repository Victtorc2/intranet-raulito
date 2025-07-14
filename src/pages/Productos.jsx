
import { useState, useEffect } from "react"
import { listarProductos, productosProximosAVencer, eliminarProducto } from "../api/productoService"
// En el import:
import { productosStockBajo as fetchProductosStockBajo } from "../api/productoService"

import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import "../styles/Productos.css"

const apiUrl = `${import.meta.env.VITE_API_URL}/api/productos`;

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [productosAVencer, setProductosAVencer] = useState([])
  const [productosStockBajo, setProductosStockBajo] = useState([])
  const [filtroNombre, setFiltroNombre] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (selectedTabIndex === 0) {
      cargarProductos()
    } else if (selectedTabIndex === 1) {
      cargarProductosAVencer()
    } else if (selectedTabIndex === 2) {
      cargarProductosStockBajo()
    }
  }, [selectedTabIndex, categoriaSeleccionada])

  useEffect(() => {
  cargarProductosAVencer()
  cargarProductosStockBajo()
}, [])

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
  fetchProductosStockBajo()
    .then((data) => {
      console.log("Productos con stock bajo:", data)
      setProductosStockBajo(data)
    })
    .catch((error) => {
      console.error("Error al cargar productos con stock bajo:", error)
      Swal.fire("Error", "No se pudo cargar los productos con stock bajo.", "error")
    })
}


  const eliminarProductoHandler = (producto) => {
    Swal.fire({
      title: `¿Seguro que deseas eliminar el producto ${producto.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarProducto(producto.id)
          .then(() => {
            Swal.fire("Producto eliminado", "", "success")
            cargarProductos()
            cargarProductosAVencer()
            cargarProductosStockBajo()
          })
          .catch((err) => {
            console.error("Error al eliminar producto:", err)
            Swal.fire("Error", "No se pudo eliminar el producto", "error")
          })
      }
    })
  }

  const renderProductoImagen = (productoId) => {
    return `${apiUrl}/${productoId}/imagen?${Date.now()}`
  }

  const getCategoriaIcon = (categoria) => {
    const iconos = {
      Dulces: "🍭",
      Bebidas: "🥤",
      Gaseosas: "🥤",
      Carnes: "🥩",
      Frutas: "🍎",
      Lácteos: "🥛",
      Panadería: "🍞",
    }
    return iconos[categoria] || "📦"
  }

  const getBadgeClass = (categoria) => {
    const classes = {
      Dulces: "badge-dulces",
      Bebidas: "badge-bebidas",
      Gaseosas: "badge-gaseosas",
      Carnes: "badge-carnes",
      Frutas: "badge-frutas",
      Lácteos: "badge-lacteos",
      Panadería: "badge-panaderia",
    }
    return `badge-categoria ${classes[categoria] || "badge-dulces"}`
  }

  const getStockClass = (stock) => {
    return stock < 10 ? "stock-bajo" : "stock-normal"
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "-"
    const fechaObj = new Date(fecha)
    const hoy = new Date()
    const diffTime = fechaObj - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <span className="vencimiento-urgente">⚠️ Vencido</span>
    } else if (diffDays <= 7) {
      return <span className="vencimiento-urgente">🚨 {diffDays} días</span>
    } else if (diffDays <= 30) {
      return <span className="vencimiento-proximo">⏰ {diffDays} días</span>
    } else {
      return <span className="vencimiento-normal">{fecha}</span>
    }
  }

  return (
    <div className="productos-container fade-in">
      {/* Header */}
      <div className="productos-header">
        <h1 className="productos-title">🛒 Gestión de Productos</h1>
        <p className="productos-subtitle">Administra el inventario de tu supermercado</p>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-row">
          <div>
            <input
              type="text"
              className="form-control-modern"
              placeholder="🔍 Buscar por nombre o código"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>
          <div>
            <select
              className="form-select-modern"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">📂 Todas las categorías</option>
              <option value="Dulces">🍭 Dulces</option>
              <option value="Bebidas">🥤 Bebidas</option>
              <option value="Gaseosas">🥤 Gaseosas</option>
              <option value="Carnes">🥩 Carnes</option>
              <option value="Frutas">🍎 Frutas</option>
              <option value="Lácteos">🥛 Lácteos</option>
              <option value="Panadería">🍞 Panadería</option>
            </select>
          </div>
          <div>
            <button className="btn-modern btn-primary-modern w-100" onClick={() => navigate("/productos/crear")}>
              ➕ Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="nav-tabs-modern">
          <button
            className={`nav-link-modern ${selectedTabIndex === 0 ? "active" : ""}`}
            onClick={() => setSelectedTabIndex(0)}
          >
            📋 Todos ({productos.length})
          </button>
          <button
            className={`nav-link-modern ${selectedTabIndex === 1 ? "active" : ""}`}
            onClick={() => setSelectedTabIndex(1)}
          >
            ⏰ Por Vencer ({productosAVencer.length})
          </button>
          <button
            className={`nav-link-modern ${selectedTabIndex === 2 ? "active" : ""}`}
            onClick={() => setSelectedTabIndex(2)}
          >
            📉 Stock Bajo ({productosStockBajo.length})
          </button>
        </div>
      </div>

      {/* Tabla de Todos los Productos */}
      {selectedTabIndex === 0 && (
        <div className="table-container slide-in">
          <table className="table-modern">
            <thead>
              <tr>
                <th>🖼️ Imagen</th>
                <th>📝 Nombre</th>
                <th>🏷️ Categoría</th>
                <th>🔢 Código</th>
                <th>💰 Precio</th>
                <th>📦 Stock</th>
                <th>📅 Vencimiento</th>
                <th>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    {producto.imagen && (
                      <img
                        src={renderProductoImagen(producto.id) || "/placeholder.svg"}
                        alt={producto.nombre}
                        className="producto-imagen"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "/placeholder-product.png"
                        }}
                      />
                    )}
                  </td>
                  <td className="font-semibold">{producto.nombre}</td>
                  <td>
                    <span className={getBadgeClass(producto.categoria)}>
                      {getCategoriaIcon(producto.categoria)} {producto.categoria}
                    </span>
                  </td>
                  <td className="text-sm text-secondary">{producto.codigo}</td>
                  <td className="precio-tag">${producto.precio?.toFixed(2)}</td>
                  <td className={getStockClass(producto.stock)}>
                    {producto.stock} {producto.stock < 10 && "⚠️"}
                  </td>
                  <td>{formatearFecha(producto.fechaVencimiento)}</td>
                  <td>
                    <div className="btn-group-modern">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/productos/editar/${producto.id}`)}
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => eliminarProductoHandler(producto)}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla de Productos por Vencer */}
      {selectedTabIndex === 1 && (
        <div className="table-container slide-in">
          <table className="table-modern">
            <thead>
              <tr>
                <th>🖼️ Imagen</th>
                <th>📝 Nombre</th>
                <th>⏰ Vencimiento</th>
                <th>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosAVencer.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    {producto.imagen && (
                      <img
                        src={renderProductoImagen(producto.id) || "/placeholder.svg"}
                        alt={producto.nombre}
                        className="producto-imagen"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "/placeholder-product.png"
                        }}
                      />
                    )}
                  </td>
                  <td className="font-semibold">{producto.nombre}</td>
                  <td>{formatearFecha(producto.fechaVencimiento)}</td>
                  <td>
                    <div className="btn-group-modern">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/productos/editar/${producto.id}`)}
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => eliminarProductoHandler(producto)}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla de Productos con Stock Bajo */}
      {selectedTabIndex === 2 && (
        <div className="table-container slide-in">
          <table className="table-modern">
            <thead>
              <tr>
                <th>🖼️ Imagen</th>
                <th>📝 Nombre</th>
                <th>📦 Stock</th>
                <th>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosStockBajo.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    {producto.imagen && (
                      <img
                        src={renderProductoImagen(producto.id) || "/placeholder.svg"}
                        alt={producto.nombre}
                        className="producto-imagen"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "/placeholder-product.png"
                        }}
                      />
                    )}
                  </td>
                  <td className="font-semibold">{producto.nombre}</td>
                  <td className={getStockClass(producto.stock)}>
                    {producto.stock} {producto.stock < 10 && "⚠️"}
                  </td>
                  <td>
                    <div className="btn-group-modern">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/productos/editar/${producto.id}`)}
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => eliminarProductoHandler(producto)}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Productos
