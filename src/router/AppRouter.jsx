import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';  // Trae la función de verificación del login
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
import ProductoForm from '../components/ProductoForm';  // Importar ProductoForm correctamente

const AppRouter = () => {
  const { isLoggedIn, getRole } = useAuth();  // Trae la función de verificación del login
  const role = getRole();  // Obtén el rol del usuario

  return (
    <Router>
      <Routes>
        {/* Redirige a /login si no está logueado */}
        <Route path="/" element={isLoggedIn() ? <Navigate to="/inicio" replace /> : <Navigate to="/login" replace />} />

        {/* Ruta de login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Inicio para Admin y Empleado */}
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

        {/* Módulos comunes a Admin y Empleado */}
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

        {/* Módulos solo para Admin */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <Productos />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/crear"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ProductoForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/editar/:id"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ProductoForm />
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
        <Route
          path="/Auditoria"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <Auditoria />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirige a login si la ruta no existe */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
