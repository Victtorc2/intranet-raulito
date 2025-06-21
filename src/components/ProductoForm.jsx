import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearProducto, actualizarProducto, obtenerProductoPorId } from "../api/productoService";
import Swal from "sweetalert2";
import { useForm, Controller } from "react-hook-form";

const apiUrl = "http://localhost:8080/api/productos";

const ProductoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [imagenPrevia, setImagenPrevia] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);

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
  });

  const watchedStock = watch("stock");
  const watchedPrecio = watch("precio");

  useEffect(() => {
    if (id) {
      const cargarProducto = async () => {
        setCargando(true);
        try {
          const productoData = await obtenerProductoPorId(id);
          setValue("nombre", productoData.nombre || "");
          setValue("codigo", productoData.codigo || "");
          setValue("categoria", productoData.categoria || "");
          setValue("precio", productoData.precio || 0);
          setValue("stock", productoData.stock || 0);
          setValue("proveedor", productoData.proveedor || "");
          setValue("presentacion", productoData.presentacion || "");
          setValue("fechaVencimiento", productoData.fechaVencimiento ? productoData.fechaVencimiento.split("T")[0] : "");

          if (productoData.imagen) {
            setImagenPrevia(`${apiUrl}/${id}/imagen?timestamp=${Date.now()}`);
          }

          setErrorCarga(null);
        } catch (error) {
          setErrorCarga("No se pudo cargar el producto. Puedes continuar editando.");
        } finally {
          setCargando(false);
        }
      };
      cargarProducto();
    }
  }, [id, setValue]);

