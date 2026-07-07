import { useNavigate } from 'react-router-dom';
import { getAssetText, getUserText } from '../../utils/assetStatus.js';

const modulePaths = {
  usuarios: '/app/usuarios',
  activos: '/app/activos',
  asignaciones: '/app/asignaciones',
  mantenimientos: '/app/mantenimiento',
  bajas: '/app/bajas'
};

function GlobalSearchPanel({ state }) {
  const navigate = useNavigate();
  const search = state.globalSearch.trim().toLowerCase();

  if (!search) {
    return null;
  }

  const results = {
    usuarios: state.usuarios.filter(
      (item) =>
        item.nombre.toLowerCase().includes(search) ||
        item.usuario.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search)
    ),
    activos: state.activos.filter(
      (item) =>
        item.codigo.toLowerCase().includes(search) ||
        item.nombre.toLowerCase().includes(search) ||
        item.tipo.toLowerCase().includes(search) ||
        item.estado.toLowerCase().includes(search)
    ),
    asignaciones: state.asignaciones.filter(
      (item) =>
        getAssetText(item.activoId, state.activos).toLowerCase().includes(search) ||
        getUserText(item.usuarioId, state.usuarios).toLowerCase().includes(search) ||
        item.fecha.toLowerCase().includes(search)
    ),
    mantenimientos: state.mantenimientos.filter(
      (item) =>
        getAssetText(item.activoId, state.activos).toLowerCase().includes(search) ||
        item.tipo.toLowerCase().includes(search) ||
        item.descripcion.toLowerCase().includes(search) ||
        item.estado.toLowerCase().includes(search)
    ),
    bajas: state.bajas.filter(
      (item) =>
        item.codigo.toLowerCase().includes(search) ||
        item.tipo.toLowerCase().includes(search) ||
        item.descripcion.toLowerCase().includes(search) ||
        getAssetText(item.activoId, state.activos).toLowerCase().includes(search)
    )
  };

  function goToResult(moduleName, id) {
    state.setGlobalSearch('');
    navigate(`${modulePaths[moduleName]}?highlight=${id}`);
  }

  return (
    <section className="card global-search-panel">
      <h3>Resultados de búsqueda global</h3>
      <div className="global-results-grid">
        <ResultBlock
          title="Usuarios"
          moduleName="usuarios"
          records={results.usuarios}
          getText={(item) => `${item.nombre} (${item.usuario})`}
          onSelect={goToResult}
        />
        <ResultBlock
          title="Activos"
          moduleName="activos"
          records={results.activos}
          getText={(item) => `${item.codigo} - ${item.nombre} [${item.estado}]`}
          onSelect={goToResult}
        />
        <ResultBlock
          title="Asignaciones"
          moduleName="asignaciones"
          records={results.asignaciones}
          getText={(item) =>
            `${getAssetText(item.activoId, state.activos)} -> ${getUserText(item.usuarioId, state.usuarios)}`
          }
          onSelect={goToResult}
        />
        <ResultBlock
          title="Mantenimientos"
          moduleName="mantenimientos"
          records={results.mantenimientos}
          getText={(item) => `${getAssetText(item.activoId, state.activos)} (${item.tipo})`}
          onSelect={goToResult}
        />
        <ResultBlock
          title="Bajas"
          moduleName="bajas"
          records={results.bajas}
          getText={(item) => `${item.codigo} - ${item.descripcion}`}
          onSelect={goToResult}
        />
      </div>
    </section>
  );
}

function ResultBlock({ title, moduleName, records, getText, onSelect }) {
  return (
    <div className="global-result-block">
      <h4>{title}</h4>
      <ul>
        {records.length === 0 ? (
          <li>Sin resultados</li>
        ) : (
          records.slice(0, 6).map((record) => (
            <li
              className="global-result-item"
              key={record.id}
              onClick={() => onSelect(moduleName, record.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSelect(moduleName, record.id);
                }
              }}
              tabIndex={0}
            >
              {getText(record)}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default GlobalSearchPanel;
