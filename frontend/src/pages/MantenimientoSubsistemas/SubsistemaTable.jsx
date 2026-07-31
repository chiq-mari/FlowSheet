import React from 'react';
import '../../componentes/ui/DataTable.css';

// Tabla presentacional: recibe datos y callbacks, no sabe de dónde vienen ni cómo se guardan.
const SubsistemaTable = ({ subsistemas, loading, selectedIds, onToggleSelect, onToggleSelectAll, onEdit }) => {
  if (loading) {
    return <p className="data-table-status">Cargando subsistemas...</p>;
  }

  if (subsistemas.length === 0) {
    return <p className="data-table-status">No se encontraron subsistemas.</p>;
  }

  const allSelected = selectedIds.size === subsistemas.length;

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
            <th>NOMBRE</th>
            <th className="edit-col"></th>
          </tr>
        </thead>
        <tbody>
          {subsistemas.map((subsistema) => {
            const isSelected = selectedIds.has(subsistema.id);
            return (
              <tr key={subsistema.id} className={isSelected ? 'selected' : ''}>
                <td>
                  <button
                    type="button"
                    className={`row-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => onToggleSelect(subsistema.id)}
                    aria-label={`Seleccionar ${subsistema.name}`}
                  />
                </td>
                <td className="cell-strong">{subsistema.name}</td>
                <td>
                  <button
                    type="button"
                    className="row-edit-btn"
                    onClick={() => onEdit(subsistema)}
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

export default SubsistemaTable;
