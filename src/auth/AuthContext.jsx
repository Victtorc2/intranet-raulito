import { createContext, useState, useContext, useEffect } from 'react';
import { loginRequest } from '../api/auth';
import { saveToken, getToken, getRole, clearToken } from '../utils/tokenUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      setUser({ token, role });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { token, role } = await loginRequest(credentials);
      console.log('Datos recibidos del backend:', { token, role });

      localStorage.setItem('token', token);   // Guardar token en localStorage
      localStorage.setItem('role', role);     // Guardar rol en localStorage
      setUser({ token, role });               // Actualiza el estado
      return true;
    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  const isLoggedIn = () => !!user;
  const getRole = () => user?.role;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn, getRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
