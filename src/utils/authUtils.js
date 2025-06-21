import jwt_decode from 'jwt-decode';

// Función para obtener el rol del token
export const getRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return null;
  }

  try {
    const decodedToken = jwt_decode(token);  // Decodificamos el token
    console.log('Token decodificado:', decodedToken);  // Verifica lo que contiene el token

    // Buscamos el rol dentro de 'authorities' y extraemos el 'authority' que contiene el rol
    const role = decodedToken.authorities?.find(auth => auth.authority.startsWith('ROLE_'))?.authority;
    console.log('Rol encontrado:', role);
    
    return role;  // Retornamos el rol (por ejemplo, "ROLE_ADMIN")
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};
