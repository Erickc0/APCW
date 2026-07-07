import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAssetText } from '../utils/assetStatus.js';
import { useTableHighlight } from '../utils/useTableHighlight.js';
import { hasMinLength, isRequired } from '../utils/validators.js';

function DecommissionPage() {
  const { activos, bajas, setBajas, setAsignaciones, confirm, notify, registerActivity } = useOutletContext();
  const emptyForm = { activoId: '', codigo: '', tipo: '', descripcion: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { getRowProps } = useTableHighlight(() => setSearch(''));

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectAsset(assetId) {
    const asset = activos.find((item) => item.id === assetId);
    setForm((current) => ({
      ...current,
      activoId: assetId,
      codigo: asset ? asset.codigo : '',
      tipo: asset ? asset.tipo : ''
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
  }

  function validate() {
    const nextErrors = {};
    const selectedAsset = activos.find((item) => item.id === form.activoId);
    const duplicatedDecommission = bajas.find((item) => item.activoId === form.activoId && item.id !== editingId);
    const isSameAssetInEdit = editingId && bajas.some((item) => item.id === editingId && item.activoId === form.activoId);

    if (!form.activoId) nextErrors.activoId = 'Seleccione un activo';
    if (!isRequired(form.codigo)) nextErrors.codigo = 'Ingrese el código del activo';
    if (!form.tipo) nextErrors.tipo = 'Seleccione un tipo';
    if (!hasMinLength(form.descripcion, 10)) nextErrors.descripcion = 'La descripción debe tener mínimo 10 caracteres';

    if (
      Object.keys(nextErrors).length === 0 &&
      (!selectedAsset || ((selectedAsset.estado === 'Dado de baja' || duplicatedDecommission) && !isSameAssetInEdit))
    ) {
      nextErrors.activoId = 'Este activo ya fue dado de baja';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      notify('Revisa los datos de la baja', 'error');
      return;
    }

    confirm('¿Está seguro de dar de baja este activo?', () => {
      const selectedAsset = activos.find((item) => item.id === form.activoId);
      const decommissionData = {
        id: editingId || Date.now().toString(),
        activoId: form.activoId,
        codigo: form.codigo.trim(),
        tipo: form.tipo,
        descripcion: form.descripcion.trim(),
        fecha: new Date().toISOString().slice(0, 10),
        estadoAnterior: selectedAsset ? selectedAsset.estado : 'Disponible'
      };

      if (editingId) {
        setBajas((current) => current.map((item) => (item.id === editingId ? decommissionData : item)));
        registerActivity(`Baja actualizada de: ${decommissionData.codigo}`);
        notify('Baja actualizada correctamente', 'success');
      } else {
        setBajas((current) => [...current, decommissionData]);
        registerActivity(`Activo dado de baja: ${decommissionData.codigo}`);
        notify('Activo dado de baja correctamente', 'success');
      }

      setAsignaciones((current) => current.filter((assignment) => assignment.activoId !== decommissionData.activoId));
      resetForm();
    });
  }

  function editDecommission(decommission) {
    setEditingId(decommission.id);
    setForm({
      activoId: decommission.activoId,
      codigo: decommission.codigo,
      tipo: decommission.tipo,
      descripcion: decommission.descripcion
    });
    setErrors({});
  }

  function deleteDecommission(decommission) {
    confirm('¿Está seguro de eliminar esta baja?', () => {
      setBajas((current) => current.filter((item) => item.id !== decommission.id));
      registerActivity(`Baja eliminada de: ${decommission.codigo}`);
      notify('Baja eliminada correctamente', 'info');

      if (editingId === decommission.id) {
        resetForm();
      }
    });
  }

  const query = search.trim().toLowerCase();
  const filteredDecommissions = bajas.filter(
    (item) =>
      getAssetText(item.activoId, activos).toLowerCase().includes(query) ||
      item.codigo.toLowerCase().includes(query) ||
      item.tipo.toLowerCase().includes(query) ||
      item.descripcion.toLowerCase().includes(query) ||
      item.fecha.toLowerCase().includes(query)
  );

  return (
    <section className="card">
      <h1>Baja de Activos</h1>
      <form onSubmit={handleSubmit}>
        <SelectGroup
          label="Seleccionar Activo"
          value={form.activoId}
          error={errors.activoId}
          options={activos.map((asset) => ({ value: asset.id, label: `${asset.codigo} - ${asset.nombre}` }))}
          onChange={selectAsset}
        />
        <div className="grid-2">
          <InputGroup label="Código del Activo" value={form.codigo} error={errors.codigo} onChange={(value) => updateField('codigo', value)} />
          <SelectGroup
            label="Tipo de Activo"
            value={form.tipo}
            error={errors.tipo}
            options={['Hardware', 'Periférico', 'Mobiliario'].map((item) => ({ value: item, label: item }))}
            onChange={(value) => updateField('tipo', value)}
          />
        </div>
        <TextAreaGroup
          label="Descripción de la Baja"
          value={form.descripcion}
          error={errors.descripcion}
          onChange={(value) => updateField('descripcion', value)}
        />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Actualizar Baja' : 'Dar de Baja'}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-toolbar">
        <div className="input-group">
          <label>Buscar Baja</label>
          <input
            type="text"
            placeholder="Buscar por activo, código, tipo o descripción"
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
              <th>Código</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDecommissions.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  No hay bajas registradas
                </td>
              </tr>
            ) : (
              filteredDecommissions.map((decommission) => (
                <tr key={decommission.id} {...getRowProps(decommission.id)}>
                  <td>{getAssetText(decommission.activoId, activos)}</td>
                  <td>{decommission.codigo}</td>
                  <td>{decommission.tipo}</td>
                  <td>{decommission.descripcion}</td>
                  <td>{decommission.fecha}</td>
                  <td>
                    <button type="button" className="btn-table" onClick={() => editDecommission(decommission)}>
                      Editar
                    </button>
                    <button type="button" className="btn-table btn-danger" onClick={() => deleteDecommission(decommission)}>
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

function InputGroup({ label, value, error, onChange }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input type="text" value={value} className={error ? 'input-error' : value ? 'input-success' : ''} onChange={(event) => onChange(event.target.value)} />
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

export default DecommissionPage;
