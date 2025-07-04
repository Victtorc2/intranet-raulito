import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Login from '../pages/Login';
import Inicio from '../pages/Inicio';
import ProtectedRoute from '../auth/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import Inventario from '../pages/Inventario';
import Ventas from '../pages/Ventas';
import Productos from '../pages/Productos';
import Reportes from '../pages/Reportes';
import Usuarios from '../pages/Usuarios';
import Auditoria from '../pages/Auditoria';
import ProductoForm from '../components/ProductoForm';
import FormularioUsuario from '../components/FormularioUsuario';

const AppRouter = () => {
  const { isLoggedIn, getRole } = useAuth();
  const role = getRole();

  return (
    <Router>
      <Routes>
        {/* Redirección según login */}
        <Route path="/" element={isLoggedIn() ? <Navigate to="/inicio" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas comunes para Admin y Empleado */}
        <Route
          path="/inicio"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Empleado']}>
              {role === 'Admin' ? (
                <AdminLayout>
                  <Inicio />
                </AdminLayout>
              ) : (
                <EmployeeLayout>
                  <Inicio />
                </EmployeeLayout>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Empleado']}>
              {role === 'Admin' ? (
                <AdminLayout>
                  <Inventario />
                </AdminLayout>
              ) : (
                <EmployeeLayout>
                  <Inventario />
                </EmployeeLayout>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Empleado']}>
              {role === 'Admin' ? (
                <AdminLayout>
                  <Ventas />
                </AdminLayout>
              ) : (
                <EmployeeLayout>
                  <Ventas />
                </EmployeeLayout>
              )}
            </ProtectedRoute>
          }
        />

        {/* Rutas exclusivas para Admin */}
        <Route
  path="/productos"
  element={
    <ProtectedRoute allowedRoles={['Admin', 'Empleado']}>
      {role === 'Admin' ? (
        <AdminLayout>
          <Productos />
        </AdminLayout>
      ) : (
        <EmployeeLayout>
          <Productos />
        </EmployeeLayout>
      )}
    </ProtectedRoute>
  }
/>

       <Route
  path="/productos/crear"
  element={
    <ProtectedRoute allowedRoles={['Admin', 'Empleado']}>
      {role === 'Admin' ? (
        <AdminLayout>
          <ProductoForm />
        </AdminLayout>
      ) : (
        <EmployeeLayout>
          <ProductoForm />
        </EmployeeLayout>
      )}
    </ProtectedRoute>
  }
/>
<Route
  path="/productos/editar/:id"
  element={
    <ProtectedRoute allowedRoles={['Admin', 'Empleado']}>
      {role === 'Admin' ? (
        <AdminLayout>
          <ProductoForm />
        </AdminLayout>
      ) : (
        <EmployeeLayout>
          <ProductoForm />
        </EmployeeLayout>
      )}
    </ProtectedRoute>
  }
/>

        <Route
          path="/reportes"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <Reportes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <Usuarios />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Crear y Editar Usuarios */}
        <Route
          path="/usuarios/crear"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <FormularioUsuario />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/editar/:id"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <FormularioUsuario />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/auditoria"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <Auditoria />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
