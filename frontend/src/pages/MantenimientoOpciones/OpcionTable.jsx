import React from 'react';
import '../../componentes/ui/DataTable.css';

// Tabla presentacional: recibe datos y callbacks, no sabe de dónde vienen ni cómo se guardan.
const OpcionTable = ({ opciones, loading, selectedIds, onToggleSelect, onToggleSelectAll, onEdit }) => {
  if (loading) {
    return <p className="data-table-status">Cargando opciones...</p>;
  }

  if (opciones.length === 0) {
    return <p className="data-table-status">No se encontraron opciones.</p>;
  }

  const allSelected = selectedIds.size === opciones.length;

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
            <th>SUBSISTEMA</th>
            <th>OPCIÓN</th>
            <th className="edit-col"></th>
          </tr>
        </thead>
        <tbody>
          {opciones.map((opcion) => {
            const isSelected = selectedIds.has(opcion.option_id);
            return (
              <tr key={opcion.option_id} className={isSelected ? 'selected' : ''}>
                <td>
                  <button
                    type="button"
                    className={`row-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => onToggleSelect(opcion.option_id)}
                    aria-label={`Seleccionar ${opcion.option_de}`}
                  />
                </td>
                <td>
                  <span className="pill pill-blue">{opcion.sub_system_de}</span>
                </td>
                <td className="cell-strong">{opcion.option_de}</td>
                <td>
                  <button
                    type="button"
                    className="row-edit-btn"
                    onClick={() => onEdit(opcion)}
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

export default OpcionTable;
