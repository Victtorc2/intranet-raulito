"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { crearProducto, actualizarProducto, obtenerProductoPorId } from "../api/productoService"
import Swal from "sweetalert2"
import { useForm, Controller } from "react-hook-form"
import "../styles/Productos.css"

const apiUrl = `${import.meta.env.VITE_API_URL}/api/productos`;

const ProductoForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [imagenPrevia, setImagenPrevia] = useState("")
  const [cargando, setCargando] = useState(false)
  const [errorCarga, setErrorCarga] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      nombre: "",
      codigo: "",
      categoria: "",
      precio: 0,
      stock: 0,
      proveedor: "",
      presentacion: "",
      fechaVencimiento: "",
    },
  })

  const watchedStock = watch("stock")
  const watchedPrecio = watch("precio")

  useEffect(() => {
    if (id) {
      const cargarProducto = async () => {
        setCargando(true)
        try {
          const productoData = await obtenerProductoPorId(id)
          setValue("nombre", productoData.nombre || "")
          setValue("codigo", productoData.codigo || "")
          setValue("categoria", productoData.categoria || "")
          setValue("precio", productoData.precio || 0)
          setValue("stock", productoData.stock || 0)
          setValue("proveedor", productoData.proveedor || "")
          setValue("presentacion", productoData.presentacion || "")
          setValue("fechaVencimiento", productoData.fechaVencimiento ? productoData.fechaVencimiento.split("T")[0] : "")

          if (productoData.imagen) {
            setImagenPrevia(`${apiUrl}/${id}/imagen?timestamp=${Date.now()}`)
          }
          setErrorCarga(null)
        } catch (error) {
          setErrorCarga("No se pudo cargar el producto. Puedes continuar editando.")
        } finally {
          setCargando(false)
        }
      }
      cargarProducto()
    }
  }, [id, setValue])

  const onSubmit = async (data) => {
    setGuardando(true)
    const precio = Number.parseFloat(data.precio)
    console.log("Precio en el frontend antes de enviarlo:", precio)

    if (isNaN(precio) || precio <= 0) {
      Swal.fire({
        title: "Error",
        text: "El precio es obligatorio y debe ser mayor que 0",
        icon: "error",
        confirmButtonColor: "#dc3545",
      })
      setGuardando(false)
      return
    }

    const productoData = {
      ...data,
      precio: precio,
    }

    console.log("Datos que se envían al backend:", productoData)

    const { imagen, ...restoProducto } = productoData
    const formData = new FormData()
    formData.append("producto", new Blob([JSON.stringify(restoProducto)], { type: "application/json" }))

    if (imagen && imagen[0]) {
      formData.append("imagen", imagen[0])
    }

    try {
      console.log("FormData enviado:", formData)
      if (id) {
        await actualizarProducto(id, formData)
        Swal.fire({
          title: "¡Actualizado!",
          text: "Producto actualizado correctamente",
          icon: "success",
          confirmButtonColor: "#198754",
        })
      } else {
        await crearProducto(restoProducto, imagen?.[0])
        Swal.fire({
          title: "¡Creado!",
          text: "Producto creado correctamente",
          icon: "success",
          confirmButtonColor: "#198754",
        })
      }
      navigate("/productos")
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar el producto",
        icon: "error",
        confirmButtonColor: "#dc3545",
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleImageChange = (e, field) => {
    field.onChange(e.target.files)
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagenPrevia(e.target.result)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const getCategoriaIcon = (categoria) => {
    const iconMap = {
      Dulces: "🍭",
      Bebidas: "🥤",
      Gaseosas: "🥤",
      Carnes: "🥩",
      Frutas: "🍎",
      Lácteos: "🥛",
      Panadería: "🍞",
      Limpieza: "🧽",
    }
    return iconMap[categoria] || "📦"
  }

  const getStockStatus = (stock) => {
    if (stock < 5) return { color: "stock-critico", icon: "⚠️", text: "Stock crítico" }
    if (stock < 10) return { color: "stock-bajo", icon: "⚠️", text: "Stock bajo" }
    return { color: "stock-normal", icon: "✅", text: "Stock saludable" }
  }

  if (cargando) {
    return (
      <div className="productos-container fade-in">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <h4 className="loading-text">Cargando producto...</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="productos-container fade-in">
      {/* Header */}
      <div className="form-header">
        <nav className="breadcrumb-modern">
          <button className="breadcrumb-link" onClick={() => navigate("/productos")}>
            🏠 Productos
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{id ? "Editar" : "Crear"} Producto</span>
        </nav>

        <div className="header-content">
          <div className="header-info">
            <h1 className="form-title">{id ? "✏️ Editar Producto" : "➕ Crear Nuevo Producto"}</h1>
            <p className="form-subtitle">
              {id ? "Modifica la información del producto" : "Completa los datos para agregar un nuevo producto"}
            </p>
          </div>
        </div>
      </div>

      {/* Alert de error */}
      {errorCarga && (
        <div className="alert-modern alert-warning">
          ⚠️ {errorCarga}
          <button
            type="button"
            className="btn-modern btn-outline-modern alert-close-btn"
            onClick={() => setErrorCarga(null)}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-layout">
          {/* Información Básica */}
          <div className="form-section">
            <div className="card-modern">
              <div className="card-header-modern card-header-primary">
                <h5 className="card-title-modern">ℹ️ Información Básica</h5>
              </div>
              <div className="card-body-modern">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label-modern">🏷️ Nombre del Producto *</label>
                    <Controller
                      name="nombre"
                      control={control}
                      rules={{ required: "El nombre es obligatorio" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`form-control-modern ${errors.nombre ? "form-control-error" : ""}`}
                          placeholder="Ej: Coca Cola 500ml"
                        />
                      )}
                    />
                    {errors.nombre && <div className="error-message">{errors.nombre.message}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label-modern">🔢 Código del Producto *</label>
                    <Controller
                      name="codigo"
                      control={control}
                      rules={{ required: "El código es obligatorio" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`form-control-modern ${errors.codigo ? "form-control-error" : ""}`}
                          placeholder="Ej: CC500ML"
                        />
                      )}
                    />
                    {errors.codigo && <div className="error-message">{errors.codigo.message}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label-modern">📂 Categoría *</label>
                    <Controller
                      name="categoria"
                      control={control}
                      rules={{ required: "La categoría es obligatoria" }}
                      render={({ field }) => (
                        <select
                          className={`form-select-modern ${errors.categoria ? "form-control-error" : ""}`}
                          {...field}
                        >
                          <option value="">Selecciona una categoría</option>
                          <option value="Dulces">🍭 Dulces</option>
                          <option value="Bebidas">🥤 Bebidas</option>
                          <option value="Gaseosas">🥤 Gaseosas</option>
                          <option value="Carnes">🥩 Carnes</option>
                          <option value="Frutas">🍎 Frutas</option>
                          <option value="Lácteos">🥛 Lácteos</option>
                          <option value="Panadería">🍞 Panadería</option>
                          <option value="Limpieza">🧽 Limpieza</option>
                        </select>
                      )}
                    />
                    {errors.categoria && <div className="error-message">{errors.categoria.message}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label-modern">📦 Presentación</label>
                    <Controller
                      name="presentacion"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="form-control-modern"
                          placeholder="Ej: Botella 500ml, Paquete 250g"
                        />
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-modern">🏢 Proveedor</label>
                    <Controller
                      name="proveedor"
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="form-control-modern" placeholder="Ej: Distribuidora ABC" />
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-modern">📅 Fecha de Vencimiento</label>
                    <Controller
                      name="fechaVencimiento"
                      control={control}
                      render={({ field }) => <input {...field} className="form-control-modern" type="date" />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen del Producto */}
          <div className="form-section-sidebar">
            <div className="card-modern">
              <div className="card-header-modern card-header-info">
                <h5 className="card-title-modern">🖼️ Imagen del Producto</h5>
              </div>
              <div className="card-body-modern text-center">
                <div className="image-upload-area">
                  {imagenPrevia ? (
                    <div className="image-preview-wrapper">
                      <img
                        src={imagenPrevia || "/placeholder.svg"}
                        alt="Vista previa"
                        className="image-preview-large"
                      />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => setImagenPrevia("")}
                        title="Eliminar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <div className="upload-icon">☁️</div>
                      <p className="upload-text">No hay imagen seleccionada</p>
                      <small className="upload-hint">Formatos: JPG, PNG, GIF</small>
                    </div>
                  )}
                </div>

                <Controller
                  name="imagen"
                  control={control}
                  render={({ field }) => (
                    <input
                      className="form-control-modern"
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleImageChange(e, field)}
                    />
                  )}
                />
                <small className="upload-info">ℹ️ Tamaño máximo: 5MB</small>
              </div>
            </div>
          </div>

          {/* Información Comercial */}
          <div className="form-section-full">
            <div className="card-modern">
              <div className="card-header-modern card-header-success">
                <h5 className="card-title-modern">💰 Información Comercial</h5>
              </div>
              <div className="card-body-modern">
                <div className="form-grid-commercial">
                  <div className="form-group">
                    <label className="form-label-modern">💵 Precio de Venta *</label>
                    <div className="input-group-modern">
                      <span className="input-prefix">$</span>
                      <Controller
                        name="precio"
                        control={control}
                        rules={{
                          required: "El precio es obligatorio",
                          min: { value: 0.01, message: "El precio debe ser mayor a 0" },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`form-control-modern ${errors.precio ? "form-control-error" : ""}`}
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                          />
                        )}
                      />
                    </div>
                    {errors.precio && <div className="error-message">{errors.precio.message}</div>}
                    {watchedPrecio > 0 && <small className="success-message">✅ Precio válido</small>}
                  </div>

                  <div className="form-group">
                    <label className="form-label-modern">📦 Stock Disponible *</label>
                    <Controller
                      name="stock"
                      control={control}
                      rules={{
                        required: "El stock es obligatorio",
                        min: { value: 0, message: "El stock no puede ser negativo" },
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`form-control-modern ${errors.stock ? "form-control-error" : ""}`}
                          type="number"
                          min="0"
                          placeholder="0"
                        />
                      )}
                    />
                    {errors.stock && <div className="error-message">{errors.stock.message}</div>}
                    {watchedStock >= 0 && (
                      <small className={getStockStatus(watchedStock).color}>
                        {getStockStatus(watchedStock).icon} {getStockStatus(watchedStock).text}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="form-section-full">
            <div className="card-modern">
              <div className="card-body-modern">
                <div className="form-actions-advanced">
                  <div className="form-info">
                    <small className="form-required-info">ℹ️ Los campos marcados con * son obligatorios</small>
                  </div>
                  <div className="btn-group-advanced">
                    <button
                      type="button"
                      className="btn-modern btn-outline-modern btn-large"
                      onClick={() => navigate("/productos")}
                      disabled={guardando}
                    >
                      ❌ Cancelar
                    </button>
                    <button type="submit" className="btn-modern btn-success-modern btn-large" disabled={guardando}>
                      {guardando ? (
                        <>
                          <span className="loading-spinner"></span>
                          {id ? "Actualizando..." : "Creando..."}
                        </>
                      ) : (
                        <>{id ? "💾 Actualizar Producto" : "➕ Crear Producto"}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProductoForm
