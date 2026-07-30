// src/componentes/NotificationFilters.jsx
import React from 'react';
import './NotificationFilters.css';

export function NotificationFilters({ 
  projects = [], 
  filters, 
  onChangeFilters 
}) {
  const handleInputChange = (field, value) => {
    onChangeFilters({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="filters-card">
      <div className="filters-header">
        <div className="filters-title-container">
          <div className="filters-icon-box">
            <svg className="filters-bell-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3>Mis Notificaciones</h3>
        </div>
      </div>
      
      <div className="filters-body">
        <div className="filter-group">
          <label className="filter-label">FECHA INICIO</label>
          <input 
            type="date" 
            value={filters.fechaInicio} 
            onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
            className="filter-input date-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">FECHA FIN</label>
          <input 
            type="date" 
            value={filters.fechaFin} 
            onChange={(e) => handleInputChange('fechaFin', e.target.value)}
            className="filter-input date-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">PROYECTO</label>
          <select 
            value={filters.proyectoId} 
            onChange={(e) => handleInputChange('proyectoId', e.target.value)}
            className="filter-input select-input"
          >
            <option value="">Todos los proyectos</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default NotificationFilters;
