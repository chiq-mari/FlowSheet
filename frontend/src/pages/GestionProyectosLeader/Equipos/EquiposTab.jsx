import React, { useState, useEffect } from 'react';
import { ejecutarMetodo } from '../../../services/toProcess';
import EquiposTable from './EquiposTable';
import MiembroModal from './MiembroModal';
import Modal from '../../../componentes/ui/Modal';
import './EquiposTab.css';

export function EquiposTab() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checked members IDs for bulk delete
  const [checkedIds, setCheckedIds] = useState([]);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
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
        console.error('Error al inicializar la pestaña de equipos:', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch project team members, roles, and available system users
  const fetchTeamData = async () => {
    if (!selectedProjectId) return;
    try {
      const [membersRes, usersRes, rolesRes] = await Promise.all([
        ejecutarMetodo('Hojas de Tiempo', 'Equipos', 'getAllForProject', { projectId: selectedProjectId }),
        ejecutarMetodo('Hojas de Tiempo', 'Equipos', 'getAvailableUsers', { projectId: selectedProjectId }),
        ejecutarMetodo('Hojas de Tiempo', 'Roles', 'getAllForProject', { projectId: selectedProjectId })
      ]);
      setMembers(membersRes.members || []);
      setAvailableUsers(usersRes.users || []);
      setRoles(rolesRes.roles || []);
      setCheckedIds([]);
    } catch (err) {
      console.error('Error al cargar datos del equipo:', err.message);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [selectedProjectId]);

  const activeProject = projects.find((p) => String(p.id) === String(selectedProjectId));

  // Checkbox selection handlers
  const handleCheckChange = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const handleCheckAll = (checked) => {
    if (checked) {
      setCheckedIds(members.map((m) => m.proyect_role_user_id));
    } else {
      setCheckedIds([]);
    }
  };

  // Add / edit save handler
  const handleSaveMember = async ({ id, userId, proyectRoleId }) => {
    try {
      if (id) {
        // Edit role of existing member
        await ejecutarMetodo('Hojas de Tiempo', 'Equipos', 'updateMember', {
          proyectRoleUserId: id,
          proyectRoleId
        });
      } else {
        // Add new member to project
        await ejecutarMetodo('Hojas de Tiempo', 'Equipos', 'insertMember', {
          proyectRoleId,
          userId
        });
      }
      setIsMemberModalOpen(false);
      fetchTeamData();
    } catch (err) {
      alert(err.message || 'Error al guardar el integrante.');
    }
  };

  // Delete team members handler
  const handleDeleteConfirm = async () => {
    try {
      if (checkedIds.length > 0) {
        await ejecutarMetodo('Hojas de Tiempo', 'Equipos', 'deleteMembers', { memberIds: checkedIds });
        setIsDeleteConfirmOpen(false);
        setCheckedIds([]);
        fetchTeamData();
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar integrantes.');
    }
  };

  if (loading) {
    return <div className="equipos-loading">Cargando equipos de trabajo...</div>;
  }

  return (
    <div className="equipos-tab-container">
      {/* Top Toolbar */}
      <div className="equipos-top-toolbar">
        <div className="toolbar-left-select">
          <label htmlFor="project-select" className="project-select-label">Proyecto:</label>
          <div className="project-select-wrapper" style={{ width: '260px' }}>
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

        {selectedProjectId && (
          <div className="toolbar-actions">
            <button
              type="button"
              className="toolbar-add-member-btn"
              onClick={() => {
                setSelectedMember(null);
                setIsMemberModalOpen(true);
              }}
            >
              + Add Member
            </button>
            <button
              type="button"
              className={`toolbar-delete-member-btn ${checkedIds.length === 0 ? 'disabled' : ''}`}
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={checkedIds.length === 0}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.2rem' }}>
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete Member
            </button>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      {selectedProjectId ? (
        <div className="equipos-table-card">
          {/* Header info */}
          <div className="equipos-table-header">
            <div className="header-left">
              <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="project-title" style={{ color: '#d97706' }}>
                {activeProject?.name || 'Cargando...'}
              </span>
              <span className="count-badge">
                {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
              </span>
            </div>
          </div>

          {/* Granular Table grid */}
          <EquiposTable
            members={members}
            checkedIds={checkedIds}
            onCheckChange={handleCheckChange}
            onCheckAll={handleCheckAll}
            onEditClick={(member) => {
              setSelectedMember(member);
              setIsMemberModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="project-selection-placeholder">
          <svg className="placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3>Selecciona un proyecto</h3>
          <p>para ver y gestionar su equipo de trabajo</p>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isMemberModalOpen && (
        <MiembroModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onSave={handleSaveMember}
          member={selectedMember}
          availableUsers={availableUsers}
          roles={roles}
        />
      )}

      {/* Confirm Bulk Deletion Modal */}
      {isDeleteConfirmOpen && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Eliminar miembros"
          icon="trash"
          tone="danger"
        >
          <div className="proyecto-form">
            <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1.5rem', textAlign: 'center' }}>
              ¿Eliminar <strong>{checkedIds.length}</strong> {checkedIds.length === 1 ? 'miembro' : 'miembros'} del equipo? Esta acción no se puede deshacer.
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

export default EquiposTab;
