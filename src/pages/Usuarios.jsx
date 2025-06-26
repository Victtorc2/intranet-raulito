import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listarUsuarios,
  eliminarUsuario,
} from '../api/usuarioService';
import Swal from 'sweetalert2';
import '../styles/Usuarios.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await listarUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    }
  };

  const filtrarUsuarios = (texto) => {
    setFiltro(texto);
  };

  const confirmarEliminacion = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmacion.isConfirmed) {
      try {
        await eliminarUsuario(id);
        cargarUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const usuariosFiltrados = Array.isArray(usuarios)
    ? usuarios.filter((usuario) =>
        (`${usuario.nombre} ${usuario.apellido}`)
          .toLowerCase()
          .includes(filtro.toLowerCase())
      )
    : [];

  return (
    <div className="usuarios-container">
      <h2>Gestión de Usuarios</h2>

      <div className="controles-container">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={(e) => filtrarUsuarios(e.target.value)}
        />
        <button
          className="nuevo-usuario"
          onClick={() => navigate('/usuarios/crear')}
        >
          Nuevo usuario
        </button>
      </div>

      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((usuario) => (
            <tr key={usuario.id}>
              <td data-label="Usuario">
                <div className="usuario-info">
                  <div className="avatar">
                    {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                  </div>
                  <span className="usuario-nombre">
                    {usuario.nombre} {usuario.apellido}
                  </span>
                </div>
              </td>
              <td data-label="Email">{usuario.correo}</td>
              <td data-label="Rol">
                <span className="rol-badge">
                  {[...usuario.roles].join(', ')}
                </span>
              </td>
              <td data-label="Acciones">
                <div className="acciones-container">
                  <button
                    className="editar-btn"
                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                    title="Editar usuario"
                  />
                  <button
                    className="eliminar-btn"
                    onClick={() => confirmarEliminacion(usuario.id)}
                    title="Eliminar usuario"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios;
