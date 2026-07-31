// src/pages/Member/chatVisuals.js

// Paleta de color por remitente (avatares en los mensajes de chat). Determinística por user_id,
// así cada persona siempre se ve con el mismo color entre recargas.
const USER_COLOR_PALETTE = [
  { bg: '#dbeafe', color: '#1d4ed8' }, // azul
  { bg: '#ede9fe', color: '#6d28d9' }, // púrpura
  { bg: '#ffedd5', color: '#c2410c' }, // naranja
  { bg: '#dcfce7', color: '#15803d' }, // verde
  { bg: '#fce7f3', color: '#be185d' }, // rosa
  { bg: '#cffafe', color: '#0e7490' }, // cian
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getUserColor(userId) {
  const idx = hashString(userId || '') % USER_COLOR_PALETTE.length;
  return USER_COLOR_PALETTE[idx];
}

export function getInitials(personNa, personLn) {
  const first = (personNa || '?').trim().charAt(0);
  const last = (personLn || '').trim().charAt(0);
  return `${first}${last}`.toUpperCase() || '?';
}

// Hora corta para burbujas de chat: "09:02"
export function formatChatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d) ? '' : d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Preview de último mensaje en la lista de chats: recorta y antepone "Tú:" si aplica
export function formatLastMessagePreview(text, isOwn, personNa, max = 32) {
  if (!text) return 'Sin mensajes todavía';
  const prefix = isOwn ? 'Tú: ' : personNa ? `${personNa}: ` : '';
  const truncated = text.length > max ? `${text.slice(0, max)}...` : text;
  return `${prefix}${truncated}`;
}
