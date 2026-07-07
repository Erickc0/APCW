import { Link, useOutletContext } from 'react-router-dom';
import { appRoutes } from '../utils/routes.js';

function DashboardPage() {
  const { usuarios, activos, actividad } = useOutletContext();
  const disponibles = activos.filter((item) => item.estado === 'Disponible').length;
  const asignados = activos.filter((item) => item.estado === 'Asignado').length;
  const enMantenimiento = activos.filter(
    (item) => item.estado === 'En mantenimiento' || item.estado === 'En reparación'
  ).length;
  const bajas = activos.filter((item) => item.estado === 'Dado de baja').length;

  return (
    <section className="card">
      <h1>Menu Principal</h1>
      <div className="kpi-grid">
        <KpiCard icon="👤" title="Usuarios registrados" value={usuarios.length} />
        <KpiCard icon="📦" title="Activos registrados" value={activos.length} />
        <KpiCard icon="✅" title="Activos disponibles" value={disponibles} />
        <KpiCard icon="🔗" title="Activos asignados" value={asignados} />
        <KpiCard icon="🛠️" title="Activos en mantenimiento" value={enMantenimiento} />
        <KpiCard icon="📉" title="Activos dados de baja" value={bajas} />
      </div>

      <div className="recent-activity">
        <h3>Actividad reciente</h3>
        <ul>
          {actividad.length === 0 ? (
            <li>Sin actividad registrada.</li>
          ) : (
            actividad.slice(0, 10).map((item) => {
              const date = new Date(item.fecha);
              return (
                <li key={item.id}>
                  [{date.toLocaleDateString('es-ES')} {date.toLocaleTimeString('es-ES')}] {item.mensaje}
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="dashboard-grid">
        {appRoutes
          .filter((route) => route.module !== 'dashboard')
          .map((route) => (
            <div className="dashboard-card" key={route.path}>
              <h3>{route.label}</h3>
              <p>{route.description}</p>
              <Link to={route.path}>
                <button type="button">Ir</button>
              </Link>
            </div>
          ))}
      </div>
    </section>
  );
}

function KpiCard({ icon, title, value }) {
  return (
    <div className="kpi-card">
      <span className="kpi-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

export default DashboardPage;
