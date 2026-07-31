import React, { useState } from 'react';
import { useObjetos } from '../../hooks/useObjetos';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import SearchToolbar from '../../componentes/ui/SearchToolbar';
import ConfirmDeleteModal from '../../componentes/ui/ConfirmDeleteModal';
import ObjetoTable from './ObjetoTable';
import CrearObjetoModal from './CrearObjetoModal';
import EditarObjetoModal from './EditarObjetoModal';
import '../../componentes/ui/MaintenancePage.css';

// Página del CRUD de Objetos. Orquesta el hook de datos, la selección de filas
// y qué modal está abierto; delega toda la presentación a subcomponentes.
const MantenimientoObjetos = () => {
  const {
    objetos,
    search,
    setSearch,
    subSystemFilter,
    setSubSystemFilter,
    loading,
    error,
    createObjeto,
    updateObjeto,
    deleteObjetos,
  } = useObjetos();

  // Solo lectura, para poblar el <select> de filtro por subsistema.
  const { subsistemas } = useSubsistemas();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'crear' | 'editar' | 'eliminar' | null
  const [objetoToEdit, setObjetoToEdit] = useState(null);
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
      prev.size === objetos.length ? new Set() : new Set(objetos.map((o) => o.object_id))
    );
  };

  const openCreate = () => {
    setActionError(null);
    setModal('crear');
  };

  const openEdit = (objeto) => {
    setActionError(null);
    setObjetoToEdit(objeto);
    setModal('editar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setObjetoToEdit(null);
    setActionError(null);
  };

  const handleCreate = async (payload) => {
    try {
      await createObjeto(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateObjeto(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteObjetos(Array.from(selectedIds));
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3m-16 0c0 1.657 3.582 3 8 3s8-1.343 8-3m-16 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" />
        </svg>
        <h2>Mantenimiento de Objetos</h2>
      </header>

      <div className="maintenance-body">
        <SearchToolbar
          value={search}
          onChange={setSearch}
          placeholder="Buscar objeto..."
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

        <ObjetoTable
          objetos={objetos}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
        />
      </div>

      {modal === 'crear' && (
        <CrearObjetoModal onClose={closeModal} onSubmit={handleCreate} error={actionError} />
      )}

      {modal === 'editar' && objetoToEdit && (
        <EditarObjetoModal
          objeto={objetoToEdit}
          onClose={closeModal}
          onSubmit={handleUpdate}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          itemLabel="objeto"
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoObjetos;
