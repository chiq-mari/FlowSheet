import React, { useState } from 'react';
import Modal from '../../../componentes/ui/Modal';
import './AsignarEncargadoModal.css';

export function AsignarEncargadoModal({
  isOpen,
  onClose,
  activity = null,
  assignments = [], // All assignments for this project
  onOpenAdd,        // Function to trigger opening the select assignee popup
  onOpenRemove      // Function to trigger opening the remove assignee confirmation popup (assigneeObj)
}) {
  const [search, setSearch] = useState('');

  // Find assignments for this activity
  const activeAssignments = assignments.filter(
    (a) => a.assignment_id === activity?.id
  );

  // Filters active assignments by search term (username)
  const filteredAssignments = activeAssignments.filter((a) =>
    a.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Encargado"
      icon="person"
    >
      <div className="assign-modal-body">
        {/* Header search bar */}
        <div className="assign-search-toolbar">
          <div className="search-input-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="assign-search-input"
            />
          </div>
          <button
            type="button"
            className="assign-add-btn"
            onClick={onOpenAdd}
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
                <th style={{ width: '40px' }}>
                  <input type="checkbox" disabled className="checkbox-control" />
                </th>
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
                      <input type="checkbox" disabled className="checkbox-control" />
                    </td>
                    <td className="assign-username">{a.username}</td>
                    <td>
                      <span className="role-tag-blue">{a.role_name}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="assign-delete-btn"
                        onClick={() => onOpenRemove(a)}
                        title="Eliminar asignación"
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
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
      </div>
    </Modal>
  );
}

export default AsignarEncargadoModal;
