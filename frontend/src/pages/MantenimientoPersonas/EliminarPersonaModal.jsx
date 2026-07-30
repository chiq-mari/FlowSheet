import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import './PersonaModal.css';

// Modal de confirmación de borrado (icono papelera). No sabe nada de fetch,
// solo dispara onConfirm y reporta si algo salió mal.
const EliminarPersonaModal = ({ count, onClose, onConfirm, error }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm();
    setSubmitting(false);
  };

  return (
    <Modal title="Confirmar eliminación" icon="trash" tone="danger" onClose={onClose}>
      <div className="persona-delete-body">
        <p>
          ¿Estás seguro de que deseas eliminar <strong>{count} persona{count !== 1 ? 's' : ''}</strong>?
          <br />
          Esta acción no se puede deshacer.
        </p>

        {error && <p className="persona-modal-error">{error}</p>}

        <div className="persona-modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EliminarPersonaModal;
