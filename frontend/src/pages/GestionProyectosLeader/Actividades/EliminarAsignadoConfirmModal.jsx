import React from 'react';
import Modal from '../../../componentes/ui/Modal';

export function EliminarAsignadoConfirmModal({ isOpen, onClose, onConfirm, username = '' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar asignación"
      icon="trash"
      tone="danger"
    >
      <div className="proyecto-form">
        <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1.5rem', textAlign: 'center' }}>
          ¿Remover a <strong>{username}</strong> de esta actividad? Esta acción no se puede deshacer.
        </p>
        <div className="proyecto-modal-actions">
          <button
            type="button"
            className="proyecto-btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="proyecto-btn-submit btn-red"
            onClick={onConfirm}
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default EliminarAsignadoConfirmModal;
