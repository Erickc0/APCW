import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAssetText } from '../utils/assetStatus.js';
import { useTableHighlight } from '../utils/useTableHighlight.js';
import { hasMinLength } from '../utils/validators.js';

function MaintenancePage() {
  const { activos, mantenimientos, setMantenimientos, confirm, notify, registerActivity } = useOutletContext();
  const emptyForm = { activoId: '', tipo: '', fecha: '', descripcion: '', estado: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { getRowProps } = useTableHighlight(() => setSearch(''));

  const selectableAssets = activos.filter((asset) => asset.estado !== 'Dado de baja');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
  }

  function validate() {
    const nextErrors = {};
    if (!form.activoId) nextErrors.activoId = 'Seleccione un activo';
    if (!form.tipo) nextErrors.tipo = 'Seleccione un tipo';
    if (!form.fecha) nextErrors.fecha = 'Seleccione una fecha';
    if (!hasMinLength(form.descripcion, 10)) nextErrors.descripcion = 'Mínimo 10 caracteres';
    if (!form.estado) nextErrors.estado = 'Seleccione un estado';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      notify('Revisa los datos del mantenimiento', 'error');
      return;
    }

    const maintenanceData = {
      id: editingId || Date.now().toString(),
      activoId: form.activoId,
      tipo: form.tipo,
      fecha: form.fecha,
      descripcion: form.descripcion.trim(),
      estado: form.estado
    };

    if (editingId) {
      setMantenimientos((current) => current.map((item) => (item.id === editingId ? maintenanceData : item)));
      registerActivity(`Mantenimiento actualizado de: ${getAssetText(maintenanceData.activoId, activos)}`);
      notify('Mantenimiento actualizado correctamente', 'success');
    } else {
      setMantenimientos((current) => [...current, maintenanceData]);
      registerActivity(`Mantenimiento registrado para: ${getAssetText(maintenanceData.activoId, activos)}`);
      notify('Mantenimiento registrado', 'success');
    }

    resetForm();
  }

  function editMaintenance(maintenance) {
    setEditingId(maintenance.id);
    setForm({
      activoId: maintenance.activoId,
      tipo: maintenance.tipo,
      fecha: maintenance.fecha,
      descripcion: maintenance.descripcion,
      estado: maintenance.estado
    });
    setErrors({});
  }

  function deleteMaintenance(maintenance) {
    confirm('¿Está seguro de eliminar este mantenimiento?', () => {
      setMantenimientos((current) => current.filter((item) => item.id !== maintenance.id));
      registerActivity(`Mantenimiento eliminado de: ${getAssetText(maintenance.activoId, activos)}`);
      notify('Mantenimiento eliminado correctamente', 'info');

      if (editingId === maintenance.id) {
        resetForm();
      }
    });
  }

  const query = search.trim().toLowerCase();
  const filteredMaintenance = mantenimientos.filter(
    (item) =>
      getAssetText(item.activoId, activos).toLowerCase().includes(query) ||
      item.tipo.toLowerCase().includes(query) ||
      item.estado.toLowerCase().includes(query) ||
      item.descripcion.toLowerCase().includes(query)
  );

  return (
    <section className="card">
      <h1>Mantenimiento de Activos</h1>
      <form onSubmit={handleSubmit}>
        <SelectGroup
          label="Activo"
          value={form.activoId}
          error={errors.activoId}
          options={selectableAssets.map((asset) => ({ value: asset.id, label: `${asset.codigo} - ${asset.nombre}` }))}
          onChange={(value) => updateField('activoId', value)}
        />
        <SelectGroup
          label="Tipo de mantenimiento"
          value={form.tipo}
          error={errors.tipo}
          options={['Preventivo', 'Correctivo'].map((item) => ({ value: item, label: item }))}
          onChange={(value) => updateField('tipo', value)}
        />
        <InputGroup label="Fecha" type="date" value={form.fecha} error={errors.fecha} onChange={(value) => updateField('fecha', value)} />
        <TextAreaGroup
          label="Descripción"
          value={form.descripcion}
          error={errors.descripcion}
          onChange={(value) => updateField('descripcion', value)}
        />
        <SelectGroup
          label="Estado Final"
          value={form.estado}
          error={errors.estado}
          options={['Activo', 'En reparación'].map((item) => ({ value: item, label: item }))}
          onChange={(value) => updateField('estado', value)}
        />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-toolbar">
        <div className="input-group">
          <label>Buscar Mantenimiento</label>
          <input
            type="text"
            placeholder="Buscar por activo, tipo, estado o descripción"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Activo</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Estado Final</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaintenance.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  No hay mantenimientos registrados
                </td>
              </tr>
            ) : (
              filteredMaintenance.map((maintenance) => (
                <tr key={maintenance.id} {...getRowProps(maintenance.id)}>
                  <td>{getAssetText(maintenance.activoId, activos)}</td>
                  <td>{maintenance.tipo}</td>
                  <td>{maintenance.fecha}</td>
                  <td>{maintenance.estado}</td>
                  <td>{maintenance.descripcion}</td>
                  <td>
                    <button type="button" className="btn-table" onClick={() => editMaintenance(maintenance)}>
                      Editar
                    </button>
                    <button type="button" className="btn-table btn-danger" onClick={() => deleteMaintenance(maintenance)}>
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
      <input type={type} value={value} className={error ? 'input-error' : value ? 'input-success' : ''} onChange={(event) => onChange(event.target.value)} />
      <small className="error">{error || ''}</small>
    </div>
  );
}

function SelectGroup({ label, value, error, options, onChange }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <select value={value} className={error ? 'input-error' : value ? 'input-success' : ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">Seleccione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <small className="error">{error || ''}</small>
    </div>
  );
}

function TextAreaGroup({ label, value, error, onChange }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <textarea value={value} className={error ? 'input-error' : value ? 'input-success' : ''} onChange={(event) => onChange(event.target.value)} />
      <small className="error">{error || ''}</small>
    </div>
  );
}

export default MaintenancePage;
