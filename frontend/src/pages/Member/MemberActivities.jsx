// src/pages/Member/MemberActivities.jsx
import { useEffect, useState } from 'react';
import ProjectsTab from './ProjectsTab';
import ActivitiesTab from './ActivitiesTab';
import { ejecutarMetodo } from '../../services/toProcess';
import './Member.css';
import './MemberActivities.css';

const MemberActivities = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('proyectos'); // 'proyectos' | 'actividades'
  const [selectedProyectId, setSelectedProyectId] = useState(null);

  const loadAssignments = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'consultarAsignaciones');
      setAssignments(data.assignments);
    } catch (err) {
      console.error('Error al cargar actividades:', err);
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // Al hacer clic en un proyecto desde la pestaña "Proyectos", saltamos a "Actividades" con ese proyecto activo
  const handleOpenProyect = (proyectId) => {
    setSelectedProyectId(proyectId);
    setActiveTab('actividades');
  };

  return (
    <div className="member-activities">
      <div className="member-panel">
        <div className="member-panel-header">
          <span className="member-panel-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </span>
          <h2>Mis Proyectos</h2>
        </div>

        <div className="member-tabs">
          <button
            className={`member-tab ${activeTab === 'proyectos' ? 'active' : ''}`}
            onClick={() => setActiveTab('proyectos')}
          >
            Proyectos
          </button>
          <button
            className={`member-tab ${activeTab === 'actividades' ? 'active' : ''}`}
            onClick={() => setActiveTab('actividades')}
          >
            Actividades
          </button>
        </div>

        <div className="member-panel-body">
          {errorMsg && <div className="member-error-badge">{errorMsg}</div>}

          {loading ? (
            <div className="member-view-loading">Cargando tus proyectos...</div>
          ) : activeTab === 'proyectos' ? (
            <ProjectsTab assignments={assignments} onOpenProyect={handleOpenProyect} />
          ) : (
            <ActivitiesTab
              assignments={assignments}
              selectedProyectId={selectedProyectId}
              onSelectProyect={setSelectedProyectId}
              onAssignmentsRefresh={loadAssignments}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberActivities;
