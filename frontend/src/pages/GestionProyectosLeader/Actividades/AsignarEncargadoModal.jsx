import React, { useState, useEffect } from 'react';
import Modal from '../../../componentes/ui/Modal';

export function AsignarEncargadoModal({
  isOpen,
  onClose,
  activity = null,
  assignments = [], // All assignments for this project
  teamMembers = [],  // All team members of this project
  onAssign,          // Callback (proyectRoleUserId) => Promise
  onUnassign         // Callback (userAssignmentId) => Promise
}) {
  const [search, setSearch] = useState('');
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Find assignments for this activity
  const activeAssignments = assignments.filter(
    (a) => a.assignment_id === activity?.id
  );

  // Filters team members to find those NOT already assigned to this activity
  const unassignedTeamMembers = teamMembers.filter(
    (member) => !activeAssignments.some((a) => a.proyect_role_user_id === member.proyect_role_user_id)
  );

  // Filters active assignments by search term (username)
  const filteredAssignments = activeAssignments.filter((a) =>
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setIsNestedOpen(false);
      setSelectedMemberId('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleAddClick = () => {
    if (unassignedTeamMembers.length > 0) {
      setSelectedMemberId(unassignedTeamMembers[0].proyect_role_user_id);
    } else {
      setSelectedMemberId('');
    }
    setErrorMsg('');
    setIsNestedOpen(true);
  };

  const handleNestedSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setErrorMsg('Debes seleccionar un miembro de equipo.');
      return;
    }
    try {
      await onAssign(selectedMemberId);
      setIsNestedOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error al asignar miembro.');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isNestedOpen}
        onClose={onClose}
        title="Asignar Encargado"
        icon="person"
      >
        <div className="assign-modal-body">
          {/* Header search bar */}
          <div className="assign-search-toolbar">
            <input
              type="text"
              placeholder="Buscar por username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="assign-search-input"
            />
            <button
              type="button"
              className="assign-add-btn"
              onClick={handleAddClick}
              title="Asignar miembro"
            >
              +
            </button>
          </div>

          {/* Table of assigned users */}
          <div className="assign-table-container">
            <table className="assign-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>USUARIO</th>
                  <th>ROL EN PROYECTO</th>
                  <th style={{ width: '50px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((a) => (
                    <tr key={a.user_assignment_id}>
                      <td>
                        <div className="bullet-point"></div>
                      </td>
                      <td className="assign-username">{a.username}</td>
                      <td>
                        <span className="role-tag-blue">{a.role_name}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="assign-delete-btn"
                          onClick={() => onUnassign(a.user_assignment_id)}
                          title="Eliminar asignación"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="assign-table-placeholder">
                      No hay ningún encargado asignado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="modal-actions-buttons" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn-secondary-flat"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Nested Modal: Seleccionar Responsable */}
      <Modal
        isOpen={isOpen && isNestedOpen}
        onClose={() => setIsNestedOpen(false)}
        title="Seleccionar Responsable"
        icon="person"
      >
        <form onSubmit={handleNestedSubmit} className="project-modal-form">
          {errorMsg && <div className="error-badge">{errorMsg}</div>}

          <div className="form-group">
            <label htmlFor="team-member-select">MIEMBRO DEL EQUIPO</label>
            <select
              id="team-member-select"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="form-control"
              required
            >
              <option value="" disabled>Select</option>
              {unassignedTeamMembers.map((m) => (
                <option key={m.proyect_role_user_id} value={m.proyect_role_user_id}>
                  {m.username} ({m.role_name})
                </option>
              ))}
            </select>
            {unassignedTeamMembers.length === 0 && (
              <p className="field-help-text-red">Todos los miembros del equipo ya están asignados a esta actividad.</p>
            )}
          </div>

          <div className="modal-actions-buttons" style={{ marginTop: '2rem' }}>
            <button
              type="button"
              className="btn-secondary-flat"
              onClick={() => setIsNestedOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary-flat"
              disabled={unassignedTeamMembers.length === 0}
            >
              Agregar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default AsignarEncargadoModal;
