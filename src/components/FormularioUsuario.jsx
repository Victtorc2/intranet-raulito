import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  crearUsuario,
  actualizarUsuario,
  obtenerUsuarioPorId,
} from '../api/usuarioService';
import Swal from 'sweetalert2';
import '../styles/FormularioUsuario.css'; // Asegúrate de tener este archivo CSS para estilos

const FormularioUsuario = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    dni: '',
    password: '',
    roles: [],
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Si existe id => modo edición
  const esEdicion = Boolean(id);

  const rolesDisponibles = ['ADMIN', 'EMPLEADO'];

  useEffect(() => {
    if (esEdicion) {
      obtenerUsuarioPorId(id)
        .then((usuario) => {
          setForm({
            nombre: usuario.nombre || '',
            apellido: usuario.apellido || '',
            correo: usuario.correo || '',
            dni: usuario.dni || '',
            password: '',
            roles: [...(usuario.roles || [])],
          });
        })
        .catch((error) => {
          console.error('Error al cargar usuario:', error);
          navigate('/usuarios');
        });
    }
  }, [id, esEdicion, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRolChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      roles: checked
        ? [...prev.roles, value]
        : prev.roles.filter((rol) => rol !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuarioData = {
      ...form,
      dni: parseInt(form.dni),
    };

    try {
      if (esEdicion) {
        await actualizarUsuario(id, usuarioData);
        Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
      } else {
        await crearUsuario(usuarioData);
        Swal.fire('Creado', 'Usuario creado correctamente', 'success');
      }

      navigate('/usuarios');
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  // Actualización sugerida para el componente FormularioUsuario

return (
  <div className="formulario-usuario-container">
    <h3>{esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
    
    <form onSubmit={handleSubmit} className="formulario-usuario">
      <div className="form-section">
        <div className="field-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="apellido">Apellido</label>
          <input
            id="apellido"
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Ingresa el apellido"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="dni">DNI</label>
          <input
            id="dni"
            type="number"
            name="dni"
            value={form.dni}
            onChange={handleChange}
            placeholder="Número de documento"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        {!esEdicion && (
          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña segura"
              required
            />
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="field-group">
          <label>Roles del usuario</label>
          <div className="roles-checkboxes">
            {rolesDisponibles.map((rol) => (
              <label key={rol}>
                <input
                  type="checkbox"
                  value={rol}
                  checked={form.roles.includes(rol)}
                  onChange={handleRolChange}
                />
                <span>{rol}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit">
          {esEdicion ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
        <button type="button" onClick={() => navigate('/usuarios')}>
          Cancelar
        </button>
      </div>
    </form>
  </div>
);
}

export default FormularioUsuario;
