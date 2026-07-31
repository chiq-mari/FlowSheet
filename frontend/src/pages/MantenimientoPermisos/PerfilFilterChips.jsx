import React from 'react';

// Chips de filtro por perfil ("Todos los perfiles" + uno por perfil real,
// tomados del resumen — nada hardcodeado). `accent` es 'blue' | 'purple',
// según la pestaña activa, y solo cambia el color del chip seleccionado.
const PerfilFilterChips = ({ perfiles, selectedId, onSelect, accent }) => {
  return (
    <div className="permisos-filter-chips">
      <button
        type="button"
        className={`permisos-chip ${!selectedId ? 'active' : ''}`}
        data-accent={accent}
        onClick={() => onSelect('')}
      >
        Todos los perfiles
      </button>
      {perfiles.map((perfil) => (
        <button
          key={perfil.profile_id}
          type="button"
          className={`permisos-chip ${selectedId === perfil.profile_id ? 'active' : ''}`}
          data-accent={accent}
          onClick={() => onSelect(perfil.profile_id)}
        >
          {perfil.profile_de}
        </button>
      ))}
    </div>
  );
};

export default PerfilFilterChips;
