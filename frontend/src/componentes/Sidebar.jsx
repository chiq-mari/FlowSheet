// src/componentes/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import './Sidebar.css';

// Mapeo de íconos SVG según el nombre de la opción para reflejar exactamente los mockups
const getOptionIcon = (name) => {
  const normalized = (name || '').toLowerCase().trim();

  if (normalized.includes('dashboard')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  }
  if (normalized.includes('perfil')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  if (normalized.includes('mantenimiento')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  if (normalized.includes('permiso')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (normalized.includes('auditor')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (normalized.includes('proyecto')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    );
  }
  if (normalized.includes('reporte')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  }
  if (normalized.includes('chat')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    );
  }
  if (normalized.includes('usuario')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  if (normalized.includes('persona')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    );
  }
  if (normalized.includes('cargo')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (normalized.includes('subsistema')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (normalized.includes('opcion')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    );
  }
  if (normalized.includes('objeto')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (normalized.includes('método') || normalized.includes('metodo')) {
    return (
      <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }

  // Icono general por defecto
  return (
    <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
};

const Sidebar = ({ options = [], selectedOptionId, onSelectOption, isOpen = true }) => {
  // Estado para el menú padre actualmente abierto en modo Drilldown
  const [activeDrilldownParent, setActiveDrilldownParent] = useState(null);

  // Al cambiar el set de opciones (por ejemplo cambio de subsistema o perfil), resetear el drilldown
  useEffect(() => {
    setActiveDrilldownParent(null);
  }, [options]);

  // Separar opciones raíz (parent_option_id es null o vacio)
  const rootOptions = options.filter((opt) => !opt.parent_option_id);
  
  // Ordenar para garantizar que Dashboard quede en la cima, como en el mockup
  const sortedRootOptions = [...rootOptions].sort((a, b) => {
    const aIsDash = (a.option_de || '').toLowerCase().includes('dashboard');
    const bIsDash = (b.option_de || '').toLowerCase().includes('dashboard');
    if (aIsDash && !bIsDash) return -1;
    if (!aIsDash && bIsDash) return 1;
    return (a.option_id || 0) - (b.option_id || 0);
  });
  
  // Función para obtener los hijos directos de un padre
  const getChildren = (parentId) => options.filter((opt) => String(opt.parent_option_id) === String(parentId));

  // Manejador del clic en una opción raíz
  const handleRootClick = (option) => {
    const children = getChildren(option.option_id);
    if (children.length > 0) {
      // Entrar en modo Drilldown
      setActiveDrilldownParent(option);
    } else {
      onSelectOption(option);
    }
  };

  // Si no está abierto en móvil
  if (!isOpen) return null;

  return (
    <aside className="sidebar-container">
      <nav className="sidebar-nav">
        {/* VISTA DRILLDOWN (Sub-menú activo) */}
        {activeDrilldownParent ? (
          <div className="drilldown-wrapper">
            {/* Botón de retorno / Encabezado del Sub-menú */}
            <button 
              onClick={() => setActiveDrilldownParent(null)}
              className="sidebar-back-btn"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{activeDrilldownParent.option_de}</span>
            </button>

            {/* Lista de sub-opciones */}
            <div className="sidebar-sub-list">
              {getChildren(activeDrilldownParent.option_id).map((child) => {
                const isActive = String(selectedOptionId) === String(child.option_id);
                return (
                  <button
                    key={child.option_id}
                    onClick={() => onSelectOption(child)}
                    className={`sidebar-item sub-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="item-content">
                      {getOptionIcon(child.option_de)}
                      <span className="item-label">{child.option_de}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* VISTA PRINCIPAL (Opciones Raíz) */
          <div className="sidebar-root-list">
            {sortedRootOptions.map((root) => {
              const children = getChildren(root.option_id);
              const hasChildren = children.length > 0;
              const isActive = String(selectedOptionId) === String(root.option_id);

              return (
                <button
                  key={root.option_id}
                  onClick={() => handleRootClick(root)}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <div className="item-content">
                    {getOptionIcon(root.option_de)}
                    <span className="item-label">{root.option_de}</span>
                  </div>
                  {hasChildren && (
                    <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;