// src/componentes/InfoPill.jsx
import './InfoPill.css';

/**
 * Chip pequeño con ícono + texto, usado para metadatos cortos (ej. "3 act. asignadas", rol).
 * @param {React.ReactNode} icon - SVG del ícono
 * @param {string} text - Texto del chip
 * @param {'blue'|'purple'} variant - Paleta de color
 */
export function InfoPill({ icon, text, variant = 'blue' }) {
  return (
    <span className={`info-pill info-pill--${variant}`}>
      {icon}
      <span>{text}</span>
    </span>
  );
}
