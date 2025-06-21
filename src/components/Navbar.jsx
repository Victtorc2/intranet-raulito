import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const { getRole } = useAuth();  // Obtener el rol del usuario
  const role = getRole();

  // Asumiendo que puedes pasar la URL de la imagen del usuario
  const userImage = 'https://img.freepik.com/vector-premium/icono-circulo-usuario-anonimo-ilustracion-vector-estilo-plano-sombra_520826-1931.jpg';  // Cambia esto a la URL real de la imagen
  const userName = 'Raulito';  // Asigna el nombre del usuario manualmente o desde el AuthContext
  const userRole = role;  // El rol puede obtenerse del contexto, o también se puede asignar manualmente
  
  return (
    <nav className="navbar">
      <div className="user-info">
        {/* Foto de usuario con URL */}
        <img src={userImage} alt="User" className="user-avatar" />
        <div className="user-details">
          {/* Nombre del usuario */}
          <p className="user-name">{userName}</p>
          {/* Rol del usuario */}
          <p className="user-role">{userRole}</p>
        </div>
      </div>

      <h2>Raulito Supermercado</h2>
      <ul>
        {/* Módulos comunes a Admin y Empleado */}
        <li><Link to="/inicio"><i className="fas fa-home"></i> Inicio</Link></li>
        <li><Link to="/inventario"><i className="fas fa-box"></i> Inventario</Link></li>
        <li><Link to="/ventas"><i className="fas fa-cart-arrow-down"></i> Ventas</Link></li>

        {/* Módulos solo para Admin */}
        {role === 'ADMIN' && (
          <>
            <li><Link to="/productos"><i className="fas fa-cogs"></i> Productos</Link></li>
            <li><Link to="/reportes"><i className="fas fa-chart-line"></i> Reportes</Link></li>
            <li><Link to="/usuarios"><i className="fas fa-users"></i> Usuarios</Link></li>
            <li><Link to="/Auditoria"><i className="fas fa-truck"></i> Auditoria</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
