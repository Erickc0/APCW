export const STORAGE_KEYS = {
  usuarios: 'usuariosRegistrados',
  activos: 'activosRegistrados',
  asignaciones: 'asignacionesRegistradas',
  mantenimientos: 'mantenimientosRegistrados',
  bajas: 'bajasRegistradas',
  actividad: 'actividadReciente'
};

export const SESSION_KEY = 'sesionActiva';

export function readArray(key) {
  try {
    const value = window.localStorage.getItem(key);
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeArray(key, data) {
  window.localStorage.setItem(key, JSON.stringify(Array.isArray(data) ? data : []));
}

export function readSession() {
  try {
    const session = JSON.parse(window.sessionStorage.getItem(SESSION_KEY));
    return session && session.usuario ? session : null;
  } catch {
    return null;
  }
}

export function writeSession(user) {
  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: user.id,
      nombre: user.nombre || user.usuario,
      usuario: user.usuario,
      fechaInicio: new Date().toISOString()
    })
  );
}

export function clearSession() {
  window.sessionStorage.clear();
}

export const storage = {
  getUsuarios: () => readArray(STORAGE_KEYS.usuarios),
  setUsuarios: (data) => writeArray(STORAGE_KEYS.usuarios, data),
  getActivos: () => readArray(STORAGE_KEYS.activos),
  setActivos: (data) => writeArray(STORAGE_KEYS.activos, data),
  getAsignaciones: () => readArray(STORAGE_KEYS.asignaciones),
  setAsignaciones: (data) => writeArray(STORAGE_KEYS.asignaciones, data),
  getMantenimientos: () => readArray(STORAGE_KEYS.mantenimientos),
  setMantenimientos: (data) => writeArray(STORAGE_KEYS.mantenimientos, data),
  getBajas: () => readArray(STORAGE_KEYS.bajas),
  setBajas: (data) => writeArray(STORAGE_KEYS.bajas, data),
  getActividad: () => readArray(STORAGE_KEYS.actividad),
  setActividad: (data) => writeArray(STORAGE_KEYS.actividad, data)
};
