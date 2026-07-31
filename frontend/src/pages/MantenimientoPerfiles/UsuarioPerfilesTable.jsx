import React from 'react';
import { getProfileColor } from './profileColors';
import '../../componentes/ui/DataTable.css';

// Grilla de solo lectura (pestaña "Ver Perfiles"): cada usuario con sus perfiles
// asignados como pills. Sin checkboxes ni edición — para eso está la pestaña "Asignar".
// `colorIndexByProfileId` viene del padre para que el mismo perfil use siempre el
// mismo color acá y en las tarjetas de resumen.
const UsuarioPerfilesTable = ({ usuarios, loading, colorIndexByProfileId }) => {
  if (loading) {
    return <p className="data-table-status">Cargando usuarios...</p>;
  }

  if (usuarios.length === 0) {
    return <p className="data-table-status">No se encontraron usuarios.</p>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>USUARIO</th>
            <th>PERFILES ASIGNADOS</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.user_id}>
              <td>
                <div className="cell-strong">{usuario.user_na}</div>
                <div className="cell-muted">{usuario.user_email}</div>
              </td>
              <td>
                {usuario.perfiles.length === 0 && <span className="cell-muted">Sin perfiles</span>}
                {usuario.perfiles.map((perfil) => (
                  <span
                    key={perfil.profile_id}
                    className={`pill pill-${getProfileColor(colorIndexByProfileId[perfil.profile_id] || 0)}`}
                    style={{ marginRight: '0.4rem' }}
                  >
                    {perfil.profile_de}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuarioPerfilesTable;
