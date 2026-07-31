import React, { useState, useEffect } from 'react';
import Modal from '../../../componentes/ui/Modal';
import '../MisProyectos/ProyectoModal.css';

export function ActividadModal({ isOpen, onClose, onSave, activity = null, statuses = [] }) {
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state on open/change
  useEffect(() => {
    if (activity) {
      setName(activity.name);
    } else {
      setName('');
    }
    setErrorMsg('');
  }, [activity, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la actividad es obligatorio.');
      return;
    }

    // Default to 'En desarrollo' status ID (or first available) if creating a new activity
    let statusId = activity ? activity.status_id : null;
    if (!statusId) {
      const enDesarrollo = statuses.find(s => s.status_de.toLowerCase().includes('desarrollo') || s.status_de.toLowerCase().includes('progreso'));
      statusId = enDesarrollo ? enDesarrollo.status_id : (statuses[0]?.status_id || 'a666746d-1ebe-491c-acfc-e8fdcabaf958');
    }

    onSave({
      id: activity ? activity.id : null,
      name: name.trim(),
      statusId
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Editar Actividad' : 'Nueva Actividad'}
      icon="folder"
      tone="info"
    >
      <form onSubmit={handleSubmit} className="proyecto-form">
        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <div className="proyecto-form-group">
          <label htmlFor="activity-name" className="proyecto-form-label">
            NOMBRE DE LA ACTIVIDAD
          </label>
          <input
            id="activity-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Diseño de base de datos"
            className="proyecto-form-input"
            required
            maxLength={100}
          />
        </div>

        <div className="proyecto-modal-actions">
          <button
            type="button"
            className="proyecto-btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="proyecto-btn-submit btn-blue"
          >
            {activity ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ActividadModal;
