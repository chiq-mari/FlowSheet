import React, { useState, useRef } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import '../../componentes/ui/DataTable.css';
import './MantenimientoPerfiles.css';

// Searchbar interactivo para elegir un usuario (reemplaza el <select> plano del
// mockup, tal como pidió el usuario). Reusa useUsuarios() solo para leer/buscar,
// igual que SeleccionarPersonaModal reusa usePersonas().
const BuscadorUsuario = ({ selectedUsuario, onSelect }) => {
  const { usuarios, search, setSearch, loading } = useUsuarios();
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef(null);

  const handleFocus = () => {
    setOpen(true);
    setSearch('');
  };

  const handleBlur = () => {
    // Retraso corto: le da tiempo al onMouseDown de la lista a dispararse
    // antes de que el blur del input la cierre.
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  const handlePick = (usuario) => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    onSelect(usuario);
    setOpen(false);
  };

  return (
    <div className="buscador-usuario">
      <input
        type="text"
        placeholder="Seleccionar usuario..."
        value={open ? search : (selectedUsuario?.user_na || '')}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {open && (
        <ul className="buscador-usuario-list">
          {loading && <li className="buscador-usuario-status">Buscando...</li>}
          {!loading && usuarios.length === 0 && <li className="buscador-usuario-status">Sin resultados</li>}
          {usuarios.map((usuario) => (
            <li key={usuario.user_id} onMouseDown={() => handlePick(usuario)}>
              <span className="cell-strong">{usuario.user_na}</span>
              <span className="cell-muted">{usuario.user_email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuscadorUsuario;
