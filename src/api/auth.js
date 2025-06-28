import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const loginRequest = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);

  // Ahora extraemos también el id:
  const { token, role, correo, id } = response.data;

  // Guardamos todo en localStorage como un JSON:
  localStorage.setItem(
    'usuario',
    JSON.stringify({ id, correo })
  );
  localStorage.setItem('token', token);

  return { token, role, id };
};
