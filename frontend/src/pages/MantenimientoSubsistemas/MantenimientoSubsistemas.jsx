import React, { useState } from 'react';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import SearchToolbar from '../../componentes/ui/SearchToolbar';
import ConfirmDeleteModal from '../../componentes/ui/ConfirmDeleteModal';
import SubsistemaTable from './SubsistemaTable';
import CrearSubsistemaModal from './CrearSubsistemaModal';
import EditarSubsistemaModal from './EditarSubsistemaModal';
import '../../componentes/ui/MaintenancePage.css';

// Página del CRUD de Subsistemas. Orquesta el hook de datos, la selección de filas
// y qué modal está abierto; delega toda la presentación a subcomponentes.
const MantenimientoSubsistemas = () => {
  const {
    subsistemas,
    search,
    setSearch,
    loading,
    error,
    createSubsistema,
    updateSubsistema,
    deleteSubsistemas,
  } = useSubsistemas();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'crear' | 'editar' | 'eliminar' | null
  const [subsistemaToEdit, setSubsistemaToEdit] = useState(null);
  const [actionError, setActionError] = useState(null);

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
      prev.size === subsistemas.length ? new Set() : new Set(subsistemas.map((s) => s.id))
    );
  };

  const openCreate = () => {
    setActionError(null);
    setModal('crear');
  };

  const openEdit = (subsistema) => {
    setActionError(null);
    setSubsistemaToEdit(subsistema);
    setModal('editar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setSubsistemaToEdit(null);
    setActionError(null);
  };

  const handleCreate = async (payload) => {
    try {
      await createSubsistema(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateSubsistema(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubsistemas(Array.from(selectedIds));
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h2>Mantenimiento de Subsistemas</h2>
      </header>

      <div className="maintenance-body">
        <SearchToolbar
          value={search}
          onChange={setSearch}
          placeholder="Buscar subsistema..."
          hasSelection={selectedIds.size > 0}
          onDeleteClick={openDelete}
          onCreateClick={openCreate}
        />

        {error && <p className="maintenance-load-error">{error}</p>}

        <SubsistemaTable
          subsistemas={subsistemas}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
        />
      </div>

      {modal === 'crear' && (
        <CrearSubsistemaModal onClose={closeModal} onSubmit={handleCreate} error={actionError} />
      )}

      {modal === 'editar' && subsistemaToEdit && (
        <EditarSubsistemaModal
          subsistema={subsistemaToEdit}
          onClose={closeModal}
          onSubmit={handleUpdate}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          itemLabel="subsistema"
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoSubsistemas;
