import React, { useState } from 'react';
import { usePersonas } from '../../hooks/usePersonas';
import PersonaSearchBar from './PersonaSearchBar';
import PersonaTable from './PersonaTable';
import CrearPersonaModal from './CrearPersonaModal';
import EditarPersonaModal from './EditarPersonaModal';
import EliminarPersonaModal from './EliminarPersonaModal';
import './MantenimientoPersonas.css';

// Página del CRUD de Personas. Orquesta el hook de datos, la selección de filas
// y qué modal está abierto; delega toda la presentación a subcomponentes.
const MantenimientoPersonas = () => {
  const {
    personas,
    search,
    setSearch,
    loading,
    error,
    createPersona,
    updatePersona,
    deletePersonas,
  } = usePersonas();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState(null); // 'crear' | 'editar' | 'eliminar' | null
  const [personaToEdit, setPersonaToEdit] = useState(null);
  const [actionError, setActionError] = useState(null);

  const toggleSelect = (personId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === personas.length ? new Set() : new Set(personas.map((p) => p.person_id))
    );
  };

  const openCreate = () => {
    setActionError(null);
    setModal('crear');
  };

  const openEdit = (persona) => {
    setActionError(null);
    setPersonaToEdit(persona);
    setModal('editar');
  };

  const openDelete = () => {
    setActionError(null);
    setModal('eliminar');
  };

  const closeModal = () => {
    setModal(null);
    setPersonaToEdit(null);
    setActionError(null);
  };

  const handleCreate = async (payload) => {
    try {
      await createPersona(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updatePersona(payload);
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePersonas(Array.from(selectedIds));
      setSelectedIds(new Set());
      closeModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <section className="persona-maintenance-card">
      <header className="persona-maintenance-header">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h2>Mantenimiento de Personas</h2>
      </header>

      <div className="persona-maintenance-body">
        <PersonaSearchBar
          value={search}
          onChange={setSearch}
          hasSelection={selectedIds.size > 0}
          onDeleteClick={openDelete}
          onCreateClick={openCreate}
        />

        {error && <p className="persona-load-error">{error}</p>}

        <PersonaTable
          personas={personas}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
        />
      </div>

      {modal === 'crear' && (
        <CrearPersonaModal onClose={closeModal} onSubmit={handleCreate} error={actionError} />
      )}

      {modal === 'editar' && personaToEdit && (
        <EditarPersonaModal
          persona={personaToEdit}
          onClose={closeModal}
          onSubmit={handleUpdate}
          error={actionError}
        />
      )}

      {modal === 'eliminar' && (
        <EliminarPersonaModal
          count={selectedIds.size}
          onClose={closeModal}
          onConfirm={handleDelete}
          error={actionError}
        />
      )}
    </section>
  );
};

export default MantenimientoPersonas;
