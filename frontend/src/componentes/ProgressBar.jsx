// src/componentes/ProgressBar.jsx
import './ProgressBar.css';

/**
 * Barra de progreso reutilizable para reflejar el % de avance de una actividad.
 * El color se adapta automáticamente al rango de avance (bajo/medio/completado).
 * @param {number} value - Porcentaje entre 0 y 100
 * @param {boolean} hideLabel - Si es true, no renderiza el texto "% completado" debajo
 *   (útil cuando el % ya se muestra en otro lugar de la fila, ej. el Dashboard)
 */
export function ProgressBar({ value = 0, hideLabel = false }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const tier = safeValue >= 100 ? 'complete' : safeValue >= 50 ? 'mid' : 'low';

  return (
    <div className="progress-bar-wrapper">
      <div className={`progress-bar-track progress-bar-track--${tier}`} title={`${safeValue}% completado`}>
        <div className="progress-bar-fill" style={{ width: `${safeValue}%` }} />
      </div>
      {!hideLabel && <span className={`progress-bar-label progress-bar-label--${tier}`}>{safeValue}% completado</span>}
    </div>
  );
}
