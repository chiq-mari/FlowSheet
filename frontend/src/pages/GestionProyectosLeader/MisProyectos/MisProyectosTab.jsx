import React, { useState, useEffect } from 'react';
import ProyectoCard from './ProyectoCard';
import ProyectoModal from './ProyectoModal';
import Modal from '../../../componentes/ui/Modal';
import { ejecutarMetodo } from '../../../services/toProcess';
import './MisProyectosTab.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function MisProyectosTab() {
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProyect, setSelectedProyect] = useState(null);
  
  // Delete confirm state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Load initial data (projects and statuses)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Fetch statuses for dropdown via standard catalog API
      const statusRes = await fetch(`${API_URL}/api/dashboard/statuses`, { credentials: 'include' });
      const statusData = await statusRes.json();
      const statusList = statusData.success ? statusData.statuses : [];
      setStatuses(statusList);

      // Fetch projects
      const projectList = await ejecutarMetodo('Hojas de Tiempo', 'Proyecto', 'getAllForLeader', { search });
      setProjects(projectList || []);
    } catch (err) {
      console.error('Error cargando datos de proyectos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reload projects list on search or update
  const fetchProjects = async () => {
    try {
      const projectList = await ejecutarMetodo('Hojas de Tiempo', 'Proyecto', 'getAllForLeader', { search });
      setProjects(projectList || []);
    } catch (err) {
      console.error('Error al filtrar proyectos:', err.message);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch projects when search term updates (with debounce or directly)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Handle save (Create / Edit)
  const handleSave = async ({ id, name, statusId }) => {
    try {
      if (id) {
        // Edit project
        await ejecutarMetodo('Hojas de Tiempo', 'Proyecto', 'updateProyect', { projectId: id, name, statusId });
      } else {
        // Create project
        await ejecutarMetodo('Hojas de Tiempo', 'Proyecto', 'insertProyect', { name, statusId });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Error al guardar el proyecto.');
    }
  };

  // Trigger create modal
  const handleCreateTrigger = () => {
    setSelectedProyect(null);
    setIsModalOpen(true);
  };

  // Trigger edit modal
  const handleEditTrigger = (proyect) => {
    setSelectedProyect(proyect);
    setIsModalOpen(true);
  };

  // Trigger delete confirmation modal
  const handleDeleteTrigger = (id, name) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setIsDeleteConfirmOpen(true);
  };

  // Confirm delete project
  const handleDeleteConfirm = async () => {
    try {
      if (deleteTargetId) {
        await ejecutarMetodo('Hojas de Tiempo', 'Proyecto', 'deleteProyect', { projectId: deleteTargetId });
        setIsDeleteConfirmOpen(false);
        setDeleteTargetId(null);
        setDeleteTargetName('');
        fetchProjects();
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar el proyecto.');
    }
  };

  return (
    <div className="mis-proyectos-tab-container">
      {/* Barra de Filtros y Buscador */}
      <div className="mis-proyectos-toolbar">
        <div className="search-bar-container">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Buscar proyecto..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          className="btn-add-project"
          onClick={handleCreateTrigger}
          title="Nuevo Proyecto"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Listado de Tarjetas */}
      {loading ? (
        <div className="loading-projects">Cargando tus proyectos...</div>
      ) : projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((proyect) => (
            <ProyectoCard 
              key={proyect.id} 
              proyect={proyect} 
              onEdit={handleEditTrigger}
              onDelete={handleDeleteTrigger}
            />
          ))}
        </div>
      ) : (
        <div className="no-projects-placeholder">
          <svg className="no-projects-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>No se encontraron proyectos activos.</p>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <ProyectoModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          proyect={selectedProyect}
          statuses={statuses}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      {isDeleteConfirmOpen && (
        <Modal 
          onClose={() => setIsDeleteConfirmOpen(false)} 
          title="Eliminar Proyecto"
          icon="trash"
          tone="danger"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
              ¿Eliminar el proyecto <strong>"{deleteTargetName}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="persona-modal-actions">
              <button 
                type="button" 
                className="persona-btn-cancel" 
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="persona-btn-submit" 
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
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

export default MisProyectosTab;
