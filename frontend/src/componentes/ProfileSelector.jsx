// src/componentes/ProfileSelector.jsx
import logo from '../assets/flowsheet_logo.png';
import { UserAvatar } from './UserAvatar';
import './ProfileSelector.css';

export function ProfileSelector({ user, onSelectProfile, onLogout, loading, errorMsg }) {
  // 1. Construcción del nombre completo con nombre y apellido (user_na y user_la)
  const firstName = user?.person_na || '';
  const lastName = user?.person_ln || '';

  const fullName = `${firstName} ${lastName}`.trim() || 'Usuario';

  const getProfileIcon = (profileName = '') => {
      const nameLower = profileName.toLowerCase();

      // 🛡️ ADMINISTRADOR: Escudo de seguridad
      if (nameLower.includes('admin') || nameLower.includes('administrador')) {
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        );
      }

      // 👑 LÍDER: Corona / Estrella o Usuario con insignia
      if (nameLower.includes('lider') || nameLower.includes('líder')) {
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l3 12h14l3-12-6 7-4-5-4 5-6-7z"/>
            <path d="M4 19h16"/>
          </svg>
        );
      }

      // 👤 MIEMBRO / USUARIO: Tarjeta / Usuario individual
      if (nameLower.includes('miembro')) {
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      }

        // Ícono por defecto (Maletín) en caso de que exista algún otro perfil futuro
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      );
    }

  return (
    <div className="profile-selector-container">
      {/* Header fuera de la tarjeta: Únicamente el logo oficial de FlowSheet */}
      <div className="selector-header">
        <img src={logo} alt="FlowSheet Logo" className="selector-logo" />
      </div>

      {/* Tarjeta Principal */}
      <div className="selector-card">
        {/* Sección Superior Oscura */}
        {/* Sección Superior Oscura */}
        <div className="card-top-bar">
          <UserAvatar name={fullName} size={48} />
          <div className="user-info">
            <h3 className="user-fullname">
              <span className="welcome-prefix">¡Bienvenido, </span>
              {fullName}!
            </h3>
            <p>Selecciona el perfil con el que deseas ingresar</p>
          </div>
        </div>

        {/* Sección Inferior Blanca con Tarjetas de Perfil */}
        <div className="card-body">
          {errorMsg && <div className="error-badge">{errorMsg}</div>}

          <div className="profiles-grid">
            {user?.user_profiles?.map((profile) => (
              <button
                key={profile.profile_id}
                className="profile-card-item"
                onClick={() => onSelectProfile(profile)}
                disabled={loading}
              >
                <div className="profile-icon-box">
                  {getProfileIcon(profile.profile_de)}
                </div>
                <div className="profile-text-box">
                  <span className="profile-title">{profile.profile_de}</span>
                </div>
                <div className="profile-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <button onClick={onLogout} className="change-user-link" disabled={loading}>
            ← Cambiar de usuario
          </button>
        </div>
      </div>

      {/* Footer y Botón de Ayuda */}
      <footer className="selector-footer">
        FlowSheet v1.0 — Sistema de Control de Hojas de Tiempo
      </footer>
      <button className="help-button" title="Ayuda">?</button>
    </div>
  );
}