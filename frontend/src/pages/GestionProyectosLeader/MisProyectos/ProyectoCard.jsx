import React from 'react';
import ProyectoStatusBadge from './ProyectoStatusBadge';
import ProyectoMetricTag from './ProyectoMetricTag';
import EditButton from '../../../componentes/ui/EditButton';
import DeleteButton from '../../../componentes/ui/DeleteButton';

export function ProyectoCard({ proyect, onEdit, onDelete }) {
  const getIcon = () => {
    const lowerName = proyect.name.toLowerCase();
    if (lowerName.includes('app') || lowerName.includes('móvil') || lowerName.includes('mobile')) {
      return (
        <svg className="project-card-illustration" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (lowerName.includes('base') || lowerName.includes('datos') || lowerName.includes('db') || lowerName.includes('nube') || lowerName.includes('aws') || lowerName.includes('migración')) {
      return (
        <svg className="project-card-illustration" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    }
    if (lowerName.includes('banco') || lowerName.includes('finanzas') || lowerName.includes('bi') || lowerName.includes('reportes') || lowerName.includes('sistema') || lowerName.includes('facturación')) {
      return (
        <svg className="project-card-illustration" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
    // Default folder
    return (
      <svg className="project-card-illustration" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    );
  };

  const getGradientClass = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['bg-blue-grad', 'bg-purple-grad', 'bg-orange-grad', 'bg-green-grad', 'bg-teal-grad'];
    return colors[hash % colors.length];
  };

  return (
    <div className="project-card">
      <div className="project-card-left">
        <div className={`project-card-icon-container ${getGradientClass(proyect.name)}`}>
          {getIcon()}
        </div>
        <div className="project-card-info">
          <h3 className="project-card-title">{proyect.name}</h3>
          <div className="project-card-tags">
            <ProyectoMetricTag count={proyect.activities_count || 0} label="act." type="activities" />
            <ProyectoMetricTag count={proyect.members_count || 0} label="miembros" type="members" />
            <ProyectoMetricTag count={proyect.roles_count || 0} label="roles" type="roles" />
          </div>
        </div>
      </div>
      <div className="project-card-right">
        <ProyectoStatusBadge statusDe={proyect.status_de} />
        <div className="project-card-actions">
          <EditButton onClick={() => onEdit(proyect)} />
          <DeleteButton onClick={() => onDelete(proyect.id, proyect.name)} />
        </div>
      </div>
    </div>
  );
}

export default ProyectoCard;
