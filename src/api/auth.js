import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const loginRequest = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);

  const { token, role, correo } = response.data; // 👈 CAMBIO AQUÍ

  // Guardamos el token y el correo (como 'usuario') en localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', correo); // 👈 GUARDAMOS EL CORREO COMO 'usuario'

  return { token, role };
};
