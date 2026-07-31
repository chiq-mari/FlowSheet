import React, { useState, useEffect } from 'react';
import { ejecutarMetodo } from '../../../services/toProcess';
import ActividadModal from './ActividadModal';
import AsignarEncargadoModal from './AsignarEncargadoModal';
import SeleccionarResponsableModal from './SeleccionarResponsableModal';
import EliminarAsignadoConfirmModal from './EliminarAsignadoConfirmModal';
import Modal from '../../../componentes/ui/Modal';
import EditButton from '../../../componentes/ui/EditButton';
import './ActividadesTab.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function ActividadesTab() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activities, setActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checked activities for bulk delete
  const [checkedIds, setCheckedIds] = useState([]);

  // Modals state
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Assignee sub-modals state
  const [isAddResponsableOpen, setIsAddResponsableOpen] = useState(false);
  const [isRemoveResponsableOpen, setIsRemoveResponsableOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  // Responsables section filters
  const [filterActivityId, setFilterActivityId] = useState('ALL');
  const [filterUserId, setFilterUserId] = useState('ALL');

  // Load initial data (projects and statuses)
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Fetch statuses for activities dropdown
        const statusRes = await fetch(`${API_URL}/api/dashboard/statuses`, { credentials: 'include' });
        const statusData = await statusRes.json();
        setStatuses(statusData.success ? statusData.statuses : []);

        // Fetch leader projects
        const projectList = await ejecutarMetodo('Hojas de Tiempo', 'Proyecto', 'getAllForLeader');
        setProjects(projectList || []);
        if (projectList && projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        }
      } catch (err) {
        console.error('Error al inicializar la pestaña de actividades:', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Reload project activities when selected project changes
  const fetchProjectData = async () => {
    if (!selectedProjectId) return;
    try {
      // 1. Fetch activities and assignments
      const res = await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'getAllForProject', { projectId: selectedProjectId });
      setActivities(res.activities || []);
      setAssignments(res.assignments || []);
      setCheckedIds([]);

      // 2. Fetch project team members for assignment
      const teamRes = await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'getTeamMembers', { projectId: selectedProjectId });
      setTeamMembers(teamRes.members || []);
    } catch (err) {
      console.error('Error al cargar datos del proyecto:', err.message);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [selectedProjectId]);

  // Selected project object
  const activeProject = projects.find((p) => String(p.id) === String(selectedProjectId));

  // Handle checked status changes
  const handleCheckChange = (id) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setCheckedIds(activities.map((a) => a.id));
    } else {
      setCheckedIds([]);
    }
  };

  // Activity Save (Create / Edit)
  const handleSaveActivity = async ({ id, name, statusId }) => {
    try {
      if (id) {
        // Edit activity
        await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'updateActivity', { activityId: id, name, statusId, projectId: selectedProjectId });
      } else {
        // Create activity
        await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'insertActivity', { projectId: selectedProjectId, name, statusId });
      }
      setIsActModalOpen(false);
      fetchProjectData();
    } catch (err) {
      alert(err.message || 'Error al guardar la actividad.');
    }
  };

  // Bulk delete activities
  const handleDeleteConfirm = async () => {
    try {
      if (checkedIds.length > 0) {
        await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'deleteActivities', { activityIds: checkedIds, projectId: selectedProjectId });
        setIsDeleteConfirmOpen(false);
        setCheckedIds([]);
        fetchProjectData();
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar actividades.');
    }
  };

  // Assign user to activity
  const handleAssignMember = async (proyectRoleUserId) => {
    try {
      await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'assignMember', {
        activityId: selectedActivity.id,
        proyectRoleUserId,
        projectId: selectedProjectId
      });
      setIsAddResponsableOpen(false);
      fetchProjectData();
    } catch (err) {
      alert(err.message || 'Error al asignar miembro.');
      throw err;
    }
  };

  // Triggers unassign operation from confirmation modal
  const handleUnassignConfirm = async () => {
    if (!selectedAssignee) return;
    try {
      await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'unassignMember', {
        userAssignmentId: selectedAssignee.user_assignment_id
      });
      setIsRemoveResponsableOpen(false);
      fetchProjectData();
    } catch (err) {
      alert(err.message || 'Error al desasignar miembro.');
    }
  };

  // Filter out any assignments associated with the project Leader (presentation layer only)
  const nonLeaderAssignments = assignments.filter(
    (a) => !a.role_name.toLowerCase().includes('lider') && !a.role_name.toLowerCase().includes('líder')
  );

  // Filter assignments list for bottom table
  const filteredAssignments = nonLeaderAssignments.filter((a) => {
    const matchesAct = filterActivityId === 'ALL' || String(a.assignment_id) === String(filterActivityId);
    const matchesUser = filterUserId === 'ALL' || String(a.user_id) === String(filterUserId);
    return matchesAct && matchesUser;
  });

  // Extract unique users from assignments for filter list
  const uniqueAssignedUsers = Array.from(
    new Map(nonLeaderAssignments.map((item) => [item.user_id, item])).values()
  );

  // Compute unassigned team members (excluding leaders and already assigned users)
  const activeAssignments = nonLeaderAssignments.filter((a) => a.assignment_id === selectedActivity?.id);
  const unassignedMembers = teamMembers.filter((m) => {
    const isLeader = m.role_name.toLowerCase().includes('lider') || m.role_name.toLowerCase().includes('líder');
    const isAlreadyAssigned = activeAssignments.some((a) => String(a.proyect_role_user_id) === String(m.proyect_role_user_id));
    return !isLeader && !isAlreadyAssigned;
  });


  if (loading) {
    return <div className="activities-loading">Cargando actividades...</div>;
  }

  return (
    <div className="activities-tab-container">
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
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="activities-metrics-grid">
        <div className="metric-card-wrapper green">
          <div className="metric-card-content">
            <span className="metric-card-label">ACTIVIDADES</span>
            <span className="metric-card-value">{activities.length}</span>
            <span className="metric-card-subtext">en este proyecto</span>
          </div>
          <div className="metric-card-icon-container green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>

        <div className="metric-card-wrapper blue">
          <div className="metric-card-content">
            <span className="metric-card-label">ASIGNACIONES</span>
            <span className="metric-card-value">{nonLeaderAssignments.length}</span>
            <span className="metric-card-subtext">responsables asignados</span>
          </div>
          <div className="metric-card-icon-container blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Activities Section Header & Table */}
      <div className="activities-table-card">
        <div className="activities-table-header">
          <div className="header-left">
            <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="project-title">{activeProject?.name || 'Cargando...'}</span>
            <span className="count-badge">{activities.length} actividades</span>
          </div>
          <div className="header-right">
            <button
              type="button"
              className="toolbar-add-btn"
              onClick={() => {
                setSelectedActivity(null);
                setIsActModalOpen(true);
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

        {/* Table Body */}
        <div className="activities-table-container">
          <table className="activities-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={activities.length > 0 && checkedIds.length === activities.length}
                    onChange={handleCheckAll}
                    className="checkbox-control"
                  />
                </th>
                <th>NOMBRE DE ACTIVIDAD</th>
                <th style={{ width: '150px', textAlign: 'center' }}>ENCARGADOS</th>
                <th style={{ width: '80px', textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((act) => (
                  <tr key={act.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={checkedIds.includes(act.id)}
                        onChange={() => handleCheckChange(act.id)}
                        className="checkbox-control"
                      />
                    </td>
                    <td>
                      <span className="activity-name-tag">{act.name}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-link-action"
                        onClick={() => {
                          setSelectedActivity(act);
                          setIsAssignModalOpen(true);
                        }}
                      >
                        Encargados →
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <EditButton
                          onClick={() => {
                            setSelectedActivity(act);
                            setIsActModalOpen(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="table-placeholder">
                    No se han registrado actividades para este proyecto. Pulsa "+" para agregar una.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsables Table section */}
      <div className="activities-table-card border-blue">
        <div className="activities-table-header bg-blue">
          <div className="header-left">
            <svg className="header-icon blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="project-title">Responsables</span>
            <span className="count-badge blue">{nonLeaderAssignments.length} asignaciones</span>
          </div>
        </div>

        {/* Filters bar */}
        <div className="responsables-filters-bar">
          <div className="filter-group">
            <label htmlFor="filter-activity">FILTRAR POR ACTIVIDAD</label>
            <select
              id="filter-activity"
              value={filterActivityId}
              onChange={(e) => setFilterActivityId(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todas las actividades</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-user">FILTRAR POR USUARIO</label>
            <select
              id="filter-user"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos los usuarios</option>
              {uniqueAssignedUsers.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Responsables Table */}
        <div className="activities-table-container">
          <table className="activities-table">
            <thead>
              <tr>
                <th>ACTIVIDAD</th>
                <th>USUARIO</th>
                <th>ROL</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((a) => (
                  <tr key={a.user_assignment_id}>
                    <td>
                      <span className="activity-name-tag">{a.assignment_name}</span>
                    </td>
                    <td>
                      <div className="user-avatar-cell">
                        <div className="user-avatar-circle">
                          {a.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="username-text">{a.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-tag ${a.role_name === 'Lider' || a.role_name === 'Líder del Proyecto' ? 'green' : 'blue'}`}>
                        {a.role_name}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="table-placeholder">
                    No se encontraron asignaciones que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity edit/create modal */}
      {isActModalOpen && (
        <ActividadModal
          isOpen={isActModalOpen}
          onClose={() => setIsActModalOpen(false)}
          onSave={handleSaveActivity}
          activity={selectedActivity}
          statuses={statuses}
        />
      )}

      {/* Assignees management modal */}
      {isAssignModalOpen && (
        <AsignarEncargadoModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          activity={selectedActivity}
          assignments={nonLeaderAssignments}
          onOpenAdd={() => setIsAddResponsableOpen(true)}
          onOpenRemove={(assignee) => {
            setSelectedAssignee(assignee);
            setIsRemoveResponsableOpen(true);
          }}
        />
      )}

      {/* Select assignee sub-modal */}
      {isAddResponsableOpen && (
        <SeleccionarResponsableModal
          isOpen={isAddResponsableOpen}
          onClose={() => setIsAddResponsableOpen(false)}
          unassignedMembers={unassignedMembers}
          onAdd={handleAssignMember}
        />
      )}

      {/* Confirm unassign modal */}
      {isRemoveResponsableOpen && (
        <EliminarAsignadoConfirmModal
          isOpen={isRemoveResponsableOpen}
          onClose={() => setIsRemoveResponsableOpen(false)}
          onConfirm={handleUnassignConfirm}
          username={selectedAssignee?.username}
        />
      )}

      {/* Delete activities bulk modal */}
      {isDeleteConfirmOpen && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Eliminar actividades"
          icon="trash"
          tone="danger"
        >
          <div className="proyecto-form">
            <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1.5rem', textAlign: 'center' }}>
              ¿Eliminar <strong>{checkedIds.length}</strong> {checkedIds.length === 1 ? 'actividad' : 'actividades'}? Esta acción no se puede deshacer.
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

export default ActividadesTab;
