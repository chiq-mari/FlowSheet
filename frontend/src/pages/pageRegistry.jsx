import React from 'react';
import MantenimientoPersonas from './MantenimientoPersonas/MantenimientoPersonas';
import LeaderDashboard from './LeaderDashboard';
import GestionProyectosLeader from './GestionProyectosLeader/GestionProyectosLeader';

// Selector dinámico para la opción Dashboard según el perfil seleccionado
const DashboardSelector = ({ user, activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('lider')) {
    return <LeaderDashboard user={user} />;
  }
  // Fallback temporal para otros perfiles
  return (
    <div className="dashboard-placeholder" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
        Sección: Dashboard
      </h3>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        La pantalla del Dashboard para el perfil "{activeProfile?.profile_de || 'Miembro'}" se encuentra en desarrollo.
      </p>
    </div>
  );
};

// Selector dinámico para la opción Proyectos según el perfil seleccionado
const ProyectosSelector = ({ user, activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('lider')) {
    return <GestionProyectosLeader user={user} activeProfile={activeProfile} />;
  }
  // Fallback temporal para otros perfiles (ej. Miembro)
  return (
    <div className="dashboard-placeholder" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
        Gestión de Proyectos
      </h3>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        La pantalla de Proyectos para el perfil "{activeProfile?.profile_de || 'Miembro'}" se encuentra en desarrollo.
      </p>
    </div>
  );
};

// Mapea el nombre de la opción de menú (option_de, tal cual viene de la BD)
// al componente de página que debe renderizarse en el área principal del Dashboard.
// Agregar una nueva pantalla es solo agregar una entrada aquí: DashboardLayout
// nunca necesita conocer los componentes concretos de cada feature.
const pageRegistry = {
  'personas': MantenimientoPersonas,
  'dashboard': DashboardSelector,
  'proyectos': ProyectosSelector,
};

export function resolveDashboardPage(optionDe) {
  if (!optionDe) return null;
  return pageRegistry[optionDe.toLowerCase().trim()] || null;
}
