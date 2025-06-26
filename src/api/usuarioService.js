// src/services/usuarioService.js

import axios from 'axios';
import Swal from 'sweetalert2';

const apiUrl = 'http://localhost:8080/api/usuarios';

const getAuthToken = () => localStorage.getItem('token');
const getUsuario = () => localStorage.getItem('usuario');

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
        mensaje = 'Usuario no encontrado.';
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

const config = () => ({
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
    'usuario': getUsuario(),
    'Content-Type': 'application/json',
  }
});

export const listarUsuarios = async () => {
  try {
    const response = await axios.get(apiUrl, config());
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const obtenerUsuarioPorId = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/${id}`, config());
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const crearUsuario = async (usuario) => {
  try {
    const response = await axios.post(apiUrl, usuario, config());
    Swal.fire('Éxito', 'Usuario creado exitosamente.', 'success');
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const actualizarUsuario = async (id, usuario) => {
  try {
    const response = await axios.put(`${apiUrl}/${id}`, usuario, config());
    Swal.fire('Éxito', 'Usuario actualizado exitosamente.', 'success');
    return response.data;
  } catch (error) {
    return manejarError(error);
  }
};

export const eliminarUsuario = async (id) => {
  try {
    const response = await axios.delete(`${apiUrl}/${id}`, config());
    if (response.status === 204) {
      Swal.fire('Éxito', 'Usuario eliminado exitosamente.', 'success');
    }
  } catch (error) {
    return manejarError(error);
  }
};
