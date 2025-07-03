// src/services/auditoriaService.js
import axios from 'axios';

// URL del backend
const API_URL = 'http://localhost:8080/api/auditoria'; // Cambia la URL si es necesario

// Función para obtener el token de autenticación desde localStorage
const getAuthToken = () => {
  return localStorage.getItem('token'); // Devuelve el token JWT almacenado en localStorage
};

// Manejar errores de las solicitudes HTTP
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
        mensaje = 'Recurso no encontrado.';
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

  console.error(mensaje);  // Para depuración
  throw error;  // Lanza el error para manejarlo donde se llame esta función
};

export const obtenerRegistrosAuditoria = async () => {
  try {
    // Realiza la solicitud GET añadiendo el token JWT en los encabezados
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,  // Token JWT en el encabezado
      },
    });
    return response.data;  // Devuelve los datos de auditoría
  } catch (error) {
    manejarError(error);  // Maneja el error si la solicitud falla
  }
};
