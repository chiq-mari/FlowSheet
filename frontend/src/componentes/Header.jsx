import React, { useState, useRef, useEffect } from 'react';
import logo from '../assets/flowsheet_logo.png';
import { UserAvatar } from './UserAvatar';
import './Header.css';

const Header = ({ 
  user, 
  profiles = [], 
  activeProfileId, 
  onProfileChange, 
  subSystems = [], 
  activeSubSystemId, 
  onSubSystemChange,
  onLogout,
  onToggleSidebar
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [subSystemDropdownOpen, setSubSystemDropdownOpen] = useState(false);
  
  const profileDropdownRef = useRef(null);
  const subSystemDropdownRef = useRef(null);

  // Cerrar desplegables al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (subSystemDropdownRef.current && !subSystemDropdownRef.current.contains(event.target)) {
        setSubSystemDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSubSystem = subSystems.find(s => String(s.sub_system_id) === String(activeSubSystemId)) || subSystems[0];
  const activeProfile = profiles.find(p => String(p.profile_id) === String(activeProfileId)) || profiles[0];
  const userName = user?.person_na || user?.user_na || user?.name || 'Admin Líder';

  return (
    <header className="header-container">
      {/* Sección Izquierda: Menú hamburguesa, Logo (que ya contiene el texto FlowSheet) y Selector de Subsistema */}
      <div className="header-left">
        <button 
          onClick={onToggleSidebar}
          className="header-icon-btn hamburger-btn"
          title="Alternar Menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="header-brand">
          <img src={logo} alt="FlowSheet" className="header-logo" />
        </div>

        {/* Dropdown Pill de Subsistema (fiel al mockup: "Seguridad >" o "Hojas de Tiempo >") */}
        {subSystems.length > 0 && (
          <div className="subsystem-selector-container" ref={subSystemDropdownRef}>
            <button 
              onClick={() => setSubSystemDropdownOpen(!subSystemDropdownOpen)}
              className="subsystem-pill-btn"
            >
              <span>{activeSubSystem ? activeSubSystem.sub_system_de : 'Subsistema'}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${subSystemDropdownOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {subSystemDropdownOpen && (
              <div className="subsystem-dropdown-menu">
                <div className="dropdown-header">SUBSISTEMA</div>
                {subSystems.map((sub) => (
                  <button
                    key={sub.sub_system_id}
                    onClick={() => {
                      onSubSystemChange(sub.sub_system_id);
                      setSubSystemDropdownOpen(false);
                    }}
                    className={`dropdown-item ${String(sub.sub_system_id) === String(activeSubSystemId) ? 'active' : ''}`}
                  >
                    <span>{sub.sub_system_de}</span>
                    {String(sub.sub_system_id) === String(activeSubSystemId) && <span className="active-dot">•</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección Derecha: Notificaciones y Perfil de Usuario */}
      <div className="header-right">
        {/* Botón de Notificaciones */}
        <button className="header-icon-btn notification-btn" title="Notificaciones">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="notification-badge"></span>
        </button>

        {/* Dropdown de Usuario / Perfil */}
        <div className="user-profile-wrapper" ref={profileDropdownRef}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="user-profile-btn"
          >
            <UserAvatar name={userName} size={36} />
            <div className="user-info-text">
              <span className="welcome-text">Bienvenido</span>
              <span className="user-name">{userName}</span>
              <span className="user-profile-name">
                {activeProfile ? activeProfile.profile_de : 'Perfil'} ›
              </span>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">CAMBIAR PERFIL</div>
              
              <div className="profiles-list">
                {profiles.map((prof) => {
                  const isActive = String(prof.profile_id) === String(activeProfileId);
                  return (
                    <button
                      key={prof.profile_id}
                      onClick={() => {
                        onProfileChange(prof);
                        setProfileDropdownOpen(false);
                      }}
                      className={`profile-item ${isActive ? 'active' : ''}`}
                    >
                      <span className="profile-bullet">{isActive ? '•' : ''}</span>
                      <span className="profile-name-text">{prof.profile_de}</span>
                    </button>
                  );
                })}
              </div>

              <div className="dropdown-divider"></div>

              <button onClick={onLogout} className="logout-btn">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;