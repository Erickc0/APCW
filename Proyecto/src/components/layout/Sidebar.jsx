import { NavLink } from 'react-router-dom';
import { appRoutes } from '../../utils/routes.js';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Gestion</h2>
      <ul>
        {appRoutes.map((route) => (
          <li key={route.path}>
            <NavLink to={route.path} end={route.path === '/app'}>
              {route.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
