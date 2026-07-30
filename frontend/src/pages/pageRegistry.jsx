import React from 'react';
import MantenimientoPersonas from './MantenimientoPersonas/MantenimientoPersonas';
import LeaderDashboard from './LeaderDashboard';
import MemberDashboard from './Member/MemberDashboard';
import MemberActivities from './Member/MemberActivities';
import MemberReports from './Member/MemberReports';
import MemberChatsPlaceholder from './Member/MemberChatsPlaceholder';

// Placeholder genérico para cuando un perfil válido todavía no tiene pantalla implementada
// para esa opción (ej. Admin viendo "Proyectos", que hoy es exclusivo de Miembro).
const InDevelopmentPlaceholder = ({ optionName, activeProfile }) => (
  <div className="dashboard-placeholder" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
      Sección: {optionName}
    </h3>
    <p style={{ margin: 0, fontSize: '0.9rem' }}>
      La pantalla de {optionName} para el perfil "{activeProfile?.profile_de || 'este perfil'}" se encuentra en desarrollo.
    </p>
  </div>
);

// Selector dinámico para la opción Dashboard según el perfil seleccionado
const DashboardSelector = ({ user, activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('lider')) {
    return <LeaderDashboard user={user} />;
  }
  if (profileDe.includes('miembro')) {
    return <MemberDashboard user={user} />;
  }
  return <InDevelopmentPlaceholder optionName="Dashboard" activeProfile={activeProfile} />;
};

// "Proyectos", "Reportes" y "Mis Chats" son opciones que también existe para el perfil Lider
// (mismo option_de en la BD), así que cada selector filtra por perfil igual que Dashboard,
// para no mostrarle a un Líder las pantallas del Miembro.
const ProyectosSelector = ({ activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('miembro')) {
    return <MemberActivities />;
  }
  return <InDevelopmentPlaceholder optionName="Proyectos" activeProfile={activeProfile} />;
};

const ReportesSelector = ({ activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('miembro')) {
    return <MemberReports />;
  }
  return <InDevelopmentPlaceholder optionName="Reportes" activeProfile={activeProfile} />;
};

const MisChatsSelector = ({ activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('miembro')) {
    return <MemberChatsPlaceholder />;
  }
  return <InDevelopmentPlaceholder optionName="Mis Chats" activeProfile={activeProfile} />;
};

// Mapea el nombre de la opción de menú (option_de, tal cual viene de la BD)
// al componente de página que debe renderizarse en el área principal del Dashboard.
// Agregar una nueva pantalla es solo agregar una entrada aquí: DashboardLayout
// nunca necesita conocer los componentes concretos de cada feature.
const pageRegistry = {
  'personas': MantenimientoPersonas,
  'dashboard': DashboardSelector,
  'proyectos': ProyectosSelector,
  'reportes': ReportesSelector,
  'mis chats': MisChatsSelector,
};

export function resolveDashboardPage(optionDe) {
  if (!optionDe) return null;
  return pageRegistry[optionDe.toLowerCase().trim()] || null;
}
