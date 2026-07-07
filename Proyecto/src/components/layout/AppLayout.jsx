import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import GlobalSearchPanel from '../search/GlobalSearchPanel.jsx';
import ToastContainer from '../ui/ToastContainer.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { readSession, storage } from '../../utils/storage.js';
import { reconcileAssets } from '../../utils/assetStatus.js';

function AppLayout() {
  const session = readSession();
  const [usuarios, setUsuarios] = useState(() => storage.getUsuarios());
  const [activos, setActivos] = useState(() =>
    reconcileAssets(storage.getActivos(), {
      asignaciones: storage.getAsignaciones(),
      mantenimientos: storage.getMantenimientos(),
      bajas: storage.getBajas()
    })
  );
  const [asignaciones, setAsignaciones] = useState(() => storage.getAsignaciones());
  const [mantenimientos, setMantenimientos] = useState(() => storage.getMantenimientos());
  const [bajas, setBajas] = useState(() => storage.getBajas());
  const [actividad, setActividad] = useState(() => storage.getActividad());
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    storage.setUsuarios(usuarios);
  }, [usuarios]);

  useEffect(() => {
    storage.setActivos(activos);
  }, [activos]);

  useEffect(() => {
    storage.setAsignaciones(asignaciones);
  }, [asignaciones]);

  useEffect(() => {
    storage.setMantenimientos(mantenimientos);
  }, [mantenimientos]);

  useEffect(() => {
    storage.setBajas(bajas);
  }, [bajas]);

  useEffect(() => {
    storage.setActividad(actividad);
  }, [actividad]);

  useEffect(() => {
    const reconciledAssets = reconcileAssets(activos, {
      asignaciones,
      mantenimientos,
      bajas
    });

    if (JSON.stringify(reconciledAssets) !== JSON.stringify(activos)) {
      setActivos(reconciledAssets);
    }
  }, [activos, asignaciones, mantenimientos, bajas]);

  function notify(message, type = 'info') {
    const toast = {
      id: Date.now().toString(),
      message,
      type
    };

    setToasts((current) => [...current, toast]);

    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 2600);
  }

  function confirm(message, onConfirm) {
    setConfirmation({
      message,
      onConfirm
    });
  }

  function closeConfirmation(showCancelNotice = false) {
    setConfirmation(null);

    if (showCancelNotice) {
      notify('Operación cancelada', 'info');
    }
  }

  function registerActivity(message) {
    setActividad((current) =>
      [
        {
          id: Date.now().toString(),
          mensaje: message,
          fecha: new Date().toISOString()
        },
        ...current
      ].slice(0, 10)
    );
  }

  const appState = useMemo(
    () => ({
      session,
      usuarios,
      activos,
      asignaciones,
      mantenimientos,
      bajas,
      actividad,
      globalSearch,
      setGlobalSearch,
      setUsuarios,
      setActivos,
      setAsignaciones,
      setMantenimientos,
      setBajas,
      notify,
      confirm,
      registerActivity
    }),
    [session, usuarios, activos, asignaciones, mantenimientos, bajas, actividad, globalSearch]
  );

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container">
      <Sidebar />
      <main className="content">
        <Topbar
          session={session}
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          registerActivity={registerActivity}
          confirm={confirm}
        />
        <GlobalSearchPanel state={appState} />
        <Outlet context={appState} />
      </main>
      <ToastContainer toasts={toasts} />
      <ConfirmModal
        confirmation={confirmation}
        onAccept={() => {
          const action = confirmation?.onConfirm;
          closeConfirmation(false);

          if (action) {
            action();
          }
        }}
        onCancel={() => closeConfirmation(true)}
      />
    </div>
  );
}

export default AppLayout;
