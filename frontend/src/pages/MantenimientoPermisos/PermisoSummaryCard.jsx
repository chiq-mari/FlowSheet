import React from 'react';

// Tarjeta resumen: cuántos permisos (opciones o métodos, según la pestaña
// activa) tiene un perfil. Neutra a propósito — a diferencia de las tarjetas
// de Mantenimiento de Perfiles, acá no hay color por perfil en el mockup.
const PermisoSummaryCard = ({ label, count }) => {
  return (
    <div className="permiso-summary-card">
      <div className="permiso-summary-text">
        <span className="permiso-summary-label">{label}</span>
        <span className="permiso-summary-count">{count}</span>
        <span className="permiso-summary-sub">permisos</span>
      </div>
      <span className="permiso-summary-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </span>
    </div>
  );
};

export default PermisoSummaryCard;
