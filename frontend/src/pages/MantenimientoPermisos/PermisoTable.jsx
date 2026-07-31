import React from 'react';
import '../../componentes/ui/DataTable.css';

// Tabla presentacional de Mantenimiento de Permisos. Cambia de columnas según
// la pestaña activa: Perfil + Subsistema + Opción, o Perfil + Subsistema +
// Objeto + Método. No hay edición por fila (los permisos solo se otorgan o se
// quitan, no se "editan") — por eso no tiene columna de lápiz.
const PermisoTable = ({ tab, rows, loading, selectedIds, onToggleSelect, onToggleSelectAll, getRowId, accentPillClass }) => {
  if (loading) {
    return <p className="data-table-status">Cargando permisos...</p>;
  }

  if (rows.length === 0) {
    return <p className="data-table-status">No se encontraron permisos.</p>;
  }

  const allSelected = selectedIds.size === rows.length;

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
            <th>PERFIL</th>
            <th>SUBSISTEMA</th>
            {tab === 'metodos' && <th>OBJETO</th>}
            <th>{tab === 'opciones' ? 'OPCIÓN' : 'MÉTODO'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowId = getRowId(row);
            const isSelected = selectedIds.has(rowId);
            return (
              <tr key={rowId} className={isSelected ? 'selected' : ''}>
                <td>
                  <button
                    type="button"
                    className={`row-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => onToggleSelect(rowId)}
                    aria-label={`Seleccionar ${row.profile_de}`}
                  />
                </td>
                <td>
                  <span className="pill pill-blue">{row.profile_de}</span>
                </td>
                <td className="cell-muted">{row.sub_system_de}</td>
                {tab === 'metodos' && <td className="cell-mono">{row.object_de}</td>}
                <td>
                  <span className={`pill ${accentPillClass}`}>
                    {tab === 'opciones' ? row.option_de : row.method_de}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PermisoTable;
