import React from 'react';
import '../../componentes/ui/DataTable.css';

// Tabla presentacional: recibe datos y callbacks, no sabe de dónde vienen ni cómo se guardan.
const MetodoTable = ({ metodos, loading, selectedIds, onToggleSelect, onToggleSelectAll, onEdit }) => {
  if (loading) {
    return <p className="data-table-status">Cargando métodos...</p>;
  }

  if (metodos.length === 0) {
    return <p className="data-table-status">No se encontraron métodos.</p>;
  }

  const allSelected = selectedIds.size === metodos.length;

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
            <th>OBJETO</th>
            <th>NOMBRE DEL MÉTODO</th>
            <th className="edit-col"></th>
          </tr>
        </thead>
        <tbody>
          {metodos.map((metodo) => {
            const isSelected = selectedIds.has(metodo.method_id);
            return (
              <tr key={metodo.method_id} className={isSelected ? 'selected' : ''}>
                <td>
                  <button
                    type="button"
                    className={`row-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => onToggleSelect(metodo.method_id)}
                    aria-label={`Seleccionar ${metodo.method_de}`}
                  />
                </td>
                <td>
                  <span className="pill pill-blue">{metodo.sub_system_de}</span>
                </td>
                <td className="cell-mono">{metodo.object_de}</td>
                <td>
                  <span className="pill pill-outline">{metodo.method_de}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="row-edit-btn"
                    onClick={() => onEdit(metodo)}
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

export default MetodoTable;
