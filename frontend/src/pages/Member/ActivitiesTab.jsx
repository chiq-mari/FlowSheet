// src/pages/Member/ActivitiesTab.jsx
import { useEffect, useMemo, useState } from 'react';
import { ProgressBar } from '../../componentes/ProgressBar';
import { InfoPill } from '../../componentes/InfoPill';
import { NotificationFormModal } from '../../componentes/NotificationFormModal';
import { ProjectIcon } from './ProjectIcon';
import { getProjectVisual } from './projectVisuals';

const ASSIGNED_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const COMPLETED_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BELL_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

/**
 * Pestaña "Actividades": selector de proyecto + stats + tabla de actividades de ese proyecto,
 * con botón (campana) para abrir el modal de registrar avance.
 */
const ActivitiesTab = ({ assignments, selectedProyectId, onSelectProyect, onAssignmentsRefresh }) => {
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [toast, setToast] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Lista de proyectos únicos disponibles para el selector
  const projectOptions = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      if (!map.has(a.proyect_id)) {
        map.set(a.proyect_id, { proyect_id: a.proyect_id, proyect_name: a.proyect_name });
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  // Si no hay proyecto seleccionado (primera vez que se entra a esta pestaña), tomamos el primero
  useEffect(() => {
    if (!selectedProyectId && projectOptions.length > 0) {
      onSelectProyect(projectOptions[0].proyect_id);
    }
  }, [selectedProyectId, projectOptions, onSelectProyect]);

  const currentProyect = projectOptions.find((p) => p.proyect_id === selectedProyectId);
  const proyectActivities = assignments.filter((a) => a.proyect_id === selectedProyectId);

  const assignedCount = proyectActivities.length;
  const completedCount = proyectActivities.filter((a) => Number(a.last_progress) >= 100).length;

  const visual = selectedProyectId ? getProjectVisual(selectedProyectId) : null;

  const handleSaved = () => {
    setActiveAssignment(null);
    setToast('Avance registrado correctamente.');
    onAssignmentsRefresh();
    setTimeout(() => setToast(''), 3000);
  };

  if (projectOptions.length === 0) {
    return <p className="member-empty-text">No tienes proyectos ni actividades asignadas todavía.</p>;
  }

  return (
    <div className="activities-tab">
      {toast && <div className="member-success-badge">{toast}</div>}

      <div className="activities-proyect-select">
        <button className="activities-select-btn" onClick={() => setDropdownOpen((o) => !o)}>
          <span>{currentProyect?.proyect_name}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="activities-select-dropdown">
            {projectOptions.map((p) => (
              <button
                key={p.proyect_id}
                className={`activities-select-option ${p.proyect_id === selectedProyectId ? 'active' : ''}`}
                onClick={() => {
                  onSelectProyect(p.proyect_id);
                  setDropdownOpen(false);
                }}
              >
                {p.proyect_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="activities-stats-row">
        <div className="activities-stat-card activities-stat-card--blue">
          <div>
            <span className="activities-stat-label">Actividades Asignadas</span>
            <span className="activities-stat-value">{assignedCount}</span>
            <span className="activities-stat-sub">en este proyecto</span>
          </div>
          <div className="activities-stat-icon activities-stat-icon--blue">{ASSIGNED_ICON}</div>
        </div>

        <div className="activities-stat-card activities-stat-card--green">
          <div>
            <span className="activities-stat-label">Actividades Completadas</span>
            <span className="activities-stat-value">{completedCount}</span>
            <span className="activities-stat-sub">al 100%</span>
          </div>
          <div className="activities-stat-icon activities-stat-icon--green">{COMPLETED_ICON}</div>
        </div>
      </div>

      <div className="activities-table-card" style={visual ? { borderColor: visual.bg } : undefined}>
        <div className="activities-table-header" style={visual ? { backgroundColor: visual.bg } : undefined}>
          <ProjectIcon proyectId={selectedProyectId} size={28} />
          <span className="activities-table-title" style={visual ? { color: visual.color } : undefined}>
            {currentProyect?.proyect_name}
          </span>
          <InfoPill icon={ASSIGNED_ICON} text={`${assignedCount} asignadas a mí`} variant="blue" />
        </div>

        <div className="activities-table-columns">
          <span>ACTIVIDAD</span>
          <span>% COMPLETADO</span>
        </div>

        {proyectActivities.map((a) => (
          <div key={a.user_assignment_id} className="activities-table-row">
            <span className="activities-table-activity-name">{a.assignment_name}</span>
            <div className="activities-table-progress">
              <ProgressBar percentage={a.last_progress} hours={a.total_hours_logged} />
              <button
                className="activities-bell-btn"
                title="Registrar avance"
                onClick={() => setActiveAssignment(a)}
              >
                {BELL_ICON}
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeAssignment && (
        <NotificationFormModal
          assignment={activeAssignment}
          onClose={() => setActiveAssignment(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default ActivitiesTab;
