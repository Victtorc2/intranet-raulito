import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const loginRequest = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);

  
  const { token, role, correo, id } = response.data;

  
  localStorage.setItem(
    'usuario',
    JSON.stringify({ id, correo })
  );
  localStorage.setItem('token', token);

  return { token, role, id };
};
