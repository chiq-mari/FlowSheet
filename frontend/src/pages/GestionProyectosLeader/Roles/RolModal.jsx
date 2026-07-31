import React, { useState, useEffect } from 'react';
import Modal from '../../../componentes/ui/Modal';
import '../MisProyectos/ProyectoModal.css';

export function RolModal({ isOpen, onClose, onSave, role = null }) {
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state on open/change
  useEffect(() => {
    if (role) {
      setName(role.name);
    } else {
      setName('');
    }
    setErrorMsg('');
  }, [role, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del rol es obligatorio.');
      return;
    }

    onSave({
      id: role ? role.id : null,
      name: name.trim()
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? 'Editar Rol' : 'Nuevo Rol'}
      icon="briefcase"
      tone="warning"
    >
      <form onSubmit={handleSubmit} className="proyecto-form">
        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <div className="proyecto-form-group">
          <label htmlFor="role-name" className="proyecto-form-label">
            NOMBRE DEL ROL
          </label>
          <input
            id="role-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Desarrollador Backend"
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
            className="proyecto-btn-submit btn-orange"
          >
            {role ? 'Guardar' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default RolModal;
