import React, { useState, useEffect, useRef } from 'react';
import { ejecutarMetodo } from '../../services/toProcess';
import '../../componentes/ui/DataTable.css';
import './MantenimientoAuditoria.css';

const SUB_SYSTEM = 'Seguridad';
const OBJECT_AUDITORIA = 'Auditoria';

// Searchbar interactivo de proyectos (pidió explícitamente el usuario que fuera
// dinámico, no un drilldown ni un <select> con opciones fijas). Mismo patrón ya
// probado en BuscadorUsuario.jsx: flujo normal (no position:absolute) y
// box-sizing:border-box, para no repetir el bug del scrollbar fantasma que se
// dio con ese componente.
const BuscadorProyecto = ({ selected, onSelect }) => {
  const [search, setSearch] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      ejecutarMetodo(SUB_SYSTEM, OBJECT_AUDITORIA, 'buscarProyectos', { search })
        .then((data) => {
          if (!cancelled) setProyectos(data || []);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, open]);

  const handleFocus = () => {
    setOpen(true);
    setSearch('');
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  const handlePick = (proyecto) => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    onSelect(proyecto);
    setOpen(false);
  };

  return (
    <div className="buscador-proyecto">
      <input
        type="text"
        placeholder="i.e: Your project name"
        value={open ? search : (selected?.name || '')}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {open && (
        <ul className="buscador-proyecto-list">
          {loading && <li className="buscador-proyecto-status">Buscando...</li>}
          {!loading && proyectos.length === 0 && <li className="buscador-proyecto-status">Sin resultados</li>}
          {proyectos.map((proyecto) => (
            <li key={proyecto.id} onMouseDown={() => handlePick(proyecto)}>
              <span className="cell-strong">{proyecto.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuscadorProyecto;
