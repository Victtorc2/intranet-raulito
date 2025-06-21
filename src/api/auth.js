import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const loginRequest = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  const { token, role, usuario } = response.data; // Suponiendo que también se devuelve el usuario

  // Guardamos el token y el usuario en localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', usuario);  // Asegúrate de guardar el nombre de usuario

  return { token, role };
};
