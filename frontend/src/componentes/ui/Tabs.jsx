import React from 'react';
import './Tabs.css';

const DOT_COLORS = { blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981' };
const TEXT_COLORS = { blue: '#1d4ed8', purple: '#6d28d9', green: '#047857' };

// Barra de pestañas genérica. `tabs` es [{ id, label, color? }] — `color` es
// opcional ('blue' | 'purple' | 'green'): si viene, pinta un punto antes del
// label y usa ese color para el texto/subrayado cuando esa pestaña está activa.
// Sin `color`, se ve como una pestaña plana normal (uso de Mantenimiento de Perfiles).
const Tabs = ({ tabs, active, onChange }) => {
  return (
    <div className="ui-tabs">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const style = isActive && tab.color
          ? { color: TEXT_COLORS[tab.color], borderBottomColor: TEXT_COLORS[tab.color] }
          : undefined;

        return (
          <button
            key={tab.id}
            type="button"
            className={`ui-tab ${isActive ? 'active' : ''}`}
            style={style}
            onClick={() => onChange(tab.id)}
          >
            {tab.color && <span className="ui-tab-dot" style={{ backgroundColor: DOT_COLORS[tab.color] }} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
