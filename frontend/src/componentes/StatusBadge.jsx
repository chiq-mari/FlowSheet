// src/componentes/StatusBadge.jsx
import './StatusBadge.css';

/**
 * Pastilla de estado reutilizable para reflejar el status_de de proyectos y actividades.
 * @param {string} status - Texto del estado (ej. 'Completado', 'En desarrollo')
 */
export function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  const variant = normalized.includes('complet') || normalized.includes('final')
    ? 'success'
    : normalized.includes('inici') || normalized.includes('pendient')
      ? 'warning'
      : normalized.includes('desarrollo') || normalized.includes('progreso')
        ? 'info'
        : 'neutral';

  return <span className={`status-badge status-badge--${variant}`}>{status || 'Sin estado'}</span>;
}
