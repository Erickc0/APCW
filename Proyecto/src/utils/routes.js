export const appRoutes = [
  { path: '/app', label: 'Menú Principal', module: 'dashboard', description: 'Panel de control.' },
  { path: '/app/usuarios', label: 'Usuarios', module: 'usuarios', description: 'Gestión de usuarios.' },
  { path: '/app/activos', label: 'Activos', module: 'activos', description: 'Registro de activos.' },
  {
    path: '/app/mantenimiento',
    label: 'Mantenimiento',
    module: 'mantenimiento',
    description: 'Control de mantenimiento.'
  },
  { path: '/app/asignaciones', label: 'Asignación', module: 'asignaciones', description: 'Asignar activos.' },
  { path: '/app/bajas', label: 'Baja', module: 'bajas', description: 'Dar de baja activos.' },
  { path: '/app/reportes', label: 'Reportes', module: 'reportes', description: 'Resumen consolidado del sistema.' }
];
