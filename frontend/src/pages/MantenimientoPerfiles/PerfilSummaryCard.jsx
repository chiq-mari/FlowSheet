import React from 'react';

// Tarjeta de resumen (pestaña "Ver Perfiles"): cuántos usuarios tiene un perfil.
// `color` es 'blue' | 'green' | 'purple' (ver profileColors.js) — puramente visual.
const PerfilSummaryCard = ({ color, count, label }) => {
  return (
    <div className={`perfil-summary-card perfil-summary-card-${color}`}>
      <span className="perfil-summary-badge">{count}</span>
      <span className="perfil-summary-label">{label}</span>
    </div>
  );
};

export default PerfilSummaryCard;
