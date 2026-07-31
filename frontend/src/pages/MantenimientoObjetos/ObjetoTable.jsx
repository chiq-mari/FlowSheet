import React from 'react';
import '../../componentes/ui/DataTable.css';

// Tabla presentacional: recibe datos y callbacks, no sabe de dónde vienen ni cómo se guardan.
const ObjetoTable = ({ objetos, loading, selectedIds, onToggleSelect, onToggleSelectAll, onEdit }) => {
  if (loading) {
    return <p className="data-table-status">Cargando objetos...</p>;
  }

  if (objetos.length === 0) {
    return <p className="data-table-status">No se encontraron objetos.</p>;
  }

  const allSelected = selectedIds.size === objetos.length;

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
            <th>SUBSISTEMA</th>
            <th className="edit-col"></th>
          </tr>
        </thead>
        <tbody>
          {objetos.map((objeto) => {
            const isSelected = selectedIds.has(objeto.object_id);
            return (
              <tr key={objeto.object_id} className={isSelected ? 'selected' : ''}>
                <td>
                  <button
                    type="button"
                    className={`row-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => onToggleSelect(objeto.object_id)}
                    aria-label={`Seleccionar ${objeto.object_de}`}
                  />
                </td>
                <td className="cell-mono">{objeto.object_de}</td>
                <td>
                  <span className="pill pill-blue">{objeto.sub_system_de}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="row-edit-btn"
                    onClick={() => onEdit(objeto)}
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

export default ObjetoTable;
