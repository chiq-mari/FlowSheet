import React from 'react';
import MiembroRow from './MiembroRow';

export function EquiposTable({
  members = [],
  checkedIds = [],
  onCheckChange,
  onCheckAll,
  onEditClick
}) {
  const isAllChecked = members.length > 0 && checkedIds.length === members.length;

  return (
    <div className="equipos-table-container">
      <table className="equipos-table">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={(e) => onCheckAll(e.target.checked)}
                className="checkbox-control"
              />
            </th>
            <th>USUARIO</th>
            <th>ROL EN EL PROYECTO</th>
            <th style={{ width: '80px', textAlign: 'center' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member, index) => (
              <MiembroRow
                key={member.proyect_role_user_id}
                member={member}
                index={index}
                isChecked={checkedIds.includes(member.proyect_role_user_id)}
                onCheckChange={() => onCheckChange(member.proyect_role_user_id)}
                onEditClick={onEditClick}
              />
            ))
          ) : (
            <tr>
              <td colSpan="4" className="table-placeholder">
                No hay integrantes asignados a este proyecto. Pulsa "+ Add Member" para agregar uno.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EquiposTable;
