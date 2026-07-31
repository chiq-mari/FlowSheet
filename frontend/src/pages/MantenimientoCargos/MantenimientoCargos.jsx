import React, { useState } from 'react';
import { useCargos } from '../../hooks/useCargos';
import SearchToolbar from '../../componentes/ui/SearchToolbar';
import ConfirmDeleteModal from '../../componentes/ui/ConfirmDeleteModal';
import CargoTable from './CargoTable';
import CrearCargoModal from './CrearCargoModal';
import EditarCargoModal from './EditarCargoModal';
import '../../componentes/ui/MaintenancePage.css';

// Página del CRUD de Cargos. Orquesta el hook de datos, la selección de filas
// y qué modal está abierto; delega toda la presentación a subcomponentes.
const MantenimientoCargos = () => {
  const {
    cargos,
    search,
    setSearch,
    loading,
    error,
    createCargo,
    updateCargo,
    deleteCargos,
  } = useCargos();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'crear' | 'editar' | 'eliminar' | null
  const [cargoToEdit, setCargoToEdit] = useState(null);
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
      prev.size === cargos.length ? new Set() : new Set(cargos.map((c) => c.id))
    );
  };

  const openCreate = () => {
    setActionError(null);
    setModal('crear');
  };

  const openEdit = (cargo) => {
    setActionError(null);
    setCargoToEdit(cargo);
    setModal('editar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setCargoToEdit(null);
    setActionError(null);
  };

  const handleCreate = async (payload) => {
    try {
      await createCargo(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateCargo(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCargos(Array.from(selectedIds));
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2>Mantenimiento de Cargos</h2>
      </header>

      <div className="maintenance-body">
        <SearchToolbar
          value={search}
          onChange={setSearch}
          placeholder="Buscar cargo..."
          hasSelection={selectedIds.size > 0}
          onDeleteClick={openDelete}
          onCreateClick={openCreate}
        />

        {error && <p className="maintenance-load-error">{error}</p>}

        <CargoTable
          cargos={cargos}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
        />
      </div>

      {modal === 'crear' && (
        <CrearCargoModal onClose={closeModal} onSubmit={handleCreate} error={actionError} />
      )}

      {modal === 'editar' && cargoToEdit && (
        <EditarCargoModal
          cargo={cargoToEdit}
          onClose={closeModal}
          onSubmit={handleUpdate}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          itemLabel="cargo"
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoCargos;
