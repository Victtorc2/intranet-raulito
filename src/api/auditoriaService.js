import axios from 'axios';
const API_URL = 'http://localhost:8080/api/auditoria'; 


const getAuthToken = () => {
  return localStorage.getItem('token'); 
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

  console.error(mensaje);  
  throw error;  
};


export const obtenerRegistrosAuditoria = async () => {
  try {
    
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`, 
      },
    });
    return response.data;  
  } catch (error) {
    manejarError(error);  
  }
};
