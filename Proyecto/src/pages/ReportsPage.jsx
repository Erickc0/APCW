import { useOutletContext } from 'react-router-dom';

function ReportsPage() {
  const { usuarios, activos, asignaciones, mantenimientos, bajas } = useOutletContext();
  const stateCounts = activos.reduce((counts, asset) => {
    counts[asset.estado] = (counts[asset.estado] || 0) + 1;
    return counts;
  }, {});
  const typeCounts = activos.reduce((counts, asset) => {
    counts[asset.tipo] = (counts[asset.tipo] || 0) + 1;
    return counts;
  }, {});

  return (
    <section className="card">
      <h1>Reportes</h1>
      <div className="kpi-grid">
        <ReportCard title="Total de usuarios" value={usuarios.length} />
        <ReportCard title="Total de activos" value={activos.length} />
        <ReportCard title="Total de asignaciones" value={asignaciones.length} />
        <ReportCard title="Total de mantenimientos" value={mantenimientos.length} />
        <ReportCard title="Total de bajas" value={bajas.length} />
      </div>
      <div className="grid-2">
        <SummaryTable title="Activos por Estado" counts={stateCounts} emptyText="Sin datos de estados" />
        <SummaryTable title="Activos por Tipo" counts={typeCounts} emptyText="Sin datos de tipos" />
      </div>
    </section>
  );
}

function ReportCard({ title, value }) {
  return (
    <div className="kpi-card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

function SummaryTable({ title, counts, emptyText }) {
  const entries = Object.entries(counts);

  return (
    <div>
      <h3>{title}</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{title.includes('Estado') ? 'Estado' : 'Tipo'}</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan="2" className="empty-table">
                  {emptyText}
                </td>
              </tr>
            ) : (
              entries.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
