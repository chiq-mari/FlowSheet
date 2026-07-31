import React, { useState } from 'react';
import { usePerfiles } from '../../hooks/usePerfiles';
import { useAsignacionPerfil } from '../../hooks/useAsignacionPerfil';
import { getProfileColor } from './profileColors';
import BuscadorUsuario from './BuscadorUsuario';
import '../../componentes/ui/DataTable.css';
import '../../componentes/ui/SearchToolbar.css';
import '../../componentes/ui/ModalForm.css';
import './MantenimientoPerfiles.css';

// Contenido de la pestaña "Asignar": elegir un usuario y agregarle/quitarle perfiles.
const AsignarPerfilTab = () => {
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Instancia propia de usePerfiles, separada de la de ResumenPerfilesTab: aquí solo
  // se usa como catálogo completo de perfiles (para calcular cuáles le faltan al
  // usuario elegido), no se muestra su tabla/resumen.
  const { resumen: catalogo } = usePerfiles();

  const userId = selectedUsuario?.user_id || null;
  const { perfilesAsignados, loading, error, asignarPerfil, quitarPerfil } = useAsignacionPerfil(userId);

  // Mismo criterio de color que ResumenPerfilesTab: índice dentro del catálogo completo.
  const colorIndexByProfileId = {};
  catalogo.forEach((perfil, index) => {
    colorIndexByProfileId[perfil.profile_id] = index;
  });

  const asignadosIds = new Set(perfilesAsignados.map((p) => p.profile_id));
  const disponibles = catalogo.filter((p) => !asignadosIds.has(p.profile_id));

  const handleSelectUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    setAddMenuOpen(false);
  };

  const handleAsignar = async (profileId) => {
    setAddMenuOpen(false);
    await asignarPerfil(profileId);
  };

  return (
    <div className="perfiles-tab-body">
      <div className="asignar-perfil-field">
        <label>Usuario</label>
        <BuscadorUsuario selectedUsuario={selectedUsuario} onSelect={handleSelectUsuario} />
      </div>

      {selectedUsuario && (
        <div className="perfiles-asignados-card">
          <div className="perfiles-asignados-header">
            <span>Perfiles Asignados</span>
            <div className="asignar-perfil-add-wrap">
              <button
                type="button"
                className="toolbar-icon-btn toolbar-add-btn"
                onClick={() => setAddMenuOpen((prev) => !prev)}
                disabled={disponibles.length === 0}
                title={disponibles.length === 0 ? 'Ya tiene todos los perfiles' : 'Agregar perfil'}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {addMenuOpen && disponibles.length > 0 && (
                <ul className="asignar-perfil-add-menu">
                  <li className="asignar-perfil-add-menu-title">Agregar Perfil</li>
                  {disponibles.map((perfil) => (
                    <li key={perfil.profile_id}>
                      <button type="button" onClick={() => handleAsignar(perfil.profile_id)}>
                        <span className={`pill-dot-standalone pill-dot-standalone-${getProfileColor(colorIndexByProfileId[perfil.profile_id] || 0)}`} />
                        {perfil.profile_de}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {error && <p className="modal-form-error">{error}</p>}

          {loading && <p className="data-table-status">Cargando perfiles...</p>}

          {!loading && perfilesAsignados.length === 0 && (
            <p className="data-table-status">Este usuario todavía no tiene perfiles asignados.</p>
          )}

          {!loading && perfilesAsignados.map((perfil) => (
            <div key={perfil.profile_id} className="perfil-asignado-row">
              <span className={`pill pill-${getProfileColor(colorIndexByProfileId[perfil.profile_id] || 0)}`}>
                {perfil.profile_de}
              </span>
              <button type="button" className="btn-secondary btn-quitar" onClick={() => quitarPerfil(perfil.profile_id)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AsignarPerfilTab;
