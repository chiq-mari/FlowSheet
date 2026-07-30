// src/pages/Member/projectVisuals.js

// Paleta de proyectos: bg claro + color de acento + ícono. Se asigna de forma determinística
// según el proyect_id, así el mismo proyecto siempre se ve igual entre recargas.
const PALETTE = [
  { bg: '#eff6ff', color: '#2563eb', icon: 'chart' },
  { bg: '#f5f3ff', color: '#7c3aed', icon: 'building' },
  { bg: '#ecfdf5', color: '#0d9488', icon: 'pencil' },
  { bg: '#fdf2f8', color: '#db2777', icon: 'building' },
  { bg: '#fff7ed', color: '#c2410c', icon: 'chart' },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProjectVisual(proyectId) {
  const idx = hashString(proyectId || '') % PALETTE.length;
  return PALETTE[idx];
}

// Rutas SVG (mismo estilo stroke=currentColor usado en Sidebar.jsx)
export const PROJECT_ICON_PATHS = {
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  building: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  pencil: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
};

// Mapea el status_de real de la BD ('En desarrollo' / 'Completado') a la etiqueta visual del mockup
export function mapStatusLabel(statusDe) {
  const normalized = (statusDe || '').toLowerCase();
  if (normalized.includes('complet')) return 'Finalizado';
  if (normalized.includes('desarrollo')) return 'En Progreso';
  return statusDe || 'Sin estado';
}

// Etiqueta de estado POR REGISTRO de notificación, según su % de avance (usado en "Mis Reportes").
// Es un concepto distinto al estado del proyecto/actividad: aquí cada notificación individual
// se clasifica como Iniciado (<50%), En Progreso (50-99%) o Completado (100%).
export function getReportStateLabel(percentage) {
  const p = Number(percentage) || 0;
  if (p >= 100) return 'Completado';
  if (p >= 50) return 'En Progreso';
  return 'Iniciado';
}

// Formato corto en español para las filas del reporte: "jue, 12 jun 2025 · 14:40"
export function formatReportDateTime(dateValue, timeValue) {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  const dateStr = isNaN(d)
    ? dateValue
    : d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = timeValue ? String(timeValue).slice(0, 5) : '';
  return timeStr ? `${dateStr} · ${timeStr}` : dateStr;
}
