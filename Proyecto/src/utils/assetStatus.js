export function maintenanceIsActive(maintenance) {
  return maintenance.estado !== 'Activo';
}

export function getRealAssetStatus(assetId, relations) {
  const hasDecommission = relations.bajas.some((item) => item.activoId === assetId);

  if (hasDecommission) {
    return 'Dado de baja';
  }

  const hasActiveMaintenance = relations.mantenimientos.some(
    (item) => item.activoId === assetId && maintenanceIsActive(item)
  );

  if (hasActiveMaintenance) {
    return 'En mantenimiento';
  }

  const hasAssignment = relations.asignaciones.some((item) => item.activoId === assetId);

  if (hasAssignment) {
    return 'Asignado';
  }

  return 'Disponible';
}

export function reconcileAssets(activos, relations) {
  return activos.map((asset) => ({
    ...asset,
    estado: getRealAssetStatus(asset.id, relations)
  }));
}

export function getAssetText(assetId, activos) {
  const asset = activos.find((item) => item.id === assetId);
  return asset ? `${asset.codigo} - ${asset.nombre}` : 'Activo eliminado';
}

export function getUserText(userId, usuarios) {
  const user = usuarios.find((item) => item.id === userId);
  return user ? `${user.nombre} (${user.usuario})` : 'Usuario eliminado';
}
