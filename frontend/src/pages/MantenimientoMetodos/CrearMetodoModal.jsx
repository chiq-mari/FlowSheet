import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import MetodoFormFields from './MetodoFormFields';
import '../../componentes/ui/ModalForm.css';

const emptyForm = { subSystemId: '', objectId: '', methodDe: '' };

// Modal de alta ("+"). Solo sabe recolectar los campos y delegar el guardado al padre.
const CrearMetodoModal = ({ onClose, onSubmit, error }) => {
  const [values, setValues] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(values);
    setSubmitting(false);
  };

  return (
    <Modal title="Nuevo Método" icon="code" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <MetodoFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

        {error && <p className="modal-form-error">{error}</p>}

        <div className="modal-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CrearMetodoModal;
