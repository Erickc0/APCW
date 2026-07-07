import { useMemo } from 'react';
import { clearSession, readSession, storage } from '../../utils/storage.js';

function Topbar({ session: currentSession, globalSearch, onGlobalSearchChange, registerActivity, confirm }) {
  const session = currentSession || readSession();
  const currentDate = useMemo(() => new Date().toLocaleDateString('es-ES'), []);

  function handleLogout() {
    confirm('¿Está seguro de cerrar sesión?', () => {
      const actividad = storage.getActividad();
      storage.setActividad(
        [
          {
            id: Date.now().toString(),
            mensaje: 'Cierre de sesión',
            fecha: new Date().toISOString()
          },
          ...actividad
        ].slice(0, 10)
      );
      registerActivity('Cierre de sesión');
      clearSession();
      window.location.href = '/';
    });
  }

  return (
    <header className="topbar">
      <div>
        <h2>Sistema de Gestion de Activos</h2>
        <p>Panel de control operativo</p>
      </div>
      <div className="topbar-search">
        <label htmlFor="buscarGlobal">Buscador Global</label>
        <input
          type="text"
          id="buscarGlobal"
          placeholder="Buscar en usuarios, activos, asignaciones, mantenimientos y bajas"
          value={globalSearch}
          onChange={(event) => onGlobalSearchChange(event.target.value)}
        />
      </div>
      <div className="topbar-meta">
        <span>Usuario: {session?.nombre || 'Sin sesion'}</span>
        <span>Fecha: {currentDate}</span>
        <button type="button" className="btn-secondary" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}

export default Topbar;
