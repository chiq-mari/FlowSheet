import React, { useState } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import SearchToolbar from '../../componentes/ui/SearchToolbar';
import ConfirmDeleteModal from '../../componentes/ui/ConfirmDeleteModal';
import UsuarioTable from './UsuarioTable';
import CrearUsuarioModal from './CrearUsuarioModal';
import EditarUsuarioModal from './EditarUsuarioModal';
import '../../componentes/ui/MaintenancePage.css';

// Página del CRUD de Usuarios. Orquesta el hook de datos, la selección de filas
// y qué modal está abierto; delega toda la presentación a subcomponentes.
const MantenimientoUsuarios = () => {
  const {
    usuarios,
    search,
    setSearch,
    loading,
    error,
    createUsuario,
    updateUsuario,
    deleteUsuarios,
  } = useUsuarios();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'crear' | 'editar' | 'eliminar' | null
  const [usuarioToEdit, setUsuarioToEdit] = useState(null);
  const [actionError, setActionError] = useState(null);

  const toggleSelect = (userId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === usuarios.length ? new Set() : new Set(usuarios.map((u) => u.user_id))
    );
  };

  const openCreate = () => {
    setActionError(null);
    setModal('crear');
  };

  const openEdit = (usuario) => {
    setActionError(null);
    setUsuarioToEdit(usuario);
    setModal('editar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setUsuarioToEdit(null);
    setActionError(null);
  };

  const handleCreate = async (payload) => {
    try {
      await createUsuario(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateUsuario(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUsuarios(Array.from(selectedIds));
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h2>Mantenimiento de Usuarios</h2>
      </header>

      <div className="maintenance-body">
        <SearchToolbar
          value={search}
          onChange={setSearch}
          placeholder="Buscar usuario..."
          hasSelection={selectedIds.size > 0}
          onDeleteClick={openDelete}
          onCreateClick={openCreate}
        />

        {error && <p className="maintenance-load-error">{error}</p>}

        <UsuarioTable
          usuarios={usuarios}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
        />
      </div>

      {modal === 'crear' && (
        <CrearUsuarioModal onClose={closeModal} onSubmit={handleCreate} error={actionError} />
      )}

      {modal === 'editar' && usuarioToEdit && (
        <EditarUsuarioModal
          usuario={usuarioToEdit}
          onClose={closeModal}
          onSubmit={handleUpdate}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <ConfirmDeleteModal
          count={selectedIds.size}
          itemLabel="usuario"
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoUsuarios;
