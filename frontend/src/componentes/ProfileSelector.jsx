// src/componentes/ProfileSelector.jsx
import logo from '../assets/flowsheet_logo.png';
import { UserAvatar } from './UserAvatar';
import './ProfileSelector.css';

export function ProfileSelector({ user, onSelectProfile, onLogout, loading, errorMsg }) {
  const userName = user?.person_na || user?.user_na || 'Usuario';

  // Ícono según el perfil devuelto por la base de datos
  const getProfileIcon = (profileName = '') => {
    const nameLower = profileName.toLowerCase();
    if (nameLower.includes('admin')) {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      );
    }
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    );
  };

  return (
    <div className="profile-selector-container">
      {/* Header fuera de la tarjeta: Únicamente el logo oficial de FlowSheet */}
      <div className="selector-header">
        <img src={logo} alt="FlowSheet Logo" className="selector-logo" />
      </div>

      {/* Tarjeta Principal */}
      <div className="selector-card">
        {/* Sección Superior Oscura */}
        <div className="card-top-bar">
          <UserAvatar name={userName} size={48} />
          <div className="user-info">
            <h3>{userName}</h3>
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