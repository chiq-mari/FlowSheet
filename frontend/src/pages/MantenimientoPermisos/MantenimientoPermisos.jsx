import React, { useState } from 'react';
import { usePermisos } from '../../hooks/usePermisos';
import Tabs from '../../componentes/ui/Tabs';
import ConfirmDeleteModal from '../../componentes/ui/ConfirmDeleteModal';
import PermisoSummaryCard from './PermisoSummaryCard';
import PerfilFilterChips from './PerfilFilterChips';
import PermisoTable from './PermisoTable';
import AgregarPermisoModal from './AgregarPermisoModal';
import '../../componentes/ui/MaintenancePage.css';
import '../../componentes/ui/SearchToolbar.css';
import './MantenimientoPermisos.css';

const TABS = [
  { id: 'opciones', label: 'Opciones', color: 'blue' },
  { id: 'metodos', label: 'Métodos', color: 'purple' },
];

// Página de Mantenimiento de Permisos por Perfil. Una sola tabla que cambia de
// forma según la pestaña activa (permission_option vs permission_method), con
// el mismo conjunto de tarjetas resumen arriba (las cuenta usePermisos en una
// sola consulta) y el mismo modal de alta, adaptado a qué se está otorgando.
const MantenimientoPermisos = () => {
  const {
    tab,
    setTab,
    profileFilter,
    setProfileFilter,
    resumen,
    grid,
    loading,
    error,
    asignarOpcion,
    quitarOpciones,
    asignarMetodo,
    quitarMetodos,
  } = usePermisos();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'agregar' | 'eliminar' | null
  const [actionError, setActionError] = useState(null);

  const accent = tab === 'opciones' ? 'blue' : 'purple';
  const getRowId = (row) => (tab === 'opciones' ? row.permission_option_id : row.permission_method_id);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === grid.length ? new Set() : new Set(grid.map(getRowId))
    );
  };

  const openAgregar = () => {
    setActionError(null);
    setModal('agregar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setActionError(null);
  };

  const handleAgregar = async ({ profileId, optionId, methodId, profileDe, optionDe, methodDe }) => {
    try {
      if (tab === 'opciones') {
        await asignarOpcion(profileId, optionId, profileDe, optionDe);
      } else {
        await asignarMetodo(profileId, methodId, profileDe, methodDe);
      }
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      if (tab === 'opciones') {
        await quitarOpciones(ids);
      } else {
        await quitarMetodos(ids);
      }
      setSelectedIds(new Set());
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <section className="maintenance-card">
      <header className="maintenance-header">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h2>Mantenimiento de Permisos por Perfil</h2>
      </header>

      <div className="maintenance-body">
        <div className="permiso-summary-grid">
          {resumen.map((perfil) => (
            <PermisoSummaryCard
              key={perfil.profile_id}
              label={perfil.profile_de}
              count={tab === 'opciones' ? perfil.option_count : perfil.method_count}
            />
          ))}
        </div>

        <Tabs tabs={TABS} active={tab} onChange={changeTab} />

        <div className="search-toolbar">
          <PerfilFilterChips
            perfiles={resumen}
            selectedId={profileFilter}
            onSelect={setProfileFilter}
            accent={accent}
          />

          <button
            type="button"
            className="toolbar-icon-btn toolbar-delete-btn"
            disabled={selectedIds.size === 0}
            onClick={openDelete}
            title="Eliminar seleccionados"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <button
            type="button"
            className="toolbar-icon-btn toolbar-add-btn permisos-add-btn"
            data-accent={accent}
            onClick={openAgregar}
            title="Agregar permiso"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {error && <p className="maintenance-load-error">{error}</p>}

        <PermisoTable
          tab={tab}
          rows={grid}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          getRowId={getRowId}
          accentPillClass={accent === 'blue' ? 'pill-blue' : 'pill-purple'}
        />
      </div>

      {modal === 'agregar' && (
        <AgregarPermisoModal
          tab={tab}
          perfiles={resumen}
          accent={accent}
          onClose={closeModal}
          onSubmit={handleAgregar}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          itemLabel="permiso"
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoPermisos;
