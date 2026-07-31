import React, { useState } from 'react';
import ResumenPerfilesTab from './ResumenPerfilesTab';
import AsignarPerfilTab from './AsignarPerfilTab';
import '../../componentes/ui/MaintenancePage.css';
import './MantenimientoPerfiles.css';

// Página de Mantenimiento de Perfiles: dos pestañas independientes ("Ver Perfiles" y
// "Asignar"). Cada pestaña se desmonta al cambiar de tab (no queda oculta con CSS),
// así que siempre vuelve a pedir datos frescos al backend al volver a mostrarse —
// evita tener que sincronizar manualmente el resumen tras asignar/quitar un perfil.
const MantenimientoPerfiles = () => {
  const [tab, setTab] = useState('ver'); // 'ver' | 'asignar'

  return (
    <div className="perfiles-page">
      <section className="perfiles-card">
        <header className="maintenance-header">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h2>Mantenimiento de Perfiles</h2>
        </header>

        <div className="maintenance-body">
          <div className="perfiles-tabs">
            <button type="button" className={`perfiles-tab ${tab === 'ver' ? 'active' : ''}`} onClick={() => setTab('ver')}>
              Ver Perfiles
            </button>
            <button type="button" className={`perfiles-tab ${tab === 'asignar' ? 'active' : ''}`} onClick={() => setTab('asignar')}>
              Asignar
            </button>
          </div>

          {tab === 'ver' ? <ResumenPerfilesTab /> : <AsignarPerfilTab />}
        </div>
      </section>
    </div>
  );
};

export default MantenimientoPerfiles;
