import React, { useState, useEffect } from 'react';
import { ejecutarMetodo } from '../../../services/toProcess';
import RolModal from './RolModal';
import Modal from '../../../componentes/ui/Modal';
import EditButton from '../../../componentes/ui/EditButton';
import './RolesTab.css';

export function RolesTab() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checkbox management for bulk deletion
  const [checkedIds, setCheckedIds] = useState([]);

  // Modals state
  const [isRolModalOpen, setIsRolModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Load initial projects list
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const projectList = await ejecutarMetodo('Hojas de Tiempo', 'Proyecto', 'getAllForLeader');
        setProjects(projectList || []);
        if (projectList && projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        }
      } catch (err) {
        console.error('Error al inicializar la pestaña de roles:', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch project roles when selected project changes
  const fetchRolesData = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await ejecutarMetodo('Hojas de Tiempo', 'Roles', 'getAllForProject', { projectId: selectedProjectId });
      setRoles(res.roles || []);
      setCheckedIds([]);
    } catch (err) {
      console.error('Error al cargar roles del proyecto:', err.message);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, [selectedProjectId]);

  const activeProject = projects.find((p) => String(p.id) === String(selectedProjectId));

  // Checkbox handlers
  const handleCheckChange = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setCheckedIds(roles.map((r) => r.id));
    } else {
      setCheckedIds([]);
    }
  };

  // Add or edit save handler
  const handleSaveRole = async ({ id, name }) => {
    try {
      if (id) {
        // Edit role
        await ejecutarMetodo('Hojas de Tiempo', 'Roles', 'updateRole', { roleId: id, name });
      } else {
        // Create role
        await ejecutarMetodo('Hojas de Tiempo', 'Roles', 'insertRole', { projectId: selectedProjectId, name });
      }
      setIsRolModalOpen(false);
      fetchRolesData();
    } catch (err) {
      alert(err.message || 'Error al guardar el rol.');
    }
  };

  // Bulk delete roles
  const handleDeleteConfirm = async () => {
    try {
      if (checkedIds.length > 0) {
        await ejecutarMetodo('Hojas de Tiempo', 'Roles', 'deleteRoles', { roleIds: checkedIds });
        setIsDeleteConfirmOpen(false);
        setCheckedIds([]);
        fetchRolesData();
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar roles.');
    }
  };

  if (loading) {
    return <div className="roles-loading">Cargando roles...</div>;
  }

  return (
    <div className="roles-tab-container">
      {/* Project Selector dropdown */}
      <div className="project-dropdown-toolbar">
        <label htmlFor="project-select" className="project-select-label">Proyecto:</label>
        <div className="project-select-wrapper">
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="project-select-control"
          >
            <option value="" disabled={projects.length > 0}>Your project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {selectedProjectId ? (
        <div className="roles-table-card">
          {/* Header */}
          <div className="roles-table-header">
            <div className="header-left">
              <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="project-title">{activeProject?.name || 'Cargando...'}</span>
              <span className="count-badge">{roles.length} {roles.length === 1 ? 'rol' : 'roles'}</span>
            </div>
            <div className="header-right">
              <button
                type="button"
                className="toolbar-add-btn"
                onClick={() => {
                  setSelectedRole(null);
                  setIsRolModalOpen(true);
                }}
              >
                +
              </button>
              <button
                type="button"
                className={`toolbar-delete-btn ${checkedIds.length === 0 ? 'disabled' : ''}`}
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={checkedIds.length === 0}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table container */}
          <div className="roles-table-container">
            <table className="roles-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={roles.length > 0 && checkedIds.length === roles.length}
                      onChange={handleCheckAll}
                      className="checkbox-control"
                    />
                  </th>
                  <th>NOMBRE DEL ROL</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((r, index) => (
                    <tr key={r.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={checkedIds.includes(r.id)}
                          onChange={() => handleCheckChange(r.id)}
                          className="checkbox-control"
                        />
                      </td>
                      <td>
                        <span className={`role-name-tag ${index % 2 !== 0 ? 'purple' : ''}`}>
                          {r.name}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <EditButton
                          onClick={() => {
                            setSelectedRole(r);
                            setIsRolModalOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="table-placeholder">
                      No se han registrado roles para este proyecto. Pulsa "+" para agregar uno.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="project-selection-placeholder">
          <svg className="placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3>Selecciona un proyecto</h3>
          <p>para ver y gestionar sus roles</p>
        </div>
      )}

      {/* Add / Edit Rol Modal */}
      {isRolModalOpen && (
        <RolModal
          isOpen={isRolModalOpen}
          onClose={() => setIsRolModalOpen(false)}
          onSave={handleSaveRole}
          role={selectedRole}
        />
      )}

      {/* Confirm Bulk Deletion Modal */}
      {isDeleteConfirmOpen && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Eliminar roles"
          icon="trash"
          tone="danger"
        >
          <div className="proyecto-form">
            <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1.5rem', textAlign: 'center' }}>
              ¿Eliminar <strong>{checkedIds.length}</strong> {checkedIds.length === 1 ? 'rol' : 'roles'}? Esta acción no se puede deshacer.
            </p>
            <div className="proyecto-modal-actions">
              <button
                type="button"
                className="proyecto-btn-cancel"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="proyecto-btn-submit btn-red"
                onClick={handleDeleteConfirm}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default RolesTab;
