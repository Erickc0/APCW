import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTableHighlight } from '../utils/useTableHighlight.js';
import { hasMinLength, isLettersOnly, isRequired, isValidEmail } from '../utils/validators.js';

function UsersPage() {
  const {
    usuarios,
    asignaciones,
    setUsuarios,
    setAsignaciones,
    confirm,
    notify,
    registerActivity
  } = useOutletContext();
  const [form, setForm] = useState({ nombre: '', usuario: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { getRowProps } = useTableHighlight(() => setSearch(''));

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm({ nombre: '', usuario: '', email: '', password: '' });
    setErrors({});
    setEditingId(null);
  }

  function validate() {
    const nextErrors = {};

    if (!isLettersOnly(form.nombre)) {
      nextErrors.nombre = 'Solo se permiten letras';
    }

    if (!hasMinLength(form.usuario, 4)) {
      nextErrors.usuario = 'Mínimo 4 caracteres';
    } else if (
      usuarios.some(
        (item) => item.usuario.toLowerCase() === form.usuario.trim().toLowerCase() && item.id !== editingId
      )
    ) {
      nextErrors.usuario = 'El usuario ya existe';
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email = 'Correo inválido';
    } else if (
      usuarios.some((item) => item.email.toLowerCase() === form.email.trim().toLowerCase() && item.id !== editingId)
    ) {
      nextErrors.email = 'El correo ya existe';
    }

    if (!hasMinLength(form.password, 6)) {
      nextErrors.password = 'Mínimo 6 caracteres';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      notify('Revisa los datos del usuario', 'error');
      return;
    }

    const userData = {
      id: editingId || Date.now().toString(),
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      email: form.email.trim(),
      password: form.password.trim()
    };

    if (editingId) {
      setUsuarios((current) => current.map((item) => (item.id === editingId ? userData : item)));
      registerActivity(`Usuario actualizado: ${userData.nombre}`);
      notify('Usuario actualizado correctamente', 'success');
    } else {
      setUsuarios((current) => [...current, userData]);
      registerActivity(`Usuario registrado: ${userData.nombre}`);
      notify('Usuario registrado correctamente', 'success');
    }

    resetForm();
  }

  function editUser(user) {
    setEditingId(user.id);
    setForm({
      nombre: user.nombre,
      usuario: user.usuario,
      email: user.email,
      password: user.password
    });
    setErrors({});
  }

  function deleteUser(user) {
    confirm('¿Está seguro de eliminar este usuario?', () => {
      const removedAssignments = asignaciones.filter((assignment) => assignment.usuarioId === user.id);
      setAsignaciones((current) => current.filter((assignment) => assignment.usuarioId !== user.id));
      setUsuarios((current) => current.filter((item) => item.id !== user.id));
      registerActivity(
        `Usuario eliminado: ${user.nombre}${
          removedAssignments.length > 0 ? ` (asignaciones eliminadas: ${removedAssignments.length})` : ''
        }`
      );
      notify('Usuario eliminado correctamente', 'info');

      if (editingId === user.id) {
        resetForm();
      }
    });
  }

  const filteredUsers = usuarios.filter(
    (item) =>
      item.nombre.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.usuario.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.email.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <section className="card">
      <h1>Registro de Usuarios</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <InputGroup
            label="Nombre"
            value={form.nombre}
            error={errors.nombre}
            onChange={(value) => updateField('nombre', value)}
          />
          <InputGroup
            label="Usuario"
            value={form.usuario}
            error={errors.usuario}
            onChange={(value) => updateField('usuario', value)}
          />
        </div>
        <div className="grid-2">
          <InputGroup
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(value) => updateField('email', value)}
          />
          <InputGroup
            label="Contraseña"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={(value) => updateField('password', value)}
          />
        </div>
        <div className="form-actions">
          <button type="submit">{editingId ? 'Actualizar Usuario' : 'Guardar Usuario'}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-toolbar">
        <div className="input-group">
          <label>Buscar Usuario</label>
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-table">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} {...getRowProps(user.id)}>
                  <td>{user.nombre}</td>
                  <td>{user.usuario}</td>
                  <td>{user.email}</td>
                  <td>
                    <button type="button" className="btn-table" onClick={() => editUser(user)}>
                      Editar
                    </button>
                    <button type="button" className="btn-table btn-danger" onClick={() => deleteUser(user)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InputGroup({ label, type = 'text', value, error, onChange }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        className={error ? 'input-error' : isRequired(value) ? 'input-success' : ''}
        onChange={(event) => onChange(event.target.value)}
      />
      <small className="error">{error || ''}</small>
    </div>
  );
}

export default UsersPage;
