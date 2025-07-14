import axios from 'axios';
import Swal from 'sweetalert2';

const apiUrl = `${import.meta.env.VITE_API_URL}/api/productos`;

const getAuthToken = () => localStorage.getItem('token');
const getUsuario = () => {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try {
    const { correo } = JSON.parse(raw);
    return correo;  // ✅ Devuelve solo el string del correo
  } catch {
    return raw;  // Por si ya está como string
  }
};

const manejarError = (error) => {
  let mensaje = 'Hubo un problema. Por favor, intenta más tarde.';
  
  if (error.response) {
    mensaje = error.response.data?.message || mensaje;
    
    switch (error.response.status) {
      case 403:
        mensaje = 'No tienes permisos para realizar esta acción.';
        break;
      case 400:
        mensaje = 'Datos inválidos: ' + mensaje;
        break;
      case 404:
        mensaje = 'Producto no encontrado.';
        break;
      case 500:
        mensaje = 'Error interno del servidor. Intenta más tarde.';
        break;
      default:
        mensaje = `Error desconocido: ${mensaje}`;
    }
  } else if (error.request) {
    mensaje = 'No se pudo conectar al servidor. Revisa tu conexión.';
  }

  Swal.fire('Error', mensaje, 'error');
  throw error;
};

const configMultipart = () => ({
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'multipart/form-data',
    'usuario': getUsuario()  // Enviar el usuario en el header
  }
});

export const listarProductos = async (nombre, categoria, codigo) => {
  try {
    const params = { nombre, categoria, codigo };
    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      params
    });
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const verificarStock = async (id, cantidad) => {
  try {
    // Reutilizamos tu export existente
    const producto = await obtenerProductoPorId(id)
    return producto.stock >= cantidad
  } catch (err) {
    console.error("Error comprobando stock:", err)
    // En caso de fallo asumimos que no hay stock suficiente
    return false
  }
}

export const obtenerProductoPorId = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    // Modificado para no mostrar alerta aquí, se manejará en el componente
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

export const crearProducto = async (productoData, imagenFile) => {
  try {
    const formData = new FormData();
    // Asegúrate de que el productoData esté en el formato adecuado
    formData.append('producto', new Blob([JSON.stringify(productoData)], { type: 'application/json' }));
    
    // Si hay imagen, la añadimos
    if (imagenFile) formData.append('imagen', imagenFile); // Agregar imagen si existe

    const response = await axios.post(apiUrl, formData, configMultipart());
    Swal.fire('Éxito', 'Producto creado exitosamente.', 'success');
    return response.data;
  } catch (error) {
    return manejarError(error);  // Maneja el error si ocurre
  }
};


export const actualizarProducto = async (id, formData) => {
  try {
    const response = await axios.put(`${apiUrl}/${id}`, formData, configMultipart());
    Swal.fire('Éxito', 'Producto actualizado exitosamente.', 'success');
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const eliminarProducto = async (id) => {
  try {
    const response = await axios.delete(`${apiUrl}/${id}`, {
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`,
        'usuario': getUsuario()  // Asegúrate de enviar el usuario al eliminar
      }
    });

    if (response.status === 204) {
      Swal.fire('Éxito', 'Producto eliminado exitosamente.', 'success');
    }
  } catch (error) {
    return manejarError(error);
  }
};

export const productosProximosAVencer = async () => {
  try {
    const response = await axios.get(`${apiUrl}/alertas/vencimiento`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const productosStockBajo = async () => {
  try {
    const response = await axios.get(`${apiUrl}/alertas/stock-bajo`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};