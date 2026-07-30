import React from 'react';

// Barra de herramientas: búsqueda por nombre + acciones de eliminar/crear.
// Es puramente presentacional, todo el estado vive en MantenimientoPersonas.
const PersonaSearchBar = ({ value, onChange, hasSelection, onDeleteClick, onCreateClick }) => {
  return (
    <div className="persona-toolbar">
      <div className="persona-search-input">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          placeholder="Search by Name..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="persona-icon-btn persona-delete-btn"
        disabled={!hasSelection}
        onClick={onDeleteClick}
        title="Eliminar seleccionados"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <button
        type="button"
        className="persona-icon-btn persona-add-btn"
        onClick={onCreateClick}
        title="Nueva persona"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default PersonaSearchBar;
