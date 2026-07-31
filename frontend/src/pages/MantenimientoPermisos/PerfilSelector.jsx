import React from 'react';

// Selector de Perfil del modal "Agregar Permiso": tarjetas tipo radio, una por
// perfil real (nada hardcodeado, vienen del resumen ya cargado en la página).
const PerfilSelector = ({ perfiles, value, onChange, accent }) => {
  return (
    <div className="perfil-selector">
      {perfiles.map((perfil) => (
        <button
          key={perfil.profile_id}
          type="button"
          className={`perfil-selector-option ${value === perfil.profile_id ? 'active' : ''}`}
          data-accent={accent}
          onClick={() => onChange(perfil.profile_id)}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {perfil.profile_de}
        </button>
      ))}
    </div>
  );
};

export default PerfilSelector;
