import React, { useState, useEffect } from 'react';
import Modal from '../../../componentes/ui/Modal';

export function ActividadModal({ isOpen, onClose, onSave, activity = null, statuses = [] }) {
  const [name, setName] = useState('');
  const [statusId, setStatusId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state on open/change
  useEffect(() => {
    if (activity) {
      setName(activity.name);
      setStatusId(activity.status_id);
    } else {
      setName('');
      // Default to the first available status
      if (statuses.length > 0) {
        setStatusId(statuses[0].status_id);
      } else {
        setStatusId('');
      }
    }
    setErrorMsg('');
  }, [activity, isOpen, statuses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la actividad es obligatorio.');
      return;
    }
    if (!statusId) {
      setErrorMsg('El estado es obligatorio.');
      return;
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
    >
      <form onSubmit={handleSubmit} className="project-modal-form">
        {errorMsg && <div className="error-badge">{errorMsg}</div>}

        <div className="form-group">
          <label htmlFor="activity-name">Nombre de la Actividad</label>
          <input
            id="activity-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Análisis de base de datos actual"
            className="form-control"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="activity-status">Estado</label>
          <select
            id="activity-status"
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="form-control"
            required
          >
            <option value="" disabled>Selecciona un estado</option>
            {statuses.map((st) => (
              <option key={st.status_id} value={st.status_id}>
                {st.status_de}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions-buttons">
          <button
            type="button"
            className="btn-secondary-flat"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary-flat"
          >
            {activity ? 'Guardar Cambios' : 'Crear Actividad'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ActividadModal;