const onSubmit = async (data) => {
  setGuardando(true);

  // Convertir el precio a número y asegurarse de que es mayor que 0
  let precio = parseFloat(data.precio);

  console.log("Precio en el frontend antes de enviarlo:", precio); // Verificar que es un número

  // Verificar que el precio es válido
  if (isNaN(precio) || precio <= 0) {
    Swal.fire({
      title: "Error",
      text: "El precio es obligatorio y debe ser mayor que 0",
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
    setGuardando(false);
    return;
  }

  // Preparar los datos a enviar con el precio correctamente convertido
  const productoData = {
    ...data,
    precio: precio, // Asignar el precio convertido
  };

  console.log("Datos que se envían al backend:", productoData);

  const { imagen, ...restoProducto } = productoData;

  const formData = new FormData();
  // Convertir el JSON en un Blob
  formData.append('producto', new Blob([JSON.stringify(restoProducto)], { type: 'application/json' }));

  // Asegurarse de que la imagen se agrega correctamente
  if (imagen && imagen[0]) {
    formData.append('imagen', imagen[0]);
  }

  try {
    // Verificar que se esté llamando correctamente la API
    console.log("FormData enviado:", formData);
    
    if (id) {
      await actualizarProducto(id, formData);
      Swal.fire({
        title: "¡Actualizado!",
        text: "Producto actualizado correctamente",
        icon: "success",
        confirmButtonColor: "#198754",
      });
    } else {
      await crearProducto(formData); // Usamos `formData` directamente
      Swal.fire({
        title: "¡Creado!",
        text: "Producto creado correctamente",
        icon: "success",
        confirmButtonColor: "#198754",
      });
    }
    navigate("/productos");
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "No se pudo guardar el producto",
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
  } finally {
    setGuardando(false);
  }
};



  const handleImageChange = (e, field) => {
    field.onChange(e.target.files);
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPrevia(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCategoriaIcon = (categoria) => {
    const iconMap = {
      Dulces: "bi-candy",
      Bebidas: "bi-cup-straw",
      Gaseosas: "bi-droplet",
      Carnes: "bi-meat",
      Frutas: "bi-apple",
      Lácteos: "bi-milk",
      Panadería: "bi-bread-slice",
    };
    return iconMap[categoria] || "bi-box";
  };

  const getStockStatus = (stock) => {
    if (stock < 5) return { color: "text-danger", icon: "bi-exclamation-triangle", text: "Stock crítico" };
    if (stock < 10) return { color: "text-warning", icon: "bi-exclamation-circle", text: "Stock bajo" };
    return { color: "text-success", icon: "bi-check-circle", text: "Stock saludable" };
  };

  if (cargando) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h4 className="mt-3 text-muted">Cargando producto...</h4>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate("/productos")}>
                  <i className="bi bi-house-door me-1"></i>
                  Productos
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {id ? "Editar" : "Crear"} Producto
              </li>
            </ol>
          </nav>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">
                <i className={`${id ? "bi-pencil-square" : "bi-plus-circle"} text-primary me-2`}></i>
                {id ? "Editar Producto" : "Crear Nuevo Producto"}
              </h1>
              <p className="text-muted mb-0">
                {id ? "Modifica la información del producto" : "Completa los datos para agregar un nuevo producto"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert de error */}
      {errorCarga && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorCarga}
          <button type="button" className="btn-close" onClick={() => setErrorCarga(null)} aria-label="Close"></button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          {/* Información Básica */}
          <div className="col-lg-8">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Información Básica
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-tag me-1"></i>
                      Nombre del Producto *
                    </label>
                    <Controller
                      name="nombre"
                      control={control}
                      rules={{ required: "El nombre es obligatorio" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`form-control form-control-lg ${errors.nombre ? "is-invalid" : ""}`}
                          placeholder="Ej: Coca Cola 500ml"
                        />
                      )}
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-upc me-1"></i>
                      Código del Producto *
                    </label>
                    <Controller
                      name="codigo"
                      control={control}
                      rules={{ required: "El código es obligatorio" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`form-control form-control-lg ${errors.codigo ? "is-invalid" : ""}`}
                          placeholder="Ej: CC500ML"
                        />
                      )}
                    />
                    {errors.codigo && <div className="invalid-feedback">{errors.codigo.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-collection me-1"></i>
                      Categoría *
                    </label>
                    <Controller
                      name="categoria"
                      control={control}
                      rules={{ required: "La categoría es obligatoria" }}
                      render={({ field }) => (
                        <select
                          className={`form-select form-select-lg ${errors.categoria ? "is-invalid" : ""}`}
                          {...field}
                        >
                          <option value="">Selecciona una categoría</option>
                          <option value="Dulces">🍬 Dulces</option>
                          <option value="Bebidas">🥤 Bebidas</option>
                          <option value="Gaseosas">🥤 Gaseosas</option>
                          <option value="Carnes">🥩 Carnes</option>
                          <option value="Frutas">🍎 Frutas</option>
                          <option value="Lácteos">🥛 Lácteos</option> 
                          <option value="Panadería">🍞 Panadería</option>
                          <option value="Limpieza"> Limpieza</option>

                        </select>
                      )}
                    />
                    {errors.categoria && <div className="invalid-feedback">{errors.categoria.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-box me-1"></i>
                      Presentación
                    </label>
                    <Controller
                      name="presentacion"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="form-control form-control-lg"
                          placeholder="Ej: Botella 500ml, Paquete 250g"
                        />
                      )}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-building me-1"></i>
                      Proveedor
                    </label>
                    <Controller
                      name="proveedor"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          className="form-control form-control-lg"
                          placeholder="Ej: Distribuidora ABC"
                        />
                      )}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-calendar-event me-1"></i>
                      Fecha de Vencimiento
                    </label>
                    <Controller
                      name="fechaVencimiento"
                      control={control}
                      render={({ field }) => <input {...field} className="form-control form-control-lg" type="date" />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen del Producto */}
          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-info text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-image me-2"></i>
                  Imagen del Producto
                </h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  {imagenPrevia ? (
                    <div className="position-relative d-inline-block">
                      <img
                        src={imagenPrevia || "/placeholder.svg"}
                        alt="Vista previa"
                        className="img-fluid rounded border"
                        style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={() => setImagenPrevia("")}
                        title="Eliminar imagen"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border border-dashed border-2 rounded d-flex flex-column align-items-center justify-content-center text-muted"
                      style={{ height: "250px" }}
                    >
                      <i className="bi bi-cloud-upload display-1 mb-3"></i>
                      <p className="mb-0">No hay imagen seleccionada</p>
                      <small>Formatos: JPG, PNG, GIF</small>
                    </div>
                  )}
                </div>

                <Controller
                  name="imagen"
                  control={control}
                  render={({ field }) => (
                    <input
                      className="form-control form-control-lg"
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleImageChange(e, field)}
                    />
                  )}
                />
                <small className="text-muted mt-2 d-block">
                  <i className="bi bi-info-circle me-1"></i>
                  Tamaño máximo: 5MB
                </small>
              </div>
            </div>
          </div>

          {/* Información Comercial */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-currency-dollar me-2"></i>
                  Información Comercial
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-currency-dollar me-1"></i>
                      Precio de Venta *
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">$</span>
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
                            className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                          />
                        )}
                      />
                      {errors.precio && <div className="invalid-feedback">{errors.precio.message}</div>}
                    </div>
                    {watchedPrecio > 0 && (
                      <small className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Precio válido
                      </small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-boxes me-1"></i>
                      Stock Disponible *
                    </label>
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
                          className={`form-control form-control-lg ${errors.stock ? "is-invalid" : ""}`}
                          type="number"
                          min="0"
                          placeholder="0"
                        />
                      )}
                    />
                    {errors.stock && <div className="invalid-feedback">{errors.stock.message}</div>}
                    {watchedStock >= 0 && (
                      <small className={getStockStatus(watchedStock).color}>
                        <i className={`${getStockStatus(watchedStock).icon} me-1`}></i>
                        {getStockStatus(watchedStock).text}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    <small>
                      <i className="bi bi-info-circle me-1"></i>
                      Los campos marcados con * son obligatorios
                    </small>
                  </div>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => navigate("/productos")}
                      disabled={guardando}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={guardando}>
                      {guardando ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {id ? "Actualizando..." : "Creando..."}
                        </>
                      ) : (
                        <>
                          <i className={`${id ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                          {id ? "Actualizar Producto" : "Crear Producto"}
                        </>
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
