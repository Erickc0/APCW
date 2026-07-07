import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AssetsPage from './pages/AssetsPage.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
import AssignmentsPage from './pages/AssignmentsPage.jsx';
import DecommissionPage from './pages/DecommissionPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="activos" element={<AssetsPage />} />
        <Route path="mantenimiento" element={<MaintenancePage />} />
        <Route path="asignaciones" element={<AssignmentsPage />} />
        <Route path="bajas" element={<DecommissionPage />} />
        <Route path="reportes" element={<ReportsPage />} />
      </Route>
      <Route path="/menu_principal.html" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
