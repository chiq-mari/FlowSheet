import React from 'react';
import '../../componentes/ui/DataTable.css';

// Tabla presentacional: recibe datos y callbacks, no sabe de dónde vienen ni cómo se guardan.
const PersonaTable = ({ personas, loading, selectedIds, onToggleSelect, onToggleSelectAll, onEdit }) => {
  if (loading) {
    return <p className="data-table-status">Cargando personas...</p>;
  }

  if (personas.length === 0) {
    return <p className="data-table-status">No se encontraron personas.</p>;
  }

  const allSelected = selectedIds.size === personas.length;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th className="checkbox-col">
              <button
                type="button"
                className={`row-checkbox ${allSelected ? 'checked' : ''}`}
                onClick={onToggleSelectAll}
                aria-label="Seleccionar todo"
              />
            </th>
            <th>CI</th>
            <th>NOMBRE</th>
            <th>APELLIDO</th>
            <th>CORREO</th>
            <th>CARGO</th>
            <th className="edit-col"></th>
          </tr>
        </thead>
        <tbody>
          {personas.map((persona) => {
            const isSelected = selectedIds.has(persona.person_id);
            return (
              <tr key={persona.person_id} className={isSelected ? 'selected' : ''}>
                <td>
                  <button
                    type="button"
                    className={`row-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => onToggleSelect(persona.person_id)}
                    aria-label={`Seleccionar ${persona.person_na}`}
                  />
                </td>
                <td className="cell-mono">{persona.person_ci}</td>
                <td className="cell-strong">{persona.person_na}</td>
                <td>{persona.person_ln}</td>
                <td className="cell-link">{persona.person_email}</td>
                <td>
                  {persona.charge_name && (
                    <span className="pill pill-blue">{persona.charge_name}</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="row-edit-btn"
                    onClick={() => onEdit(persona)}
                    title="Editar"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PersonaTable;
