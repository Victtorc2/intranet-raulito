import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, getRole } = useAuth();
  const role = getRole();

  console.log('Rol en ProtectedRoute:', role);  // Verifica el rol aquí
  console.log('¿Está logueado?', isLoggedIn());  // Verifica si está logueado

  // Si no está logueado, redirige a /login
  if (!isLoggedIn()) {
    console.log('Redirigiendo al login');
    return <Navigate to="/login" replace />;
  }

  // Convertir ambos roles a minúsculas para compararlos insensiblemente
  const lowerCaseRole = role?.toLowerCase();
  const allowedRolesLowerCase = allowedRoles.map(role => role.toLowerCase());

  // Si el rol del usuario no es uno de los roles permitidos, redirige
  if (allowedRoles && !allowedRolesLowerCase.includes(lowerCaseRole)) {
    console.log('Redirigiendo a inicio debido a roles inválidos');
    console.log('Roles permitidos:', allowedRoles);
    return <Navigate to="/inicio" replace />;
  }

  // Si todo es válido, renderiza los hijos (componente destino)
  console.log('Renderizando children');
  return children;
};

export default ProtectedRoute;
