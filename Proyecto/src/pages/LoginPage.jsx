import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ToastContainer from '../components/ui/ToastContainer.jsx';
import { readSession, storage, writeSession } from '../utils/storage.js';

function LoginPage() {
  const navigate = useNavigate();
  const session = readSession();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);

  if (session) {
    return <Navigate to="/app" replace />;
  }

  function notify(message, type = 'info') {
    const toast = {
      id: Date.now().toString(),
      message,
      type
    };
    setToasts((current) => [...current, toast]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 2600);
  }

  function registerLoginActivity(username) {
    const actividad = storage.getActividad();
    storage.setActividad(
      [
        {
          id: Date.now().toString(),
          mensaje: `Inicio de sesión exitoso: ${username}`,
          fecha: new Date().toISOString()
        },
        ...actividad
      ].slice(0, 10)
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.usuario.trim()) {
      nextErrors.usuario = 'Ingrese el usuario';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Ingrese la contraseña';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const usuario = form.usuario.trim();
    const password = form.password.trim();
    const usuarios = storage.getUsuarios();
    let authenticatedUser = usuarios.find(
      (item) => item.usuario === usuario && item.password === password
    );

    if (!authenticatedUser && usuarios.length === 0 && usuario === 'admin' && password === 'admin123') {
      authenticatedUser = {
        id: 'admin-prueba',
        nombre: 'Admin',
        usuario: 'admin'
      };
    }

    if (!authenticatedUser) {
      setErrors({
        usuario: 'Usuario o contraseña incorrectos',
        password: 'Usuario o contraseña incorrectos'
      });
      notify('Usuario o contraseña incorrectos', 'error');
      return;
    }

    writeSession(authenticatedUser);
    registerLoginActivity(authenticatedUser.usuario);
    notify('Inicio de sesión exitoso', 'success');

    setTimeout(() => {
      navigate('/app');
    }, 500);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Gestion de Activos</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="usuario">Usuario</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={form.usuario}
              className={errors.usuario ? 'input-error' : form.usuario ? 'input-success' : ''}
              onChange={(event) => setForm((current) => ({ ...current, usuario: event.target.value }))}
            />
            <small className="error">{errors.usuario || ''}</small>
          </div>
          <div className="input-group">
            <label htmlFor="password">Contrasena</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              className={errors.password ? 'input-error' : form.password ? 'input-success' : ''}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <small className="error">{errors.password || ''}</small>
          </div>
          <button type="submit">Iniciar Sesion</button>
        </form>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default LoginPage;
