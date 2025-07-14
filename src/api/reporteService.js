import axios from 'axios';
import Swal from 'sweetalert2';

const API = import.meta.env.VITE_API_URL;

const manejarError = (error) => {
  let mensaje = 'Hubo un problema. Intenta más tarde.';

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
        mensaje = 'Recurso no encontrado.';
        break;
      case 500:
        mensaje = 'Error interno del servidor.';
        break;
      default:
        mensaje = `Error desconocido: ${mensaje}`;
    }
  } else if (error.request) {
    mensaje = 'No se pudo conectar al servidor.';
  }

  Swal.fire('Error', mensaje, 'error');
  throw error;
};

export const obtenerHistorialVentas = async () => {
  try {
    const res = await axios.get(`${API}/api/ventas/historial`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener historial de ventas:", error);
    throw error;
  }
};

export const obtenerStockBajo = async () => {
  try {
    const res = await axios.get(`${API}/api/inventario/stock-bajo`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return res.data;
  } catch (error) {
    manejarError(error);
  }
};

export const obtenerIngresosMensuales = async () => {
  try {
    const res = await axios.get(`${API}/api/ventas/reporte/por-mes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return res.data;
  } catch (error) {
    manejarError(error);
  }
};

export const obtenerVentasPorDia = async () => {
  try {
    const res = await axios.get(`${API}/api/ventas/reporte/por-dia`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return res.data;
  } catch (error) {
    manejarError(error);
  }
};

export const obtenerMovimientos = async () => {
  try {
    const res = await axios.get(`${API}/api/inventario`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return res.data;
  } catch (error) {
    manejarError(error);
  }
};
