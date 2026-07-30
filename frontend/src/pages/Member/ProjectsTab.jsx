// src/pages/Member/ProjectsTab.jsx
import { useMemo, useState } from 'react';
import { StatusBadge } from '../../componentes/StatusBadge';
import { InfoPill } from '../../componentes/InfoPill';
import { ProjectIcon } from './ProjectIcon';
import { mapStatusLabel } from './projectVisuals';

const ACTIVITY_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ROLE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

/**
 * Pestaña "Proyectos": lista de proyectos del miembro, agrupados desde /api/member/assignments,
 * con búsqueda por nombre y filtro por estado.
 */
const ProjectsTab = ({ assignments, onOpenProyect }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Agrupamos las actividades por proyecto para obtener 1 tarjeta por proyecto
  const projects = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      if (!map.has(a.proyect_id)) {
        map.set(a.proyect_id, {
          proyect_id: a.proyect_id,
          proyect_name: a.proyect_name,
          proyect_status: a.proyect_status,
          proyect_role_name: a.proyect_role_name,
          activityCount: 0,
        });
      }
      map.get(a.proyect_id).activityCount += 1;
    });
    return Array.from(map.values());
  }, [assignments]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.proyect_name.toLowerCase().includes(search.toLowerCase());
    const label = mapStatusLabel(p.proyect_status);
    const matchesStatus = statusFilter === 'Todos' || label === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="projects-tab">
      <div className="projects-tab-filters">
        <div className="projects-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="projects-status-filters">
          {['Todos', 'En Progreso', 'Finalizado'].map((opt) => (
            <button
              key={opt}
              className={`projects-status-btn ${statusFilter === opt ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="member-empty-text projects-empty">No hay proyectos que coincidan con estos filtros.</p>
      ) : (
        <div className="projects-list">
          {filteredProjects.map((p) => (
            <button key={p.proyect_id} className="project-row" onClick={() => onOpenProyect(p.proyect_id)}>
              <ProjectIcon proyectId={p.proyect_id} size={44} />
              <div className="project-row-main">
                <span className="project-row-name">{p.proyect_name}</span>
                <div className="project-row-pills">
                  <InfoPill icon={ACTIVITY_ICON} text={`${p.activityCount} act. asignadas`} variant="blue" />
                  <InfoPill icon={ROLE_ICON} text={p.proyect_role_name} variant="purple" />
                </div>
              </div>
              <StatusBadge status={mapStatusLabel(p.proyect_status)} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
