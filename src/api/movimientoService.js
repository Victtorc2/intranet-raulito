import axios from 'axios';
import Swal from 'sweetalert2';

const apiUrl = `${import.meta.env.VITE_API_URL}/api/inventario`;

const getAuthToken = () => localStorage.getItem('token');

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

export const registrarMovimiento = async (movimiento) => {
  try {
    const response = await axios.post(apiUrl, movimiento, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    Swal.fire('Éxito', 'Movimiento registrado exitosamente', 'success');
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const listarMovimientos = async () => {
  try {
    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const filtrarMovimientosPorTipo = async (tipo) => {
  try {
    const response = await axios.get(`${apiUrl}/tipo/${tipo}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};
