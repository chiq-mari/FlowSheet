import React, { useState } from 'react';
import { useMetodos } from '../../hooks/useMetodos';
import { useSubsistemas } from '../../hooks/useSubsistemas';
import { useObjetos } from '../../hooks/useObjetos';
import SearchToolbar from '../../componentes/ui/SearchToolbar';
import ConfirmDeleteModal from '../../componentes/ui/ConfirmDeleteModal';
import MetodoTable from './MetodoTable';
import CrearMetodoModal from './CrearMetodoModal';
import EditarMetodoModal from './EditarMetodoModal';
import '../../componentes/ui/MaintenancePage.css';

// Página del CRUD de Métodos. Orquesta el hook de datos, la selección de filas
// y qué modal está abierto; delega toda la presentación a subcomponentes.
const MantenimientoMetodos = () => {
  const {
    metodos,
    search,
    setSearch,
    subSystemFilter,
    setSubSystemFilter,
    objectFilter,
    setObjectFilter,
    loading,
    error,
    createMetodo,
    updateMetodo,
    deleteMetodos,
  } = useMetodos();

  // Solo lectura, para poblar los <select> de filtro (catálogos completos, sin cascada
  // entre sí — igual que el dropdown "Todos los objetos" del mockup).
  const { subsistemas } = useSubsistemas();
  const { objetos: catalogoObjetos } = useObjetos();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'crear' | 'editar' | 'eliminar' | null
  const [metodoToEdit, setMetodoToEdit] = useState(null);
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
      prev.size === metodos.length ? new Set() : new Set(metodos.map((m) => m.method_id))
    );
  };

  const openCreate = () => {
    setActionError(null);
    setModal('crear');
  };

  const openEdit = (metodo) => {
    setActionError(null);
    setMetodoToEdit(metodo);
    setModal('editar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setMetodoToEdit(null);
    setActionError(null);
  };

  const handleCreate = async (payload) => {
    try {
      await createMetodo(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateMetodo(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMetodos(Array.from(selectedIds));
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <h2>Mantenimiento de Métodos</h2>
      </header>

      <div className="maintenance-body">
        <SearchToolbar
          value={search}
          onChange={setSearch}
          placeholder="Buscar método..."
          hasSelection={selectedIds.size > 0}
          onDeleteClick={openDelete}
          onCreateClick={openCreate}
          filters={
            <>
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

              <select
                className="search-toolbar-filter"
                value={objectFilter}
                onChange={(e) => setObjectFilter(e.target.value)}
              >
                <option value="">Todos los objetos</option>
                {catalogoObjetos.map((objeto) => (
                  <option key={objeto.object_id} value={objeto.object_id}>{objeto.object_de}</option>
                ))}
              </select>
            </>
          }
        />

        {error && <p className="maintenance-load-error">{error}</p>}

        <MetodoTable
          metodos={metodos}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
        />
      </div>

      {modal === 'crear' && (
        <CrearMetodoModal onClose={closeModal} onSubmit={handleCreate} error={actionError} />
      )}

      {modal === 'editar' && metodoToEdit && (
        <EditarMetodoModal
          metodo={metodoToEdit}
          onClose={closeModal}
          onSubmit={handleUpdate}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          itemLabel="método"
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoMetodos;
