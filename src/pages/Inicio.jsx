import { useAuth } from '../auth/AuthContext';

const Inicio = () => {
  const { getRole } = useAuth();
  const role = getRole();

  console.log('Rol en Inicio:', role);  // Verifica el rol aquí

  return (
    <div>
      <h1>Bienvenido al módulo de Inicio</h1>
      <p>Tu rol: {role}</p>
    </div>
  );
};

export default Inicio;
