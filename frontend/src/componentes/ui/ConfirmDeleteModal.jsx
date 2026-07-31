import React, { useState } from 'react';
import Modal from './Modal';
import './ModalForm.css';

// Modal de confirmación de borrado genérico (icono papelera). No sabe nada de
// fetch ni de qué feature lo usa — solo dispara onConfirm y reporta el error.
// itemLabel es el sustantivo en singular (ej. "persona", "usuario").
const ConfirmDeleteModal = ({ count, itemLabel, onClose, onConfirm, error }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm();
    setSubmitting(false);
  };

  return (
    <Modal title="Confirmar eliminación" icon="trash" tone="danger" onClose={onClose}>
      <div className="confirm-delete-body">
        <p>
          ¿Estás seguro de que deseas eliminar <strong>{count} {itemLabel}{count !== 1 ? 's' : ''}</strong>?
          <br />
          Esta acción no se puede deshacer.
        </p>

        {error && <p className="modal-form-error">{error}</p>}

        <div className="modal-form-actions">
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

export default ConfirmDeleteModal;
