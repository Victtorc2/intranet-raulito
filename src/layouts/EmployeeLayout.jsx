import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const EmployeeLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');  // Redirige al login después de hacer logout
  };

  return (
    <div className="layout-container">
      {/* Encabezado */}
      <header className="header">
        <h1>Supermercado Raulito</h1>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      {/* Contenedor de la navegación lateral derecha */}
      <div className="sidebar-right">
        <Navbar /> {/* Renderiza el Navbar en el lado derecho */}
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};
export default EmployeeLayout;
