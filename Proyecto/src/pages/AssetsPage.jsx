import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTableHighlight } from '../utils/useTableHighlight.js';
import { hasMinLength, isRequired } from '../utils/validators.js';

function AssetsPage() {
  const {
    activos,
    setActivos,
    setAsignaciones,
    setMantenimientos,
    setBajas,
    confirm,
    notify,
    registerActivity
  } = useOutletContext();
  const emptyForm = { codigo: '', nombre: '', tipo: '', estado: '', fecha: '', descripcion: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estado: '', tipo: '', fecha: '' });
  const { getRowProps } = useTableHighlight(() => {
    setSearch('');
    setFilters({ estado: '', tipo: '', fecha: '' });
  });

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

    if (!isRequired(form.codigo)) {
      nextErrors.codigo = 'Ingrese el código';
    } else if (
      activos.some((item) => item.codigo.toLowerCase() === form.codigo.trim().toLowerCase() && item.id !== editingId)
    ) {
      nextErrors.codigo = 'El código ya existe';
    }

    if (!isRequired(form.nombre)) nextErrors.nombre = 'Ingrese el nombre del activo';
    if (!form.tipo) nextErrors.tipo = 'Seleccione un tipo';
    if (!form.estado) nextErrors.estado = 'Seleccione un estado';
    if (!form.fecha) nextErrors.fecha = 'Seleccione una fecha';
    if (!hasMinLength(form.descripcion, 10)) nextErrors.descripcion = 'La descripción debe tener mínimo 10 caracteres';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      notify('Revisa los datos del activo', 'error');
      return;
    }

    const assetData = {
      id: editingId || Date.now().toString(),
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      estado: form.estado,
      fecha: form.fecha,
      descripcion: form.descripcion.trim()
    };

    if (editingId) {
      setActivos((current) => current.map((item) => (item.id === editingId ? assetData : item)));
      registerActivity(`Activo actualizado: ${assetData.codigo} - ${assetData.nombre}`);
      notify('Activo actualizado correctamente', 'success');
    } else {
      setActivos((current) => [...current, assetData]);
      registerActivity(`Activo registrado: ${assetData.codigo} - ${assetData.nombre}`);
      notify('Activo registrado correctamente', 'success');
    }

    resetForm();
  }

  function editAsset(asset) {
    setEditingId(asset.id);
    setForm({
      codigo: asset.codigo,
      nombre: asset.nombre,
      tipo: asset.tipo,
      estado: asset.estado,
      fecha: asset.fecha,
      descripcion: asset.descripcion
    });
    setErrors({});
  }

  function deleteAsset(asset) {
    confirm('¿Está seguro de eliminar este activo?', () => {
      setAsignaciones((current) => current.filter((item) => item.activoId !== asset.id));
      setMantenimientos((current) => current.filter((item) => item.activoId !== asset.id));
      setBajas((current) => current.filter((item) => item.activoId !== asset.id));
      setActivos((current) => current.filter((item) => item.id !== asset.id));
      registerActivity(`Activo eliminado: ${asset.codigo} - ${asset.nombre}`);
      notify('Activo eliminado correctamente', 'info');

      if (editingId === asset.id) {
        resetForm();
      }
    });
  }

  const searchValue = search.trim().toLowerCase();
  const filteredAssets = activos.filter((item) => {
    const matchesSearch =
      item.codigo.toLowerCase().includes(searchValue) ||
      item.nombre.toLowerCase().includes(searchValue) ||
      item.tipo.toLowerCase().includes(searchValue) ||
      item.estado.toLowerCase().includes(searchValue) ||
      item.fecha.toLowerCase().includes(searchValue) ||
      item.descripcion.toLowerCase().includes(searchValue);
    const matchesStatus = !filters.estado || item.estado === filters.estado;
    const matchesType = !filters.tipo || item.tipo === filters.tipo;
    const matchesDate = !filters.fecha || item.fecha === filters.fecha;
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <section className="card">
      <h1>Registro de Activos</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <InputGroup label="Código" value={form.codigo} error={errors.codigo} onChange={(value) => updateField('codigo', value)} />
          <InputGroup
            label="Nombre del Activo"
            value={form.nombre}
            error={errors.nombre}
            onChange={(value) => updateField('nombre', value)}
          />
        </div>
        <div className="grid-2">
          <SelectGroup
            label="Tipo"
            value={form.tipo}
            error={errors.tipo}
            options={['Hardware', 'Periférico', 'Mobiliario']}
            onChange={(value) => updateField('tipo', value)}
          />
          <SelectGroup
            label="Estado"
            value={form.estado}
            error={errors.estado}
            options={['Disponible', 'Activo', 'Nuevo', 'Asignado', 'En mantenimiento']}
            onChange={(value) => updateField('estado', value)}
          />
        </div>
        <InputGroup label="Fecha de Compra" type="date" value={form.fecha} error={errors.fecha} onChange={(value) => updateField('fecha', value)} />
        <TextAreaGroup
          label="Descripción"
          value={form.descripcion}
          error={errors.descripcion}
          onChange={(value) => updateField('descripcion', value)}
        />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Actualizar Activo' : 'Guardar Activo'}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table-toolbar">
        <div className="input-group">
          <label>Buscar Activo</label>
          <input
            type="text"
            placeholder="Buscar por código, nombre, tipo o estado"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="grid-3">
          <SelectGroup
            label="Filtrar por Estado"
            value={filters.estado}
            options={['Disponible', 'Activo', 'Nuevo', 'Asignado', 'En mantenimiento', 'Dado de baja']}
            onChange={(value) => setFilters((current) => ({ ...current, estado: value }))}
            includeAll
          />
          <SelectGroup
            label="Filtrar por Tipo"
            value={filters.tipo}
            options={['Hardware', 'Periférico', 'Mobiliario']}
            onChange={(value) => setFilters((current) => ({ ...current, tipo: value }))}
            includeAll
          />
          <InputGroup
            label="Filtrar por Fecha"
            type="date"
            value={filters.fecha}
            onChange={(value) => setFilters((current) => ({ ...current, fecha: value }))}
          />
        </div>
        <button type="button" className="btn-secondary" onClick={() => setFilters({ estado: '', tipo: '', fecha: '' })}>
          Limpiar Filtros
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha de Compra</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  No hay activos registrados
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id} {...getRowProps(asset.id)}>
                  <td>{asset.codigo}</td>
                  <td>{asset.nombre}</td>
                  <td>{asset.tipo}</td>
                  <td>{asset.estado}</td>
                  <td>{asset.fecha}</td>
                  <td>
                    <button type="button" className="btn-table" onClick={() => editAsset(asset)}>
                      Editar
                    </button>
                    <button type="button" className="btn-table btn-danger" onClick={() => deleteAsset(asset)}>
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
        className={error ? 'input-error' : value ? 'input-success' : ''}
        onChange={(event) => onChange(event.target.value)}
      />
      <small className="error">{error || ''}</small>
    </div>
  );
}

function SelectGroup({ label, value, error, options, onChange, includeAll = false }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <select
        value={value}
        className={error ? 'input-error' : value ? 'input-success' : ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{includeAll ? 'Todos' : 'Seleccione'}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
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
      <textarea
        value={value}
        className={error ? 'input-error' : value ? 'input-success' : ''}
        onChange={(event) => onChange(event.target.value)}
      />
      <small className="error">{error || ''}</small>
    </div>
  );
}

export default AssetsPage;
