import React from 'react';
import '../../componentes/ui/DataTable.css';

const ACTION_PILL_CLASS = {
  INSERT: 'pill-green',
  UPDATE: 'pill-amber',
  DELETE: 'pill-red',
};

const formatFecha = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

// Postgres devuelve TIME con microsegundos ("09:34:13.425958"); solo importan
// horas:minutos:segundos.
const formatHora = (value) => (value ? value.slice(0, 8) : '');

// Tabla presentacional de Auditoría, siempre de solo lectura (no hay edición
// ni eliminación de filas de bitácora). ACCIÓN se pinta con un pill coloreado
// según el verbo real de la mutación auditada (ver dbComponent.js).
const AuditoriaTable = ({ rows, loading }) => {
  if (loading) {
    return <p className="data-table-status">Cargando registros...</p>;
  }

  if (rows.length === 0) {
    return <p className="data-table-status">No hay registros de auditoría para este filtro.</p>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ACCIÓN</th>
            <th>TABLA</th>
            <th>DESCRIPCIÓN</th>
            <th>USUARIO</th>
            <th>FECHA</th>
            <th>HORA</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <span className={`pill pill-mono ${ACTION_PILL_CLASS[row.action] || 'pill-blue'}`}>
                  {row.action}
                </span>
              </td>
              <td className="cell-mono">{row.table_name}</td>
              <td>{row.description}</td>
              <td className={row.usuario ? 'cell-link' : 'cell-muted'}>{row.usuario || 'Usuario eliminado'}</td>
              <td className="cell-muted">{formatFecha(row.date)}</td>
              <td className="cell-muted">{formatHora(row.hour)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditoriaTable;
