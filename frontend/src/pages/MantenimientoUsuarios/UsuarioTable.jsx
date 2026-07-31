import React, { useState } from 'react';
import '../../componentes/ui/DataTable.css';
import './UsuarioTable.css';

const isActivo = (statusDe = '') => statusDe.toLowerCase().includes('activo') && !statusDe.toLowerCase().includes('inactivo');

// Tabla presentacional: recibe datos y callbacks, no sabe de dónde vienen ni cómo se guardan.
const UsuarioTable = ({ usuarios, loading, selectedIds, onToggleSelect, onToggleSelectAll, onEdit }) => {
  // Revelar/ocultar password es un detalle puramente visual de esta tabla, no necesita
  // subir al padre: se guarda como un set de user_id "revelados".
  const [revealedIds, setRevealedIds] = useState(new Set());

  const toggleReveal = (userId) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  if (loading) {
    return <p className="data-table-status">Cargando usuarios...</p>;
  }

  if (usuarios.length === 0) {
    return <p className="data-table-status">No se encontraron usuarios.</p>;
  }

  const allSelected = selectedIds.size === usuarios.length;

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
            <th>USERNAME</th>
            <th>PASSWORD</th>
            <th>EMAIL</th>
            <th>STATUS</th>
            <th>PERSONA (CI)</th>
            <th className="edit-col"></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => {
            const isSelected = selectedIds.has(usuario.user_id);
            const isRevealed = revealedIds.has(usuario.user_id);
            const activo = isActivo(usuario.status_user_de);

            return (
              <tr key={usuario.user_id} className={isSelected ? 'selected' : ''}>
                <td>
                  <button
                    type="button"
                    className={`row-checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => onToggleSelect(usuario.user_id)}
                    aria-label={`Seleccionar ${usuario.user_na}`}
                  />
                </td>
                <td className="cell-strong">{usuario.user_na}</td>
                <td>
                  <span className="usuario-password-cell">
                    <span className="usuario-password-dots">
                      {isRevealed ? usuario.user_pw : '•'.repeat(Math.min(usuario.user_pw?.length || 8, 10))}
                    </span>
                    <button
                      type="button"
                      className="usuario-password-toggle"
                      onClick={() => toggleReveal(usuario.user_id)}
                      title={isRevealed ? 'Ocultar' : 'Mostrar'}
                    >
                      {isRevealed ? (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </span>
                </td>
                <td className="cell-link">{usuario.user_email}</td>
                <td>
                  <span className={`pill ${activo ? 'pill-green' : 'pill-red'}`}>
                    <span className="pill-dot" />
                    {usuario.status_user_de}
                  </span>
                </td>
                <td>
                  <div className="cell-mono">{usuario.person_ci}</div>
                  <div className="cell-muted">{usuario.person_na} {usuario.person_ln}</div>
                </td>
                <td>
                  <button
                    type="button"
                    className="row-edit-btn"
                    onClick={() => onEdit(usuario)}
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

export default UsuarioTable;
