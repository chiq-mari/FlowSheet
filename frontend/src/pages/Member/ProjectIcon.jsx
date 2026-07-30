// src/pages/Member/ProjectIcon.jsx
import { getProjectVisual, PROJECT_ICON_PATHS } from './projectVisuals';

export function ProjectIcon({ proyectId, size = 40 }) {
  const visual = getProjectVisual(proyectId);
  const path = PROJECT_ICON_PATHS[visual.icon];

  return (
    <div
      className="project-icon-square"
      style={{ width: size, height: size, backgroundColor: visual.bg, color: visual.color }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </div>
  );
}
