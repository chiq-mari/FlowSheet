import React from 'react';

export function ProyectoStatusBadge({ statusDe }) {
  const isEnProgreso = statusDe?.toLowerCase() === 'en desarrollo' || statusDe?.toLowerCase() === 'en progreso';
  
  const badgeClass = isEnProgreso ? 'status-en-progreso' : 'status-completado';
  const label = isEnProgreso ? 'En Progreso' : 'Completado';

  return (
    <span className={`project-status-badge ${badgeClass}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

export default ProyectoStatusBadge;
