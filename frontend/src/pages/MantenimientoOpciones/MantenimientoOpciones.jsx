import React, { useState } from 'react';
import { useOpciones } from '../../hooks/useOpciones';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import SearchToolbar from '../../componentes/ui/SearchToolbar';
import ConfirmDeleteModal from '../../componentes/ui/ConfirmDeleteModal';
import OpcionTable from './OpcionTable';
import CrearOpcionModal from './CrearOpcionModal';
import EditarOpcionModal from './EditarOpcionModal';
import '../../componentes/ui/MaintenancePage.css';

// Página del CRUD de Opciones. Orquesta el hook de datos, la selección de filas
// y qué modal está abierto; delega toda la presentación a subcomponentes.
const MantenimientoOpciones = () => {
  const {
    opciones,
    search,
    setSearch,
    subSystemFilter,
    setSubSystemFilter,
    loading,
    error,
    createOpcion,
    updateOpcion,
    deleteOpciones,
  } = useOpciones();

  // Solo lectura, para poblar el <select> de filtro por subsistema.
  const { subsistemas } = useSubsistemas();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'crear' | 'editar' | 'eliminar' | null
  const [opcionToEdit, setOpcionToEdit] = useState(null);
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
      prev.size === opciones.length ? new Set() : new Set(opciones.map((o) => o.option_id))
    );
  };

  const openCreate = () => {
    setActionError(null);
    setModal('crear');
  };

  const openEdit = (opcion) => {
    setActionError(null);
    setOpcionToEdit(opcion);
    setModal('editar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setOpcionToEdit(null);
    setActionError(null);
  };

  const handleCreate = async (payload) => {
    try {
      await createOpcion(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateOpcion(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOpciones(Array.from(selectedIds));
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <h2>Mantenimiento de Opciones</h2>
      </header>

      <div className="maintenance-body">
        <SearchToolbar
          value={search}
          onChange={setSearch}
          placeholder="Buscar opción..."
          hasSelection={selectedIds.size > 0}
          onDeleteClick={openDelete}
          onCreateClick={openCreate}
          filters={
            <select
              className="search-toolbar-filter"
              value={subSystemFilter}
              onChange={(e) => setSubSystemFilter(e.target.value)}
            >
              <option value="">Todos los subsistemas</option>
              {subsistemas.map((subsistema) => (
                <option key={subsistema.id} value={subsistema.id}>{subsistema.name}</option>
              ))}
            </select>
          }
        />

        {error && <p className="maintenance-load-error">{error}</p>}

        <OpcionTable
          opciones={opciones}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
        />
      </div>

      {modal === 'crear' && (
        <CrearOpcionModal onClose={closeModal} onSubmit={handleCreate} error={actionError} />
      )}

      {modal === 'editar' && opcionToEdit && (
        <EditarOpcionModal
          opcion={opcionToEdit}
          onClose={closeModal}
          onSubmit={handleUpdate}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          itemLabel="opción"
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoOpciones;
