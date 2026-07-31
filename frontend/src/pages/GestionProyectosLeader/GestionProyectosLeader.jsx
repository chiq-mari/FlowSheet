import React, { useState } from 'react';
import MisProyectosTab from './MisProyectos/MisProyectosTab';
import ActividadesTab from './Actividades/ActividadesTab';
import RolesTab from './Roles/RolesTab';
import EquiposTab from './Equipos/EquiposTab';
import './GestionProyectosLeader.css';

export function GestionProyectosLeader({ user, activeProfile }) {
  const tabs = [
    { id: 'proyectos', label: 'Mis Proyectos' },
    { id: 'actividades', label: 'Actividades' },
    { id: 'equipos', label: 'Equipos de Trabajo' },
    { id: 'roles', label: 'Roles' }
  ];

  const [activeTab, setActiveTab] = useState('proyectos');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'proyectos':
        return <MisProyectosTab user={user} activeProfile={activeProfile} />;
      case 'actividades':
        return <ActividadesTab user={user} activeProfile={activeProfile} />;
      case 'equipos':
        return <EquiposTab user={user} activeProfile={activeProfile} />;
      case 'roles':
        return <RolesTab user={user} activeProfile={activeProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="gestion-proyectos-container">
      {/* Cabecera Principal */}
      <div className="gestion-proyectos-header">
        <svg 
          className="gestion-proyectos-header-icon" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
          />
        </svg>
        <h2>Gestión de Proyectos</h2>
      </div>

      {/* Tarjeta de Navegación de Pestañas */}
      <div className="gestion-proyectos-tabs-card">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`gestion-proyectos-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="tab-content-area">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default GestionProyectosLeader;
