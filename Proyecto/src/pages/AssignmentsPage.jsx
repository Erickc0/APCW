import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAssetText, getUserText } from '../utils/assetStatus.js';
import { useTableHighlight } from '../utils/useTableHighlight.js';

function AssignmentsPage() {
  const { usuarios, activos, asignaciones, setAsignaciones, confirm, notify, registerActivity } = useOutletContext();
  const emptyForm = { activoId: '', usuarioId: '', fecha: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { getRowProps } = useTableHighlight(() => setSearch(''));

  const currentAssignment = asignaciones.find((item) => item.id === editingId);
  const selectableAssets = activos.filter(
    (asset) => asset.estado === 'Disponible' || (currentAssignment && currentAssignment.activoId === asset.id)
  );

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
    const selectedAsset = activos.find((item) => item.id === form.activoId);
    const duplicatedAssignment = asignaciones.some((item) => item.activoId === form.activoId && item.id !== editingId);
    const isCurrentAsset = currentAssignment && currentAssignment.activoId === form.activoId;

    if (!form.activoId) nextErrors.activoId = 'Seleccione un activo';
    if (!form.usuarioId) nextErrors.usuarioId = 'Seleccione un usuario';
    if (!form.fecha) nextErrors.fecha = 'Seleccione una fecha';

    if (form.activoId && !selectedAsset) {
      nextErrors.activoId = 'Seleccione un activo válido';
    } else if (selectedAsset?.estado === 'Dado de baja') {
      nextErrors.activoId = 'No se puede asignar un activo dado de baja';
    } else if (selectedAsset && selectedAsset.estado !== 'Disponible' && !isCurrentAsset) {
      nextErrors.activoId = 'Solo se pueden asignar activos disponibles';
    } else if (duplicatedAssignment) {
      nextErrors.activoId = 'Este activo ya está asignado';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      notify('Revisa los datos de la asignación', 'error');
      return;
    }

    const assignmentData = {
      id: editingId || Date.now().toString(),
      activoId: form.activoId,
      usuarioId: form.usuarioId,
      fecha: form.fecha
    };

    if (editingId) {
      setAsignaciones((current) => current.map((item) => (item.id === editingId ? assignmentData : item)));
      registerActivity(`Asignación actualizada para: ${getAssetText(assignmentData.activoId, activos)}`);
      notify('Asignación actualizada correctamente', 'success');
    } else {
      setAsignaciones((current) => [...current, assignmentData]);
      registerActivity(`Asignación registrada para: ${getAssetText(assignmentData.activoId, activos)}`);
      notify('Activo asignado correctamente', 'success');
    }

    resetForm();
  }

  function editAssignment(assignment) {
    setEditingId(assignment.id);
    setForm({
      activoId: assignment.activoId,
      usuarioId: assignment.usuarioId,
      fecha: assignment.fecha
    });
    setErrors({});
  }

  function deleteAssignment(assignment) {
    confirm('¿Está seguro de eliminar esta asignación?', () => {
      setAsignaciones((current) => current.filter((item) => item.id !== assignment.id));
      registerActivity(`Asignación eliminada de: ${getAssetText(assignment.activoId, activos)}`);
      notify('Asignación eliminada correctamente', 'info');

      if (editingId === assignment.id) {
        resetForm();
      }
    });
  }

  const query = search.trim().toLowerCase();
  const filteredAssignments = asignaciones.filter(
    (item) =>
      getAssetText(item.activoId, activos).toLowerCase().includes(query) ||
      getUserText(item.usuarioId, usuarios).toLowerCase().includes(query) ||
      item.fecha.toLowerCase().includes(query)
  );

  return (
    <section className="card">
      <h1>Asignación de Activos</h1>
      <form onSubmit={handleSubmit}>
        <SelectGroup
          label="Activo"
          value={form.activoId}
          error={errors.activoId}
          options={selectableAssets.map((asset) => ({ value: asset.id, label: `${asset.codigo} - ${asset.nombre}` }))}
          onChange={(value) => updateField('activoId', value)}
        />
        <SelectGroup
          label="Usuario"
          value={form.usuarioId}
          error={errors.usuarioId}
          options={usuarios.map((user) => ({ value: user.id, label: `${user.nombre} (${user.usuario})` }))}
          onChange={(value) => updateField('usuarioId', value)}
        />
        <InputGroup
          label="Fecha de Asignación"
          type="date"
          value={form.fecha}
          error={errors.fecha}
          onChange={(value) => updateField('fecha', value)}
        />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Actualizar' : 'Asignar'}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-toolbar">
        <div className="input-group">
          <label>Buscar Asignación</label>
          <input
            type="text"
            placeholder="Buscar por activo, usuario o fecha"
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
              <th>Usuario</th>
              <th>Fecha de Asignación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-table">
                  No hay asignaciones registradas
                </td>
              </tr>
            ) : (
              filteredAssignments.map((assignment) => (
                <tr key={assignment.id} {...getRowProps(assignment.id)}>
                  <td>{getAssetText(assignment.activoId, activos)}</td>
                  <td>{getUserText(assignment.usuarioId, usuarios)}</td>
                  <td>{assignment.fecha}</td>
                  <td>
                    <button type="button" className="btn-table" onClick={() => editAssignment(assignment)}>
                      Editar
                    </button>
                    <button type="button" className="btn-table btn-danger" onClick={() => deleteAssignment(assignment)}>
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

export default AssignmentsPage;
