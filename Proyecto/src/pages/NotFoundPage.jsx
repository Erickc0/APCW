import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="card standalone-card">
      <h1>Pagina no encontrada</h1>
      <Link to="/app">
        <button type="button">Volver al sistema</button>
      </Link>
    </section>
  );
}

export default NotFoundPage;
