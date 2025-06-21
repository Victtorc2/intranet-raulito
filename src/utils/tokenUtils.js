// Guardar el token y el rol en localStorage
export const saveToken = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

// Obtener el token desde localStorage
export const getToken = () => localStorage.getItem('token');

// Obtener el rol desde localStorage
export const getRole = () => localStorage.getItem('role');

// Limpiar el token y el rol de localStorage
export const clearToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};
