import React from 'react';
import MantenimientoPersonas from './MantenimientoPersonas/MantenimientoPersonas';
import MantenimientoUsuarios from './MantenimientoUsuarios/MantenimientoUsuarios';
import MantenimientoCargos from './MantenimientoCargos/MantenimientoCargos';
import MantenimientoSubsistemas from './MantenimientoSubsistemas/MantenimientoSubsistemas';
import MantenimientoOpciones from './MantenimientoOpciones/MantenimientoOpciones';
import MantenimientoObjetos from './MantenimientoObjetos/MantenimientoObjetos';
import MantenimientoMetodos from './MantenimientoMetodos/MantenimientoMetodos';
import MantenimientoPerfiles from './MantenimientoPerfiles/MantenimientoPerfiles';
import LeaderDashboard from './LeaderDashboard';

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
  'dashboard': DashboardSelector,
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
