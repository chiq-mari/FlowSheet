import React from 'react';
import MantenimientoPersonas from './MantenimientoPersonas/MantenimientoPersonas';
import MantenimientoUsuarios from './MantenimientoUsuarios/MantenimientoUsuarios';
import MantenimientoCargos from './MantenimientoCargos/MantenimientoCargos';
import MantenimientoSubsistemas from './MantenimientoSubsistemas/MantenimientoSubsistemas';
import MantenimientoOpciones from './MantenimientoOpciones/MantenimientoOpciones';
import MantenimientoObjetos from './MantenimientoObjetos/MantenimientoObjetos';
import MantenimientoMetodos from './MantenimientoMetodos/MantenimientoMetodos';
import MantenimientoPerfiles from './MantenimientoPerfiles/MantenimientoPerfiles';
import MantenimientoPermisos from './MantenimientoPermisos/MantenimientoPermisos';
import MantenimientoAuditoria from './MantenimientoAuditoria/MantenimientoAuditoria';
import LeaderDashboard from './LeaderDashboard';
import GestionProyectosLeader from './GestionProyectosLeader/GestionProyectosLeader';
import MemberDashboard from './Member/MemberDashboard';
import MemberActivities from './Member/MemberActivities';
import MemberReports from './Member/MemberReports';
import MemberChats from './Member/MemberChats';

// Placeholder genérico para cuando un perfil válido todavía no tiene pantalla implementada
// para esa opción (ej. Miembro viendo la gestión de Proyectos del Líder, o viceversa).
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

// "Proyectos" es la MISMA opción de menú (option_de) para Líder y para Miembro, pero cada
// perfil ve una pantalla completamente distinta: el Líder gestiona sus proyectos/equipos/roles
// (GestionProyectosLeader), el Miembro ve sus propias actividades asignadas (MemberActivities).
const ProyectosSelector = ({ user, activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('lider')) {
    return <GestionProyectosLeader user={user} activeProfile={activeProfile} />;
  }
  if (profileDe.includes('miembro')) {
    return <MemberActivities />;
  }
  return <InDevelopmentPlaceholder optionName="Proyectos" activeProfile={activeProfile} />;
};

// "Reportes" y "Mis Chats" hoy son exclusivos del Miembro (Líder todavía no tiene pantallas
// propias para estas opciones, aunque comparta el mismo option_de en la BD).
const ReportesSelector = ({ activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('miembro')) {
    return <MemberReports />;
  }
  return <InDevelopmentPlaceholder optionName="Reportes" activeProfile={activeProfile} />;
};

const MisChatsSelector = ({ user, activeProfile }) => {
  const profileDe = activeProfile?.profile_de?.toLowerCase() || '';
  if (profileDe.includes('miembro')) {
    return <MemberChats user={user} />;
  }
  return <InDevelopmentPlaceholder optionName="Mis Chats" activeProfile={activeProfile} />;
};

// Mapea el nombre de la opción de menú (option_de, tal cual viene de la BD)
// al componente de página que debe renderizarse en el área principal del Dashboard.
// Agregar una nueva pantalla es solo agregar una entrada aquí: DashboardLayout
// nunca necesita conocer los componentes concretos de cada feature.
const pageRegistry = {
  'personas': MantenimientoPersonas,
  'usuarios': MantenimientoUsuarios,
  'cargos': MantenimientoCargos,
  'subsistemas': MantenimientoSubsistemas,
  'opciones': MantenimientoOpciones,
  'objetos': MantenimientoObjetos,
  'metodos': MantenimientoMetodos,
  'perfiles': MantenimientoPerfiles,
  'permisos': MantenimientoPermisos,
  'auditoria': MantenimientoAuditoria,
  'dashboard': DashboardSelector,
  'proyectos': ProyectosSelector,
  'reportes': ReportesSelector,
  'mis chats': MisChatsSelector,
};

// Quita tildes (ej. "Métodos" -> "metodos") para que el nombre de la opción en la BD
// no tenga que coincidir carácter por carácter con la clave del registro.
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

export function resolveDashboardPage(optionDe) {
  if (!optionDe) return null;
  return pageRegistry[normalizar(optionDe)] || null;
}
