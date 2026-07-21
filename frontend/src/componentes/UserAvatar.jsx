// src/componentes/UserAvatar.jsx
import './UserAvatar.css';

/**
 * Componente reutilizable para mostrar el círculo de avatar con las iniciales del usuario.
 * @param {string} name - Nombre completo o usuario para extraer las iniciales
 * @param {number} size - Tamaño en píxeles (por defecto 48px)
 * @param {string} className - Clases CSS adicionales opcionales
 */
export function UserAvatar({ name, size = 48, className = '' }) {
  const getInitials = (str) => {
    if (!str) return 'US';
    const words = str.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div
      className={`user-avatar-circle ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.4}px` }}
      title={name}
    >
      {initials}
    </div>
  );
}
