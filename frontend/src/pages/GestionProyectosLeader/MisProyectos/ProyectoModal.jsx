import React, { useState, useEffect } from 'react';
import Modal from '../../../componentes/ui/Modal';
import './ProyectoModal.css';

export function ProyectoModal({ isOpen, onClose, onSave, proyect = null, statuses = [] }) {
  const [name, setName] = useState('');
  const [statusId, setStatusId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when modal opens or proyect changes
  useEffect(() => {
    if (proyect) {
      setName(proyect.name);
      setStatusId(proyect.status_id);
    } else {
      setName('');
      // Default to 'En desarrollo' status if available
      const enDesarrollo = statuses.find(s => s.status_de.toLowerCase().includes('desarrollo') || s.status_de.toLowerCase().includes('progreso'));
      setStatusId(enDesarrollo ? enDesarrollo.status_id : (statuses[0]?.status_id || ''));
    }
    setErrorMsg('');
  }, [proyect, isOpen, statuses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del proyecto es obligatorio.');
      return;
    }
    if (!statusId) {
      setErrorMsg('Debe seleccionar un estado para el proyecto.');
      return;
    }
    onSave({ id: proyect?.id, name: name.trim(), statusId });
  };

  const title = proyect ? 'Editar Proyecto' : 'Nuevo Proyecto';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon="folder">
      <form onSubmit={handleSubmit} className="proyecto-form">
        {errorMsg && <div className="error-alert">{errorMsg}</div>}
        
        <div className="proyecto-form-group">
          <label className="proyecto-form-label">NOMBRE DEL PROYECTO</label>
          <input 
            type="text"
            className="proyecto-form-input"
            placeholder="Ej: Portal Web Corporativo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={150}
          />
        </div>

        <div className="proyecto-form-group">
          <label className="proyecto-form-label">ESTADO</label>
          <select
            className="proyecto-form-select"
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s.status_id} value={s.status_id}>
                {s.status_de === 'En desarrollo' ? 'En Progreso' : s.status_de}
              </option>
            ))}
          </select>
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
            className={`proyecto-btn-submit ${proyect ? 'btn-save-edit' : ''}`}
          >
            {proyect ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProyectoModal;
